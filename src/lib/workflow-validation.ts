// Define a type for workflow object validation
interface WorkflowObjectForValidation {
  type: string;
  fields?: {
    tasks?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Define a type for workflow bundle validation
interface WorkflowBundleForValidation {
  version: unknown;
  exportedAt: unknown;
  objects?: Record<string, WorkflowObjectForValidation>;
  references?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Validates if the data is a valid WorkflowBundle
 * @param data The data to validate
 * @returns true if the data is a valid WorkflowBundle, false otherwise
 */
export const isValidWorkflowBundle = (data: unknown): boolean => {
  // Check for required top-level properties
  if (!data || typeof data !== "object") return false;

  const bundle = data as WorkflowBundleForValidation;

  // Check version (support both version 1 and 2)
  if (
    typeof bundle.version !== "number" ||
    (bundle.version !== 1 && bundle.version !== 2)
  )
    return false;

  // Check exportedAt
  if (typeof bundle.exportedAt !== "string") return false;

  // Check for objects property
  if (!bundle.objects || typeof bundle.objects !== "object") return false;

  // Check for at least one workflow object with tasks
  const hasWorkflow = Object.values(bundle.objects).some(
    (obj: WorkflowObjectForValidation) =>
      obj &&
      typeof obj === "object" &&
      obj.type === "workflow" &&
      obj.fields &&
      Array.isArray(obj.fields.tasks)
  );

  if (!hasWorkflow) return false;

  // Check for references property (version 1) or dependencies (version 2)
  if (bundle.version === 1) {
    if (!bundle.references || typeof bundle.references !== "object")
      return false;
  } else if (bundle.version === 2) {
    // Version 2 might have a signing property and different structure
    // Just check that objects exist and have the right structure
    return true;
  }

  return true;
};
