/**
 * Utilities for working with workflow triggers
 */
import { WorkflowBundle } from "../../../../types/workflow";

/**
 * Trigger information interface
 */
export interface TriggerInfo {
  id: string;
  name: string;
  type: string;
  workflowId: string;
  parameters: Record<string, unknown>;
  enabled: boolean;
}

/**
 * Extract trigger information from a workflow bundle
 * @param bundle The workflow bundle
 * @returns Array of trigger information
 */
export function extractTriggers(bundle: WorkflowBundle): TriggerInfo[] {
  const triggers: TriggerInfo[] = [];

  // Find all trigger objects
  Object.entries(bundle.objects).forEach(([key, obj]) => {
    if (obj.type === "trigger") {
      const triggerObj = obj;
      const workflowId = triggerObj.fields.workflowId as string;
      const triggerTypeId = triggerObj.fields.triggerTypeId as string;

      // Find the trigger type object
      const triggerType = Object.values(bundle.objects).find(
        (o) => o.hash === triggerTypeId || o.content_hash === triggerTypeId
      );

      // Extract trigger information
      triggers.push({
        id: key,
        name: triggerObj.nonfunctional_fields?.name || "Trigger",
        type: (triggerType?.fields?.ref as string) || "unknown",
        workflowId,
        parameters:
          (triggerObj.fields.parameters as Record<string, unknown>) || {},
        enabled: (triggerObj.fields.enabled as boolean) || false,
      });
    }
  });

  return triggers;
}

/**
 * Group triggers by workflow ID
 * @param triggers Array of trigger information
 * @returns Map of workflow ID to array of triggers
 */
export function groupTriggersByWorkflow(
  triggers: TriggerInfo[]
): Map<string, TriggerInfo[]> {
  const groupedTriggers = new Map<string, TriggerInfo[]>();

  triggers.forEach((trigger) => {
    if (!groupedTriggers.has(trigger.workflowId)) {
      groupedTriggers.set(trigger.workflowId, []);
    }

    groupedTriggers.get(trigger.workflowId)!.push(trigger);
  });

  return groupedTriggers;
}

/**
 * Trigger edge interface
 */
export interface TriggerEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  style: { stroke: string };
  data: {
    triggerType: string;
  };
}

/**
 * Create edges connecting triggers to their workflows
 * @param triggers Array of trigger information
 * @returns Array of edges
 */
export function createTriggerEdges(triggers: TriggerInfo[]): TriggerEdge[] {
  const edges: TriggerEdge[] = [];

  triggers.forEach((trigger) => {
    edges.push({
      id: `trigger-${trigger.id}-${trigger.workflowId}`,
      source: trigger.id,
      target: trigger.workflowId,
      type: "trigger",
      animated: true,
      style: { stroke: "#ff9900" },
      data: {
        triggerType: trigger.type,
      },
    });
  });

  return edges;
}
