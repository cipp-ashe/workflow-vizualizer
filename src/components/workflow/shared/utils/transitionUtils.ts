/**
 * Utilities for working with workflow transitions
 */
import { Edge } from "reactflow";
import { WorkflowTask } from "../types";

/**
 * Common edge configuration for consistent styling
 */
interface EdgeConfig {
  type: string;
  animated: boolean;
  style: {
    strokeWidth: number;
    strokeOpacity?: number;
    strokeDasharray?: string;
    stroke: string;
  };
  pathOptions?: {
    offset: number;
    borderRadius: number;
  };
}

/**
 * Create a base edge configuration
 * @param color The color for the edge
 * @param isDashed Whether the edge should be dashed
 * @returns The edge configuration
 */
function createEdgeConfig(
  color: string,
  isDashed: boolean = false
): EdgeConfig {
  return {
    type: "smoothstep",
    animated: true,
    style: {
      stroke: color,
      strokeWidth: 3,
      strokeOpacity: 0.8,
      strokeDasharray: isDashed ? "5, 5" : undefined,
    },
    pathOptions: {
      offset: 15,
      borderRadius: 8,
    },
  };
}

/**
 * Get the color for a transition based on its properties
 * @param transition The transition to get the color for
 * @returns The color for the transition
 */
export function getTransitionColor(transition: {
  when?: string;
  do?: string[];
}): string {
  if (transition.when) {
    return "hsl(var(--workflow-yellow))"; // Conditional transition
  } else if (transition.do && transition.do.length > 1) {
    return "hsl(var(--workflow-purple))"; // Multiple targets
  } else {
    return "hsl(var(--workflow-blue))"; // Default transition
  }
}

/**
 * Get the display label for a transition
 * @param transition The transition to get the label for
 * @returns The display label for the transition
 */
export function formatTransitionLabel(transition: {
  when?: string;
  publish?: Array<{ key: string; value: string }>;
  label?: string;
}): string {
  // If there's a custom label, use it
  if (transition.label) {
    return transition.label;
  }

  // If there's a condition, extract a simplified version
  if (transition.when) {
    // Try to extract a meaningful part from the condition
    // Look for patterns like {{ SUCCEEDED }}, {{ FAILED }}, etc.
    const successMatch = transition.when.match(
      /\{\{\s*(?:SUCCEEDED|SUCCESS)\s*\}\}/i
    );
    if (successMatch) {
      return "Success";
    }

    const failedMatch = transition.when.match(
      /\{\{\s*(?:FAILED|FAILURE)\s*\}\}/i
    );
    if (failedMatch) {
      return "Failure";
    }

    // Extract text between {{ and }}
    const templateMatch = transition.when.match(/\{\{\s*([^}]+)\s*\}\}/);
    if (templateMatch) {
      return templateMatch[1].trim();
    }

    // If no pattern matches, return a generic label
    return "Conditional";
  }

  // Default label
  return "Transition";
}

/**
 * Create edges from task transitions
 * @param task The task to create edges from
 * @param processedEdgeIds Set of already processed edge IDs to avoid duplicates
 * @returns Array of edges
 */
export function createEdgesFromTransitions(
  task: WorkflowTask,
  processedEdgeIds: Set<string>
): Edge[] {
  if (!task.next || task.next.length === 0) {
    return [];
  }

  const edges: Edge[] = [];

  task.next.forEach((transition, index) => {
    if (!transition.do || transition.do.length === 0) {
      return;
    }

    const sourceHandleId = `transition-${index}`;
    const transitionColor = getTransitionColor(transition);
    const isMultiTarget = transition.do && transition.do.length > 1;
    const label = formatTransitionLabel(transition);

    transition.do.forEach((targetId) => {
      const edgeId = `${task.id}-${sourceHandleId}-${targetId}`;

      // Skip if already processed
      if (processedEdgeIds.has(edgeId)) {
        return;
      }

      processedEdgeIds.add(edgeId);

      // Get edge configuration based on transition type
      const edgeConfig = createEdgeConfig(transitionColor, !!transition.when);

      edges.push({
        id: edgeId,
        source: task.id,
        target: targetId,
        sourceHandle: sourceHandleId,
        ...edgeConfig,
        data: {
          label, // Keep the label in the data property for reference
          condition: transition.when,
          followType: isMultiTarget ? "all" : "first",
          publish: transition.publish,
        },
      });
    });
  });

  return edges;
}

/**
 * Creates edges from trigger nodes to the first task in a workflow
 * @param triggerNodes Array of trigger nodes
 * @param firstTaskId The ID of the first task in the workflow
 * @param processedEdgeIds A set of already processed edge IDs to avoid duplicates
 * @returns An array of created edges
 */
export function createTriggerEdges(
  triggerNodes: { id: string }[],
  firstTaskId: string,
  processedEdgeIds: Set<string>
): Edge[] {
  const edges: Edge[] = [];

  if (!firstTaskId || triggerNodes.length === 0) {
    return edges;
  }

  triggerNodes.forEach((triggerNode) => {
    const edgeId = `${triggerNode.id}-${firstTaskId}`;
    if (processedEdgeIds.has(edgeId)) {
      return;
    }

    // Get edge configuration for trigger edges
    const triggerEdgeConfig = createEdgeConfig("hsl(var(--workflow-orange))");
    triggerEdgeConfig.style.strokeDasharray = "8, 4"; // Special dashing for triggers

    edges.push({
      id: edgeId,
      source: triggerNode.id,
      target: firstTaskId,
      ...triggerEdgeConfig,
      data: {
        followType: "trigger",
      },
    });

    processedEdgeIds.add(edgeId);
  });

  return edges;
}
