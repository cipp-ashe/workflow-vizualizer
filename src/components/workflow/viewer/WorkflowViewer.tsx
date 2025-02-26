import { useEffect, useMemo } from "react";
import { ReactFlowProvider } from "reactflow";
import { WorkflowViewerProps } from "./types";
import { useWorkflowNavigation } from "../viewer/hooks/useWorkflowNavigation";
import { useWorkflowProcessor } from "../viewer/hooks/useWorkflowProcessor";
import { useWorkflowExport } from "../viewer/hooks/useWorkflowExport";
import { WorkflowNavigation } from "../viewer/components/WorkflowNavigation";
import { WorkflowCanvas } from "../viewer/components/WorkflowCanvas";
import { WorkflowTriggers } from "../viewer/components/WorkflowTriggers";
import {
  extractTriggers,
  groupTriggersByWorkflow,
} from "../shared/utils/triggerUtils";

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
 * import { WorkflowViewer } from "@/components/workflow";
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
    workflowRelationships,
    handleSubWorkflowClick,
    handleWorkflowSelect,
    handleBreadcrumbNavigate,
  } = useWorkflowNavigation(template);

  // Workflow processing state and handlers
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    clearWorkflow,
    updateLayoutConfig,
  } = useWorkflowProcessor(
    template,
    selectedWorkflowId,
    handleSubWorkflowClick
  );

  // Export functionality
  const { downloadAsSvg } = useWorkflowExport();

  // Extract and process triggers
  const triggers = useMemo(() => extractTriggers(template), [template]);
  const triggersByWorkflow = useMemo(
    () => groupTriggersByWorkflow(triggers),
    [triggers]
  );

  // Get triggers for the selected workflow
  const selectedWorkflowTriggers = useMemo(() => {
    if (!selectedWorkflowId) return [];
    return triggersByWorkflow.get(selectedWorkflowId) || [];
  }, [selectedWorkflowId, triggersByWorkflow]);

  // Initialize navigation on mount
  useEffect(() => {
    initializeNavigation();
  }, [initializeNavigation]);

  return (
    <div className="flex flex-col h-full min-h-[600px] w-full">
      {/* Workflow Navigation Bar */}
      <WorkflowNavigation
        template={template}
        selectedWorkflowId={selectedWorkflowId}
        workflowHierarchy={workflowHierarchy}
        workflowRelationships={workflowRelationships}
        onWorkflowSelect={handleWorkflowSelect}
        onBreadcrumbNavigate={handleBreadcrumbNavigate}
      />

      {/* Workflow Triggers */}
      {selectedWorkflowTriggers.length > 0 && (
        <div className="px-4 py-2 border-b">
          <WorkflowTriggers triggers={selectedWorkflowTriggers} />
        </div>
      )}

      {/* Main canvas with controls */}
      <ReactFlowProvider>
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onExportSvg={downloadAsSvg}
          onClearWorkflow={clearWorkflow}
          updateLayoutConfig={updateLayoutConfig}
        />
      </ReactFlowProvider>
    </div>
  );
}
