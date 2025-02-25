import { WorkflowBundle, WorkflowObject } from "../../../types/workflow";

/**
 * Resolves a reference ID to the actual object in the template
 * @param refId The reference ID to resolve
 * @param template The workflow bundle containing the objects and references
 * @returns The resolved object or null if not found
 */
export function resolveReference(refId: string, template: WorkflowBundle) {
  if (!template?.references || !template?.objects) return null;

  const reference = Object.entries(template.references).find(([, ref]) =>
    ref.locations?.some((loc) => loc.includes(refId))
  );

  if (!reference) return null;

  const actualObject = Object.values(template.objects).find(
    (obj) => obj.hash === reference[1].src_key_hash
  );

  return actualObject;
}

/**
 * Gets the metadata for a task at the specified index
 * @param taskIndex The index of the task in the workflow
 * @param workflow The workflow object containing the task
 * @returns The task metadata or undefined if not found
 */
export function getTaskMetadata(taskIndex: number, workflow: WorkflowObject) {
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
) {
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
) {
  const labelKey = `tasks[${taskIndex}].next[${transitionIndex}].label`;
  return workflow.nonfunctional_fields?.[labelKey] as string | undefined;
}
