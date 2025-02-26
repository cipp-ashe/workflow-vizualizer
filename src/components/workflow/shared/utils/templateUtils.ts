/**
 * Utility functions for working with workflow templates and Jinja templates
 */
import { WorkflowBundle, WorkflowObject } from "../types/workflowTypes";

/**
 * Extracts all workflows from the template
 * @param template The workflow bundle containing the objects
 * @returns An array of workflow objects with id, name, and taskCount
 */
export function getWorkflows(template: WorkflowBundle) {
  if (!template?.objects) return [];

  return Object.entries(template.objects)
    .filter(([, obj]) => obj.type === "workflow")
    .map(([id, obj]) => ({
      id,
      name: obj.nonfunctional_fields?.name || "Unnamed Workflow",
      taskCount: obj.fields?.tasks?.length || 0,
    }))
    .sort((a, b) => b.taskCount - a.taskCount); // Sort by task count (largest first)
}

/**
 * Gets a specific workflow by ID
 * @param workflowId The ID of the workflow to get
 * @param template The workflow bundle containing the objects
 * @returns The workflow object or null if not found
 */
export function getWorkflowById(
  workflowId: string,
  template: WorkflowBundle
): WorkflowObject | null {
  if (!template?.objects || !workflowId) return null;

  const workflow = template.objects[workflowId];

  if (
    !workflow ||
    workflow.type !== "workflow" ||
    !Array.isArray(workflow.fields?.tasks)
  ) {
    return null;
  }

  return workflow;
}

/**
 * Gets all triggers related to a specific workflow
 * @param workflowId The ID of the workflow to get triggers for
 * @param template The workflow bundle containing the objects
 * @returns An array of trigger objects
 */
export function getWorkflowTriggers(
  workflowId: string,
  template: WorkflowBundle
) {
  if (!template?.objects || !workflowId) return [];

  return Object.entries(template.objects)
    .filter(
      ([, obj]) =>
        obj.type === "trigger" && obj.fields?.workflowId === workflowId
    )
    .map(([id, obj]) => ({
      id,
      obj,
    }));
}

// Import and re-export detectJinjaTemplates from referenceUtils
import { detectJinjaTemplates } from "./referenceUtils";
export { detectJinjaTemplates };
