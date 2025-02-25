import { useCallback, useEffect } from "react";
import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import { WorkflowBundle, WorkflowObject } from "@/types/workflow";
import { LAYOUT_CONSTANTS } from "../constants/layoutConstants";

/**
 * Hook for processing workflow data into nodes and edges
 * @param template The workflow bundle containing the objects
 * @param selectedWorkflowId Optional ID of the selected workflow
 * @param handleSubWorkflowClick Optional callback for sub-workflow navigation
 * @returns Processed nodes, edges, and handlers
 */
export function useWorkflowProcessor(
  template: WorkflowBundle,
  selectedWorkflowId?: string | null,
  handleSubWorkflowClick?: (subWorkflowId: string) => void
) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const resolveReference = useCallback(
    (refId: string, template: WorkflowBundle) => {
      if (!template?.references || !template?.objects) return null;

      const reference = Object.entries(template.references).find(([, ref]) =>
        ref.locations?.some((loc) => loc.includes(refId))
      );

      if (!reference) return null;

      const actualObject = Object.values(template.objects).find(
        (obj) => obj.hash === reference[1].src_key_hash
      );

      return actualObject;
    },
    []
  );

  const getTaskMetadata = useCallback(
    (taskIndex: number, workflow: WorkflowObject) => {
      const metadataKey = `tasks[${taskIndex}].metadata`;
      return workflow.nonfunctional_fields?.[metadataKey] as
        | { x: number; y: number; clonedFromId?: string }
        | undefined;
    },
    []
  );

  const getTaskDescription = useCallback(
    (taskIndex: number, workflow: WorkflowObject) => {
      const descKey = `tasks[${taskIndex}].description`;
      return workflow.nonfunctional_fields?.[descKey] as string | undefined;
    },
    []
  );

  const getTransitionLabel = useCallback(
    (taskIndex: number, transitionIndex: number, workflow: WorkflowObject) => {
      const labelKey = `tasks[${taskIndex}].next[${transitionIndex}].label`;
      return workflow.nonfunctional_fields?.[labelKey] as string | undefined;
    },
    []
  );

  const detectJinjaTemplates = useCallback((obj: unknown): boolean => {
    if (!obj) return false;
    if (typeof obj === "string") {
      return obj.includes("{{") && obj.includes("}}");
    }
    if (Array.isArray(obj)) {
      return obj.some((item) => detectJinjaTemplates(item));
    }
    if (typeof obj === "object") {
      return Object.values(obj).some((value) => detectJinjaTemplates(value));
    }
    return false;
  }, []);

  const processTemplate = useCallback(() => {
    if (!template?.objects) {
      console.error("Invalid template structure - no objects found");
      return;
    }

    // If a specific workflow ID is provided, use that workflow
    // Otherwise, find the first workflow in the template
    const mainWorkflow = selectedWorkflowId
      ? Object.values(template.objects).find(
          (obj) =>
            obj.fields?.id === selectedWorkflowId && obj.type === "workflow"
        )
      : Object.values(template.objects).find(
          (obj) => obj.type === "workflow" && Array.isArray(obj.fields?.tasks)
        );

    if (!mainWorkflow?.fields?.tasks) {
      console.error("No workflow tasks found");
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const processedEdges = new Set<string>();

    // First pass: collect all node positions to calculate proper spacing
    const nodePositions: { x: number; y: number }[] = [];
    mainWorkflow.fields.tasks.forEach((_, index) => {
      const metadata = getTaskMetadata(index, mainWorkflow);
      if (metadata) {
        nodePositions.push({ x: metadata.x, y: metadata.y });
      }
    });

    // Calculate minimum distances between nodes
    let minX = Infinity;
    let minY = Infinity;

    // Find the minimum X and Y values for offset calculation
    nodePositions.forEach((pos) => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
    });

    // Calculate offsets to ensure all nodes are in positive space
    const offsetX =
      minX === Infinity
        ? 0
        : minX < 0
        ? Math.abs(minX) + LAYOUT_CONSTANTS.NODE_PADDING
        : LAYOUT_CONSTANTS.NODE_PADDING;
    const offsetY =
      minY === Infinity
        ? 0
        : minY < 0
        ? Math.abs(minY) + LAYOUT_CONSTANTS.NODE_PADDING
        : LAYOUT_CONSTANTS.NODE_PADDING;

    // Ensure minimum spacing between nodes with the same coordinates
    const usedPositions = new Map<string, boolean>();

    mainWorkflow.fields.tasks.forEach((task, index) => {
      if (!task?.id) return;

      const taskObj = resolveReference(task.id, template);
      const metadata = getTaskMetadata(index, mainWorkflow);
      const description = getTaskDescription(index, mainWorkflow);

      let actionDetails;
      if (task.action?.id) {
        const actionObj = resolveReference(task.action.id, template);
        if (actionObj) {
          actionDetails = {
            ref: actionObj.fields?.ref,
            name: actionObj.nonfunctional_fields?.name || actionObj.fields?.ref,
            description: actionObj.nonfunctional_fields?.description,
          };
        }
      }

      // Calculate initial position
      let posX = metadata
        ? metadata.x + offsetX
        : index * LAYOUT_CONSTANTS.DEFAULT_SPACING;
      let posY = metadata
        ? metadata.y + offsetY
        : index % 2 === 0
        ? LAYOUT_CONSTANTS.NODE_PADDING
        : LAYOUT_CONSTANTS.NODE_HEIGHT +
          LAYOUT_CONSTANTS.TAB_HEIGHT +
          LAYOUT_CONSTANTS.VERTICAL_SPACING;

      // Ensure nodes don't overlap by checking if position is already used
      let positionKey = `${Math.round(posX)},${Math.round(posY)}`;
      let positionAttempt = 0;

      // If position is already used, shift it until we find an unused position
      while (usedPositions.has(positionKey) && positionAttempt < 10) {
        // Try different directions based on attempt number
        if (positionAttempt % 4 === 0) {
          posX += LAYOUT_CONSTANTS.DEFAULT_SPACING;
        } else if (positionAttempt % 4 === 1) {
          posY += LAYOUT_CONSTANTS.VERTICAL_SPACING;
        } else if (positionAttempt % 4 === 2) {
          posX -= LAYOUT_CONSTANTS.DEFAULT_SPACING;
        } else {
          posY -= LAYOUT_CONSTANTS.VERTICAL_SPACING;
        }

        positionKey = `${Math.round(posX)},${Math.round(posY)}`;
        positionAttempt++;
      }

      // Mark this position as used
      usedPositions.set(positionKey, true);

      const position = {
        x: posX,
        y: posY,
      };

      const hasJinjaTemplates =
        detectJinjaTemplates(task.input) ||
        detectJinjaTemplates(task.action) ||
        detectJinjaTemplates(task.next);

      // Check if this task is a sub-workflow task
      const isSubWorkflowTask = taskObj?.type === "workflow";
      const subWorkflowId = isSubWorkflowTask ? taskObj?.hash : undefined;

      newNodes.push({
        id: task.id,
        type: "task",
        position,
        data: {
          id: task.id, // Pass the ID to the node data
          name: task.name || taskObj?.nonfunctional_fields?.name || "Task",
          description:
            description ||
            task.description ||
            taskObj?.nonfunctional_fields?.description,
          action: actionDetails,
          input: task.input,
          output: taskObj?.fields?.output,
          timeout: task.timeout,
          transitionMode: task.transitionMode,
          humanSecondsSaved: task.humanSecondsSaved,
          publishResultAs: task.publishResultAs,
          type: taskObj?.type,
          isMocked: task.isMocked,
          retry: task.retry,
          runAsOrgId: task.runAsOrgId,
          securitySchema: task.securitySchema,
          packOverrides: task.packOverrides,
          hasJinjaTemplates,
          // Add sub-workflow information if applicable
          isSubWorkflowTask,
          subWorkflowId,
          onSubWorkflowClick: handleSubWorkflowClick,
          next: task.next?.map((transition, idx) => ({
            when: transition.when,
            label: getTransitionLabel(index, idx, mainWorkflow),
            followType:
              transition.do && transition.do.length > 1 ? "all" : "first",
          })),
        },
      });

      if (Array.isArray(task.next)) {
        task.next.forEach((transition, transitionIndex) => {
          if (Array.isArray(transition?.do)) {
            const isFollowAll = transition.do && transition.do.length > 1;

            transition.do.forEach((targetId) => {
              if (!targetId) return;

              const edgeId = `${task.id}-${targetId}`;
              if (!processedEdges.has(edgeId)) {
                // Get transition label for the tab (used in the node data)
                // Edge creation information (removed console.log for production)

                newEdges.push({
                  id: edgeId,
                  source: task.id,
                  sourceHandle: `transition-${transitionIndex}`,
                  target: targetId,
                  animated: true,
                  // Remove label from edge since it's already in the tab
                  style: {
                    stroke: `hsl(var(--workflow-${
                      isFollowAll ? "green" : "blue"
                    }))`,
                    strokeWidth: 2,
                  },
                  type: "step",
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                  },
                  data: {
                    condition: transition.when,
                    followType: isFollowAll ? "all" : "first",
                    transitionIndex: transitionIndex,
                  },
                });
                processedEdges.add(edgeId);
              }
            });
          }
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [
    template,
    selectedWorkflowId,
    handleSubWorkflowClick,
    setNodes,
    setEdges,
    resolveReference,
    getTaskMetadata,
    getTaskDescription,
    getTransitionLabel,
    detectJinjaTemplates,
  ]);

  useEffect(() => {
    processTemplate();
  }, [processTemplate, selectedWorkflowId]);

  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    clearWorkflow,
  };
}
