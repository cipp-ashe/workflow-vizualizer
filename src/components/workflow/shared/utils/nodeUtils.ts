/**
 * Utility functions for creating and managing workflow nodes
 */
import { Node } from "reactflow";
import {
  WorkflowBundle,
  WorkflowObject,
  WorkflowTask,
} from "../types/workflowTypes";
import {
  resolveReference,
  getTaskMetadata,
  getTaskDescription,
} from "./referenceUtils";
import { detectJinjaTemplates } from "./templateUtils";

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
  task: WorkflowTask,
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
    ? Object.values(template.objects || {}).find(
        (obj) => obj?.hash === reference[1].src_key_hash
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
  const position = {
    x: (metadata?.x || 0) + offsetX - minX,
    y: (metadata?.y || 0) + offsetY - minY,
  };

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
      const triggerTypeObj = Object.values(template.objects || {}).find(
        (o) => o?.hash === reference[1].src_key_hash
      );

      if (triggerTypeObj && triggerTypeObj.fields?.ref) {
        triggerType = triggerTypeObj.fields.ref as string;
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

/**
 * Calculates the position of a trigger node
 * @param triggerCount The total number of triggers
 * @param index The index of the trigger
 * @param offsetX The X offset to apply
 * @param offsetY The Y offset to apply
 * @param workflowWidth The width of the workflow
 * @returns The calculated position
 */
function calculateTriggerPosition(
  triggerCount: number,
  index: number,
  offsetX: number,
  offsetY: number,
  workflowWidth: number
): { x: number; y: number } {
  // Position triggers above the workflow, evenly spaced
  const triggerSpacing = workflowWidth / (triggerCount + 1);
  const x = offsetX + triggerSpacing * (index + 1);
  const y = offsetY - 150; // Position triggers above the workflow

  return { x, y };
}

/**
 * Detects if a task is a sub-workflow
 * @param task The task to check
 * @param taskObj The resolved task object
 * @param template The workflow bundle containing the objects
 * @returns An object with isSubWorkflowTask and subWorkflowId
 */
export function detectSubWorkflow(
  task: WorkflowTask,
  taskObj: WorkflowObject | null,
  template: WorkflowBundle
): { isSubWorkflowTask: boolean; subWorkflowId?: string } {
  let isSubWorkflowTask = false;
  let subWorkflowId: string | undefined = undefined;

  // Method 1: Check if the task object itself is a workflow
  if (taskObj?.type === "workflow") {
    isSubWorkflowTask = true;
    subWorkflowId = task.id;
  }

  // Method 2: Check if the action reference contains "workflow"
  if (
    !isSubWorkflowTask &&
    task.action?.ref?.toLowerCase().includes("workflow")
  ) {
    isSubWorkflowTask = true;
  }

  // Method 3: Check if the task name contains "workflow"
  if (!isSubWorkflowTask && task.name?.toLowerCase().includes("workflow")) {
    isSubWorkflowTask = true;
  }

  // Method 4: Check for workflowId in input parameters
  if (task.input) {
    // Try to find workflow ID in the input parameters
    const inputStr = JSON.stringify(task.input);
    const workflowMatch = inputStr.match(/"workflowId"\s*:\s*"([^"]+)"/);
    if (workflowMatch && workflowMatch[1]) {
      isSubWorkflowTask = true;
      subWorkflowId = workflowMatch[1];
    }
  }

  // Method 5: Check if the task is referenced by other workflows
  if (!isSubWorkflowTask && template?.objects) {
    const isReferencedAsWorkflow = Object.values(template.objects).some(
      (obj) =>
        obj?.type === "workflow" &&
        obj.fields?.tasks?.some((t) => t.action?.id === task.id)
    );

    if (isReferencedAsWorkflow) {
      isSubWorkflowTask = true;
      subWorkflowId = task.id;
    }
  }

  return { isSubWorkflowTask, subWorkflowId };
}
