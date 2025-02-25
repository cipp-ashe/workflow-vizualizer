import { Edge } from "reactflow";
import { Task } from "../../../types/workflow";
import { getTransitionLabel } from "./referenceUtils";
import { WorkflowObject } from "../../../types/workflow";

/**
 * Creates edges between tasks based on the task's transitions
 * @param task The source task
 * @param index The index of the task in the workflow
 * @param workflow The workflow object containing the task
 * @param processedEdges A set of already processed edge IDs to avoid duplicates
 * @returns An array of created edges
 */
export function createTaskEdges(
  task: Task,
  index: number,
  workflow: WorkflowObject,
  processedEdges: Set<string>
): Edge[] {
  const edges: Edge[] = [];

  if (!Array.isArray(task.next)) {
    return edges;
  }

  task.next.forEach((transition, transitionIndex) => {
    if (!Array.isArray(transition?.do)) {
      return;
    }

    const isFollowAll = transition.do && transition.do.length > 1;

    transition.do.forEach((targetId) => {
      if (!targetId) return;

      const edgeId = `${task.id}-${targetId}-${transitionIndex}`;
      if (processedEdges.has(edgeId)) {
        return;
      }

      const label = getTransitionLabel(index, transitionIndex, workflow);

      edges.push({
        id: edgeId,
        source: task.id,
        target: targetId,
        sourceHandle: `transition-${transitionIndex}`,
        animated: true,
        label: label || transition.label,
        style: {
          stroke: `hsl(var(--workflow-${isFollowAll ? "green" : "blue"}))`,
          strokeWidth: 3,
        },
        type: "smoothstep",
        data: {
          condition: transition.when,
          followType: isFollowAll ? "all" : "first",
        },
      });

      processedEdges.add(edgeId);
    });
  });

  return edges;
}

/**
 * Creates edges from trigger nodes to the first task in a workflow
 * @param triggerNodes Array of trigger nodes
 * @param firstTaskId The ID of the first task in the workflow
 * @param processedEdges A set of already processed edge IDs to avoid duplicates
 * @returns An array of created edges
 */
export function createTriggerEdges(
  triggerNodes: { id: string }[],
  firstTaskId: string,
  processedEdges: Set<string>
): Edge[] {
  const edges: Edge[] = [];

  if (!firstTaskId || triggerNodes.length === 0) {
    return edges;
  }

  triggerNodes.forEach((triggerNode) => {
    const edgeId = `${triggerNode.id}-${firstTaskId}`;
    if (processedEdges.has(edgeId)) {
      return;
    }

    edges.push({
      id: edgeId,
      source: triggerNode.id,
      target: firstTaskId,
      animated: true,
      style: {
        stroke: "hsl(var(--workflow-orange))",
        strokeWidth: 3,
        strokeDasharray: "8, 4", // More visible dashed line for triggers
      },
      type: "smoothstep",
      data: {
        followType: "trigger",
      },
    });

    processedEdges.add(edgeId);
  });

  return edges;
}
