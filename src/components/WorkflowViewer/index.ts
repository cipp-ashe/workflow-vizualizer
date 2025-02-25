/**
 * WorkflowViewer Component Exports
 *
 * This file exports all components, hooks, utilities, and constants from the WorkflowViewer module.
 */

// Main component
export { WorkflowViewer } from "./WorkflowViewer";

// Types
export type { WorkflowViewerProps } from "./types";

// Components
export { WorkflowBreadcrumb } from "./components/WorkflowBreadcrumb";
export { WorkflowSelector } from "./components/WorkflowSelector";
export { WorkflowNavigation } from "./components/WorkflowNavigation";
export { WorkflowCanvas } from "./components/WorkflowCanvas";
export { WorkflowLegend } from "./components/WorkflowLegend";
export { WorkflowControls } from "./components/WorkflowControls";
export { ControlPanel } from "./components/ControlPanel";

// Hooks
export { useWorkflowNavigation } from "./hooks/useWorkflowNavigation";
export { useWorkflowProcessor } from "./hooks/useWorkflowProcessor";
export { useWorkflowExport } from "./hooks/useWorkflowExport";

// Utils
export {
  resolveReference,
  getTaskMetadata,
  getTaskDescription,
  getTransitionLabel,
} from "./utils/referenceUtils";
export {
  getWorkflows,
  getWorkflowById,
  getWorkflowTriggers,
  detectJinjaTemplates,
  detectSubWorkflow,
} from "./utils/templateUtils";
export {
  calculateOffsets,
  calculateTaskPosition,
  calculateTriggerPosition,
} from "./utils/positionUtils";
export { createTaskNode, createTriggerNode } from "./utils/nodeUtils";
export { createTaskEdges, createTriggerEdges } from "./utils/edgeUtils";

// Constants
export { legendItems } from "./constants/legendItems";
export { nodeTypes } from "./constants/nodeTypes";
