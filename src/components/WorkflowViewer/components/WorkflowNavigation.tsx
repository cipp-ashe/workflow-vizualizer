import { WorkflowBreadcrumb } from "./WorkflowBreadcrumb";
import { WorkflowSelector } from "./WorkflowSelector";
import { WorkflowBundle } from "../../../types/workflow";
import { getWorkflows } from "../utils/templateUtils";

interface WorkflowNavigationProps {
  template: WorkflowBundle;
  selectedWorkflowId: string | null;
  workflowHierarchy: Array<{ id: string; name: string }>;
  onWorkflowSelect: (id: string) => void;
  onBreadcrumbNavigate: (id: string, index: number) => void;
}

/**
 * Component for workflow navigation, including breadcrumb and selector
 */
export function WorkflowNavigation({
  template,
  selectedWorkflowId,
  workflowHierarchy,
  onWorkflowSelect,
  onBreadcrumbNavigate,
}: WorkflowNavigationProps) {
  const workflows = getWorkflows(template);
  const currentWorkflowName =
    workflows.find((wf) => wf.id === selectedWorkflowId)?.name || "Workflow";

  return (
    <div className="bg-[hsl(var(--background))] p-4 border-b border-[hsl(var(--border))] flex items-center gap-4 workflow-navigation-bar">
      {/* Breadcrumb Navigation */}
      <WorkflowBreadcrumb
        workflowHierarchy={workflowHierarchy}
        currentWorkflowName={currentWorkflowName}
        onNavigate={onBreadcrumbNavigate}
      />

      {/* Workflow Selector */}
      <WorkflowSelector
        workflows={workflows}
        selectedWorkflowId={selectedWorkflowId}
        onSelect={onWorkflowSelect}
      />
    </div>
  );
}
