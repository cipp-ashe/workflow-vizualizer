import { useCallback, useEffect } from "react";
import { Node, Edge, useNodesState, useEdgesState } from "reactflow";
import { WorkflowBundle, WorkflowObject } from "../../types/workflow";

const DEFAULT_SPACING = 250;

export function useWorkflowProcessor(template: WorkflowBundle) {
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

    const mainWorkflow = Object.values(template.objects).find(
      (obj) => obj.type === "workflow" && Array.isArray(obj.fields?.tasks)
    );

    if (!mainWorkflow?.fields?.tasks) {
      console.error("No workflow tasks found");
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const processedEdges = new Set<string>();

    let minX = Infinity;
    let minY = Infinity;
    mainWorkflow.fields.tasks.forEach((_, index) => {
      const metadata = getTaskMetadata(index, mainWorkflow);
      if (metadata) {
        minX = Math.min(minX, metadata.x);
        minY = Math.min(minY, metadata.y);
      }
    });

    const offsetX = minX === Infinity ? 0 : minX < 0 ? Math.abs(minX) : 0;
    const offsetY = minY === Infinity ? 0 : minY < 0 ? Math.abs(minY) : 0;

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

      const position = metadata
        ? {
            x: metadata.x + offsetX,
            y: metadata.y + offsetY,
          }
        : {
            x: index * DEFAULT_SPACING,
            y: index % 2 === 0 ? 0 : DEFAULT_SPACING,
          };

      const hasJinjaTemplates =
        detectJinjaTemplates(task.input) ||
        detectJinjaTemplates(task.action) ||
        detectJinjaTemplates(task.next);

      newNodes.push({
        id: task.id,
        type: "task",
        position,
        data: {
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
                const label = getTransitionLabel(
                  index,
                  transitionIndex,
                  mainWorkflow
                );
                // Log the edge creation for debugging
                console.log(
                  `Creating edge from ${task.id} to ${targetId} with transition index ${transitionIndex}`
                );

                newEdges.push({
                  id: edgeId,
                  source: task.id,
                  sourceHandle: `transition-${transitionIndex}`,
                  target: targetId,
                  animated: true,
                  label: label || transition.label,
                  style: {
                    stroke: `hsl(var(--workflow-${
                      isFollowAll ? "green" : "blue"
                    }))`,
                    strokeWidth: 2,
                  },
                  type: "smoothstep",
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
  }, [processTemplate]);

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
