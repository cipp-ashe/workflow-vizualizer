/**
 * WorkflowNavigation Component
 *
 * Renders the navigation bar for the workflow viewer, including workflow selection
 * and breadcrumb navigation.
 */
import { WorkflowBundle } from "../../../../types/workflow";
import { WorkflowSelector } from "./WorkflowSelector";
import { WorkflowBreadcrumb } from "./WorkflowBreadcrumb";

interface WorkflowNavigationProps {
  template: WorkflowBundle;
  selectedWorkflowId: string | null;
  workflowHierarchy: Array<{ id: string; name: string }>;
  workflowRelationships: Map<string, { parents: string[]; children: string[] }>;
  onWorkflowSelect: (id: string) => void;
  onBreadcrumbNavigate: (id: string, index: number) => void;
}

/**
 * WorkflowNavigation component for rendering the navigation bar
 * @param props Component props
 * @returns The rendered navigation bar
 */
export function WorkflowNavigation({
  template,
  selectedWorkflowId,
  workflowHierarchy,
  workflowRelationships,
  onWorkflowSelect,
  onBreadcrumbNavigate,
}: WorkflowNavigationProps) {
  // Get the list of workflows for the selector
  const workflows = Object.values(template.objects)
    .filter((obj) => obj.type === "workflow")
    .map((workflow) => {
      const id = workflow.fields.id as string;
      const relationships = workflowRelationships.get(id);

      return {
        id,
        name: workflow.nonfunctional_fields?.name || "Workflow",
        taskCount: ((workflow.fields.tasks as unknown[]) || []).length,
        // Add relationship information
        parentCount: relationships?.parents.length || 0,
        childCount: relationships?.children.length || 0,
      };
    });

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b bg-[hsl(var(--background))]">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
        {/* Workflow Selector */}
        <WorkflowSelector
          workflows={workflows}
          selectedWorkflowId={selectedWorkflowId}
          onSelect={onWorkflowSelect}
        />

        {/* Breadcrumb Navigation */}
        {workflowHierarchy.length > 0 && (
          <WorkflowBreadcrumb
            workflowHierarchy={workflowHierarchy}
            workflowRelationships={workflowRelationships}
            onNavigate={onBreadcrumbNavigate}
            currentWorkflowName={
              workflowHierarchy[workflowHierarchy.length - 1]?.name ||
              "Workflow"
            }
          />
        )}

        {/* Back to Parent Button */}
        {workflowHierarchy.length > 1 && (
          <button
            onClick={() =>
              onBreadcrumbNavigate(
                workflowHierarchy[workflowHierarchy.length - 2].id,
                workflowHierarchy.length - 2
              )
            }
            className="ml-auto px-3 py-1 text-sm bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted-foreground)/0.2)] rounded-md flex items-center gap-1"
            aria-label={`Back to ${
              workflowHierarchy[workflowHierarchy.length - 2].name
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to {workflowHierarchy[workflowHierarchy.length - 2].name}
          </button>
        )}
      </div>
    </div>
  );
}
