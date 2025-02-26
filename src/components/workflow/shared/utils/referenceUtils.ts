/**
 * Utility functions for resolving references in workflow templates
 */
import { WorkflowBundle, WorkflowObject, WorkflowTask } from "../types";

/**
 * Resolves a reference ID to the actual object in the workflow bundle
 * @param refId The reference ID to resolve
 * @param template The workflow bundle containing the objects and references
 * @returns The resolved object or null if not found
 */
export function resolveReference(
  refId: string,
  template: WorkflowBundle
): WorkflowObject | null {
  if (!template?.references || !template?.objects) return null;

  const reference = Object.entries(template.references).find(([, ref]) =>
    ref.locations?.some((loc) => loc.includes(refId))
  );

  if (!reference) return null;

  const actualObject = Object.values(template.objects).find(
    (obj) => obj.hash === reference[1].src_key_hash
  );

  return actualObject || null;
}

/**
 * Gets the metadata for a task at the specified index
 * @param taskIndex The index of the task in the workflow
 * @param workflow The workflow object containing the task
 * @returns The task metadata or undefined if not found
 */
export function getTaskMetadata(
  taskIndex: number,
  workflow: WorkflowObject
): { x: number; y: number; clonedFromId?: string } | undefined {
  const metadataKey = `tasks[${taskIndex}].metadata`;
  return workflow.nonfunctional_fields?.[metadataKey] as
    | { x: number; y: number; clonedFromId?: string }
    | undefined;
}

/**
 * Gets the description for a task at the specified index
 * @param taskIndex The index of the task in the workflow
 * @param workflow The workflow object containing the task
 * @returns The task description or undefined if not found
 */
export function getTaskDescription(
  taskIndex: number,
  workflow: WorkflowObject
): string | undefined {
  const descKey = `tasks[${taskIndex}].description`;
  return workflow.nonfunctional_fields?.[descKey] as string | undefined;
}

/**
 * Gets the label for a transition at the specified indices
 * @param taskIndex The index of the task in the workflow
 * @param transitionIndex The index of the transition in the task
 * @param workflow The workflow object containing the task and transition
 * @returns The transition label or undefined if not found
 */
export function getTransitionLabel(
  taskIndex: number,
  transitionIndex: number,
  workflow: WorkflowObject
): string | undefined {
  const labelKey = `tasks[${taskIndex}].next[${transitionIndex}].label`;
  return workflow.nonfunctional_fields?.[labelKey] as string | undefined;
}

/**
 * Detects if an object contains Jinja templates
 * @param obj The object to check for Jinja templates
 * @returns True if the object contains Jinja templates, false otherwise
 */
export function detectJinjaTemplates(obj: unknown): boolean {
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
}

/**
 * Finds the main workflow object in a workflow bundle
 * @param template The workflow bundle to search
 * @param selectedWorkflowId Optional ID of the selected workflow
 * @returns The main workflow object or null if not found
 */
export function findMainWorkflow(
  template: WorkflowBundle,
  selectedWorkflowId?: string | null
): WorkflowObject | null {
  if (!template) return null;

  // If a specific workflow ID is provided, use that workflow
  if (template.objects && selectedWorkflowId) {
    const selectedWorkflow = Object.values(template.objects).find(
      (obj) => obj.fields?.id === selectedWorkflowId && obj.type === "workflow"
    );
    if (selectedWorkflow) return selectedWorkflow;
  }

  // Otherwise, find the first workflow in the template
  if (template.objects) {
    // First try to find a workflow with tasks
    const workflowWithTasks = Object.values(template.objects).find(
      (obj) => obj.type === "workflow" && Array.isArray(obj.fields?.tasks)
    );
    if (workflowWithTasks) return workflowWithTasks;
  }

  // If template itself is a workflow, use it
  if (
    (template as WorkflowObject).type === "workflow" &&
    Array.isArray((template as WorkflowObject).fields?.tasks)
  ) {
    return template as WorkflowObject;
  }

  // For version 2 bundles, look for workflow objects with specific keys
  if (template.objects) {
    // Look for workflow objects with keys starting with "workflow:"
    const workflowObjects = Object.entries(template.objects)
      .filter(
        ([key, obj]) => key.startsWith("workflow:") && obj.type === "workflow"
      )
      .map(([, obj]) => obj);

    if (workflowObjects.length > 0) {
      // Use the first workflow object with tasks
      const firstWorkflowWithTasks = workflowObjects.find(
        (obj) => Array.isArray(obj.fields?.tasks) && obj.fields.tasks.length > 0
      );

      if (firstWorkflowWithTasks) {
        return firstWorkflowWithTasks;
      }
    }
  }

  return null;
}

/**
 * Gets the workflow tasks from a workflow bundle
 * @param template The workflow bundle containing the tasks
 * @param selectedWorkflowId Optional ID of the selected workflow
 * @returns An array of workflow tasks or null if not found
 */
export function getWorkflowTasks(
  template: WorkflowBundle,
  selectedWorkflowId?: string | null
): WorkflowTask[] | null {
  const mainWorkflow = findMainWorkflow(template, selectedWorkflowId);

  if (mainWorkflow?.fields?.tasks) {
    return mainWorkflow.fields.tasks;
  }

  // If template itself has tasks, use them
  if (template.fields?.tasks) {
    return template.fields.tasks;
  }

  return null;
}
