import { useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { WorkflowViewerProps } from "./types";
import { useWorkflowNavigation } from "./hooks/useWorkflowNavigation";
import { useWorkflowProcessor } from "./hooks/useWorkflowProcessor";
import { useWorkflowExport } from "./hooks/useWorkflowExport";
import { WorkflowNavigation } from "./components/WorkflowNavigation";
import { WorkflowCanvas } from "./components/WorkflowCanvas";
import { LAYOUT_CONSTANTS } from "./constants/layoutConstants";

/**
 * WorkflowViewer - Main component for visualizing workflow templates as interactive node graphs
 *
 * This component orchestrates the workflow visualization by combining navigation, processing,
 * and export functionality through custom hooks. It renders a navigation bar for workflow
 * selection and a canvas for displaying the workflow graph.
 *
 * @param {WorkflowViewerProps} props - Component props
 * @param {WorkflowBundle} props.template - The workflow template to visualize
 * @returns {JSX.Element} The rendered workflow viewer
 *
 * @example
 * ```tsx
 * import { WorkflowViewer } from "@/components/WorkflowViewer";
 * import { WorkflowBundle } from "@/types/workflow";
 *
 * function MyComponent({ template }: { template: WorkflowBundle }) {
 *   return <WorkflowViewer template={template} />;
 * }
 * ```
 */
export function WorkflowViewer({ template }: WorkflowViewerProps) {
  // Navigation state and handlers
  const {
    selectedWorkflowId,
    workflowHierarchy,
    initializeNavigation,
    handleSubWorkflowClick,
    handleWorkflowSelect,
    handleBreadcrumbNavigate,
  } = useWorkflowNavigation(template);

  // Workflow processing state and handlers
  const { nodes, edges, onNodesChange, onEdgesChange, clearWorkflow } =
    useWorkflowProcessor(template, selectedWorkflowId, handleSubWorkflowClick);

  // Export functionality
  const { downloadAsSvg } = useWorkflowExport();

  // Initialize navigation on mount
  useEffect(() => {
    initializeNavigation();
  }, [initializeNavigation]);

  return (
    <div
      className={`flex flex-col h-full min-h-[${LAYOUT_CONSTANTS.MIN_HEIGHT}] w-full`}
    >
      {/* Workflow Navigation Bar */}
      <WorkflowNavigation
        template={template}
        selectedWorkflowId={selectedWorkflowId}
        workflowHierarchy={workflowHierarchy}
        onWorkflowSelect={handleWorkflowSelect}
        onBreadcrumbNavigate={handleBreadcrumbNavigate}
      />

      {/* Main canvas with controls */}
      <ReactFlowProvider>
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onExportSvg={downloadAsSvg}
          onClearWorkflow={clearWorkflow}
        />
      </ReactFlowProvider>
    </div>
  );
}
