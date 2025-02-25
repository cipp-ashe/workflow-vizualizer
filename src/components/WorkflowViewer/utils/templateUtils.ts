import { WorkflowBundle, WorkflowObject, Task } from "../../../types/workflow";

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

/**
 * Detects if a string or object contains Jinja templates
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
 * Detects if a task is a sub-workflow
 * @param task The task to check
 * @param taskObj The resolved task object
 * @param template The workflow bundle containing the objects
 * @returns An object with isSubWorkflowTask and subWorkflowId
 */
export function detectSubWorkflow(
  task: Task,
  taskObj: WorkflowObject | null,
  template: WorkflowBundle
) {
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
        obj.type === "workflow" &&
        obj.fields?.tasks?.some((t) => t.action?.id === task.id)
    );

    if (isReferencedAsWorkflow) {
      isSubWorkflowTask = true;
      subWorkflowId = task.id;
    }
  }

  return { isSubWorkflowTask, subWorkflowId };
}
