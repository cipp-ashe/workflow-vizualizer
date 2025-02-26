/**
 * Hook for processing workflow data into nodes and edges
 */
import { useCallback, useEffect, useMemo } from "react";
import { Node, Edge, useNodesState, useEdgesState } from "reactflow";
import { WorkflowBundle, Task } from "../../../../types/workflow";
import { WorkflowTask } from "../../shared/types";
import { WorkflowProcessorHookResult } from "../types";
import { createEdgesFromTransitions } from "../../shared/utils/transitionUtils";
import {
  extractTriggers,
  createTriggerEdges,
} from "../../shared/utils/triggerUtils";
import { LayoutEngine, DagLayout } from "../layout";
import { DEFAULT_LAYOUT_CONFIG } from "../../shared/constants";

/**
 * Hook for processing workflow data into nodes and edges
 * @param template The workflow template
 * @param selectedWorkflowId The selected workflow ID
 * @param onSubWorkflowClick Callback for sub-workflow clicks
 * @returns Workflow processing state and handlers
 */
export function useWorkflowProcessor(
  template: WorkflowBundle,
  selectedWorkflowId: string | null,
  onSubWorkflowClick: (workflowId: string) => void
): WorkflowProcessorHookResult {
  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Layout engine for positioning nodes
  const layoutEngine = useMemo(() => {
    return new LayoutEngine(
      new DagLayout(),
      DEFAULT_LAYOUT_CONFIG as unknown as import("../../shared/types").LayoutConfig
    );
  }, []);

  /**
   * Process workflow data into nodes and edges
   */
  const processWorkflow = useCallback(() => {
    if (!template || !selectedWorkflowId) {
      console.log("No template or selectedWorkflowId", {
        template,
        selectedWorkflowId,
      });
      setNodes([]);
      setEdges([]);
      return;
    }

    console.log("Processing workflow", {
      template,
      selectedWorkflowId,
      objectsCount: Object.keys(template.objects).length,
      objectTypes: Object.values(template.objects)
        .map((obj) => obj.type)
        .filter((v, i, a) => a.indexOf(v) === i),
    });

    // Find the selected workflow
    let selectedWorkflow;

    // First try to find the workflow by its ID in fields
    selectedWorkflow = Object.values(template.objects).find(
      (obj) => obj.type === "workflow" && obj.fields?.id === selectedWorkflowId
    );

    // If not found, try to find it by the key in the objects map
    if (!selectedWorkflow) {
      selectedWorkflow = template.objects[selectedWorkflowId];
    }

    // If still not found, try to extract the ID part from the selectedWorkflowId
    if (!selectedWorkflow && selectedWorkflowId.includes(":")) {
      const idPart = selectedWorkflowId.split(":")[1];
      selectedWorkflow = Object.values(template.objects).find(
        (obj) =>
          obj.type === "workflow" &&
          (obj.fields?.id === idPart ||
            (obj as unknown as Record<string, string>).id === idPart)
      );
    }

    console.log("Selected workflow", { selectedWorkflow, selectedWorkflowId });

    if (!selectedWorkflow || !selectedWorkflow.fields?.tasks) {
      console.log("No selected workflow or tasks", {
        hasSelectedWorkflow: !!selectedWorkflow,
        hasTasks: selectedWorkflow ? !!selectedWorkflow.fields?.tasks : false,
      });

      // Try a different approach if the structure is different
      if (selectedWorkflow && !selectedWorkflow.fields?.tasks) {
        console.log("Trying alternative task structure", selectedWorkflow);

        // Check if tasks might be at a different location in the object
        // Use type assertion to access potential properties not in the type
        const workflowAny = selectedWorkflow as unknown as Record<
          string,
          unknown
        >;
        const tasksObj =
          workflowAny.tasks ||
          (workflowAny.fields as Record<string, unknown>)?.workflow_tasks;

        if (tasksObj) {
          const tasks = Array.isArray(tasksObj)
            ? tasksObj
            : Object.values(tasksObj);
          console.log("Found tasks in alternative location", { tasks });

          // Process tasks into nodes
          const processedNodes: Node[] = tasks.map((taskUnknown) => {
            const task = taskUnknown as Record<string, unknown>;
            const taskId =
              (task.id as string) ||
              (task.workflow_task_id as string) ||
              `task-${Math.random().toString(36).substring(2, 9)}`;

            return {
              id: taskId,
              type: "task",
              position: {
                x: (task.metadata as Record<string, number>)?.x || 0,
                y: (task.metadata as Record<string, number>)?.y || 0,
              },
              data: {
                ...task,
                id: taskId, // Ensure id is set in data
                name: (task.name as string) || taskId,
                onSubWorkflowClick,
              },
            };
          });

          // Apply layout if needed
          const hasPositions = processedNodes.some(
            (node) => node.position.x !== 0 || node.position.y !== 0
          );

          if (!hasPositions && processedNodes.length > 0) {
            // Apply automatic layout
            const positionedNodes = layoutEngine.applyLayout(
              processedNodes,
              [] // No edges for now
            );
            setNodes(positionedNodes);
          } else {
            setNodes(processedNodes);
          }

          setEdges([]);
          return;
        }
      }

      setNodes([]);
      setEdges([]);
      return;
    }

    // Process tasks into nodes
    const tasks = selectedWorkflow.fields.tasks as Task[];
    const processedNodes: Node[] = tasks.map((task, index) => {
      // Extract transition labels from nonfunctional_fields
      const next = task.next?.map((transition, transitionIndex) => {
        const labelKey = `tasks[${index}].next[${transitionIndex}].label`;
        const label = selectedWorkflow.nonfunctional_fields?.[labelKey] as
          | string
          | undefined;

        return {
          ...transition,
          label: label || transition.label,
        };
      });

      return {
        id: task.id,
        type: "task",
        position: {
          x: task.metadata?.x || 0,
          y: task.metadata?.y || 0,
        },
        data: {
          ...task,
          next: next || task.next, // Use the updated next array with labels
          onSubWorkflowClick,
        },
      };
    });

    // Process transitions into edges
    let processedEdges: Edge[] = [];
    const processedEdgeIds = new Set<string>();

    tasks.forEach((task) => {
      const taskEdges = createEdgesFromTransitions(
        task as unknown as WorkflowTask,
        processedEdgeIds
      );
      processedEdges.push(...taskEdges);
    });

    // Add trigger edges if this is the main workflow
    if (selectedWorkflow && !selectedWorkflow.fields?.parent_workflow_id) {
      // Extract triggers from the workflow bundle
      const triggers = extractTriggers(template);

      // Create edges for triggers targeting this workflow
      const triggerEdges = createTriggerEdges(
        triggers.filter((t) => t.workflowId === selectedWorkflowId)
      );
      processedEdges = [...processedEdges, ...triggerEdges];
    }

    // Apply layout if needed
    const hasPositions = processedNodes.some(
      (node) => node.position.x !== 0 || node.position.y !== 0
    );

    if (!hasPositions && processedNodes.length > 0) {
      // Apply automatic layout
      const positionedNodes = layoutEngine.applyLayout(
        processedNodes,
        processedEdges
      );
      setNodes(positionedNodes);
    } else {
      setNodes(processedNodes);
    }

    setEdges(processedEdges);
  }, [
    template,
    selectedWorkflowId,
    onSubWorkflowClick,
    setNodes,
    setEdges,
    layoutEngine,
  ]);

  /**
   * Clear the workflow
   */
  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  // Process workflow when template or selected workflow changes
  useEffect(() => {
    processWorkflow();
  }, [processWorkflow]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    clearWorkflow,
  };
}
