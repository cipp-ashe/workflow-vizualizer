import { WorkflowObject } from "../../../types/workflow";
import { getTaskMetadata } from "./referenceUtils";

/**
 * Calculates the offsets needed to ensure all nodes are in positive coordinates
 * @param workflow The workflow object containing the tasks
 * @returns An object with offsetX and offsetY
 */
export function calculateOffsets(workflow: WorkflowObject) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let hasPositionMetadata = false;

  // Analyze all task positions to determine layout boundaries
  workflow.fields.tasks?.forEach((_, index) => {
    const metadata = getTaskMetadata(index, workflow);

    if (metadata) {
      hasPositionMetadata = true;
      minX = Math.min(minX, metadata.x);
      minY = Math.min(minY, metadata.y);
      maxX = Math.max(maxX, metadata.x);
      maxY = Math.max(maxY, metadata.y);
    }
  });

  // Calculate offsets to ensure all nodes are in positive coordinates
  const offsetX = minX === Infinity ? 0 : minX < 0 ? Math.abs(minX) + 50 : 50;
  const offsetY = minY === Infinity ? 0 : minY < 0 ? Math.abs(minY) + 100 : 100;

  // Calculate workflow dimensions for trigger positioning
  const workflowWidth = hasPositionMetadata
    ? maxX - minX + 300
    : workflow.fields.tasks?.length
    ? workflow.fields.tasks.length * 250
    : 500;

  return {
    offsetX,
    offsetY,
    workflowWidth,
    hasPositionMetadata,
    minX,
    minY,
    maxX,
    maxY,
  };
}

/**
 * Calculates the position for a task node
 * @param index The index of the task in the workflow
 * @param metadata The task metadata containing position information
 * @param workflow The workflow object containing the task
 * @param offsetX The X offset to apply
 * @param offsetY The Y offset to apply
 * @param minX The minimum X coordinate of all tasks
 * @param minY The minimum Y coordinate of all tasks
 * @returns The position object with x and y coordinates
 */
export function calculateTaskPosition(
  index: number,
  metadata: { x: number; y: number } | undefined,
  workflow: WorkflowObject,
  offsetX: number,
  offsetY: number,
  minX: number,
  minY: number
) {
  if (metadata) {
    // Use the stored metadata position with proper offset to ensure positive coordinates
    return {
      x: metadata.x + (minX < 0 ? Math.abs(minX) + 50 : 50),
      y: metadata.y + (minY < 0 ? Math.abs(minY) + 100 : 100),
    };
  } else {
    // If no metadata position is available, use a grid layout
    // Calculate grid dimensions based on the number of tasks
    const tasksCount = workflow.fields.tasks?.length || 1;
    const gridCols = Math.ceil(Math.sqrt(tasksCount));

    // Calculate grid position
    const col = index % gridCols;
    const row = Math.floor(index / gridCols);

    return {
      x: offsetX + col * 300, // More spacing between columns
      y: offsetY + row * 200, // More spacing between rows
    };
  }
}

/**
 * Calculates positions for trigger nodes
 * @param triggerCount The number of triggers
 * @param index The index of the current trigger
 * @param offsetX The X offset to apply
 * @param offsetY The Y offset to apply
 * @param workflowWidth The width of the workflow
 * @returns The position object with x and y coordinates
 */
export function calculateTriggerPosition(
  triggerCount: number,
  index: number,
  offsetX: number,
  offsetY: number,
  workflowWidth: number
) {
  // Position triggers evenly across the top of the workflow
  const triggerSpacing = workflowWidth / (triggerCount + 1);
  const xPosition = offsetX + (index + 1) * triggerSpacing - 125; // Center the trigger

  return {
    x: xPosition,
    y: offsetY - 250, // Position triggers further above the workflow
  };
}
