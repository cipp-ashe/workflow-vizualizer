import { Node } from "reactflow";
import { WorkflowBundle, WorkflowObject, Task } from "../../../types/workflow";
import {
  resolveReference,
  getTaskMetadata,
  getTaskDescription,
} from "./referenceUtils";
import {
  calculateTaskPosition,
  calculateTriggerPosition,
} from "./positionUtils";
import { detectJinjaTemplates, detectSubWorkflow } from "./templateUtils";

/**
 * Creates a task node from a task in a workflow
 * @param task The task to create a node for
 * @param index The index of the task in the workflow
 * @param workflow The workflow object containing the task
 * @param template The workflow bundle containing the objects
 * @param offsetX The X offset to apply
 * @param offsetY The Y offset to apply
 * @param minX The minimum X coordinate of all tasks
 * @param minY The minimum Y coordinate of all tasks
 * @param onSubWorkflowClick Callback function for sub-workflow navigation
 * @returns The created node
 */
export function createTaskNode(
  task: Task,
  index: number,
  workflow: WorkflowObject,
  template: WorkflowBundle,
  offsetX: number,
  offsetY: number,
  minX: number,
  minY: number,
  onSubWorkflowClick: (subWorkflowId: string) => void
): Node {
  if (!task?.id) {
    throw new Error("Task ID is required");
  }

  // Find the referenced task object
  const reference = Object.entries(template.references || {}).find(([, ref]) =>
    ref.locations?.some((loc) => loc.includes(task.id))
  );

  const taskObj = reference
    ? Object.values(template.objects).find(
        (obj) => obj.hash === reference[1].src_key_hash
      )
    : null;

  // Get task metadata and description
  const metadata = getTaskMetadata(index, workflow);
  const description = getTaskDescription(index, workflow);

  // Process action details
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

  // Calculate position
  const position = calculateTaskPosition(
    index,
    metadata,
    workflow,
    offsetX,
    offsetY,
    minX,
    minY
  );

  // Check for Jinja templates
  const hasJinjaTemplates =
    detectJinjaTemplates(task.input) ||
    detectJinjaTemplates(task.action) ||
    detectJinjaTemplates(task.next);

  // Check if this is a sub-workflow task
  const { isSubWorkflowTask, subWorkflowId } = detectSubWorkflow(
    task,
    taskObj || null,
    template
  );

  // Create and return the node
  return {
    id: task.id,
    type: "task",
    position,
    draggable: true,
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
      isSubWorkflowTask,
      subWorkflowId,
      next: task.next?.map((transition, idx) => {
        const labelKey = `tasks[${index}].next[${idx}].label`;
        const label = workflow.nonfunctional_fields?.[labelKey] as
          | string
          | undefined;
        return {
          when: transition.when,
          label: label,
          followType:
            transition.do && transition.do.length > 1 ? "all" : "first",
        };
      }),
      onSubWorkflowClick,
      id: task.id, // Explicitly pass the ID to the node data
    },
  };
}

/**
 * Creates a trigger node
 * @param id The ID of the trigger
 * @param obj The trigger object
 * @param template The workflow bundle containing the objects
 * @param index The index of the trigger
 * @param triggerCount The total number of triggers
 * @param offsetX The X offset to apply
 * @param offsetY The Y offset to apply
 * @param workflowWidth The width of the workflow
 * @returns The created node
 */
export function createTriggerNode(
  id: string,
  obj: WorkflowObject,
  template: WorkflowBundle,
  index: number,
  triggerCount: number,
  offsetX: number,
  offsetY: number,
  workflowWidth: number
): Node {
  // Find the trigger type
  let triggerType = "Unknown Trigger";

  if (obj.fields?.triggerTypeId) {
    const triggerTypeId = obj.fields.triggerTypeId as string;
    const reference = Object.entries(template.references || {}).find(
      ([, ref]) => ref.locations?.some((loc) => loc.includes(triggerTypeId))
    );

    if (reference) {
      const triggerTypeObj = Object.values(template.objects).find(
        (o) => o.hash === reference[1].src_key_hash
      );

      if (triggerTypeObj && triggerTypeObj.fields?.ref) {
        triggerType = triggerTypeObj.fields.ref;
      }
    }
  }

  // Calculate position
  const position = calculateTriggerPosition(
    triggerCount,
    index,
    offsetX,
    offsetY,
    workflowWidth
  );

  // Create and return the node
  return {
    id,
    type: "task",
    position,
    data: {
      name: obj.nonfunctional_fields?.name || "Trigger",
      description: obj.nonfunctional_fields?.description,
      action: {
        ref: triggerType,
        name: obj.nonfunctional_fields?.name || "Trigger",
        description: `Trigger type: ${triggerType}`,
      },
      input: obj.fields?.parameters,
      type: "trigger",
      hasJinjaTemplates: false,
    },
  };
}
