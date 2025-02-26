/**
 * WorkflowBreadcrumb Component
 *
 * Renders a breadcrumb navigation for the workflow hierarchy.
 */
import { cn } from "../../../../lib/utils";

interface WorkflowBreadcrumbProps {
  workflowHierarchy: Array<{ id: string; name: string }>;
  workflowRelationships?: Map<
    string,
    { parents: string[]; children: string[] }
  >;
  currentWorkflowName?: string; // Not used currently but kept for future use
  onNavigate: (id: string, index: number) => void;
}

/**
 * WorkflowBreadcrumb component for rendering breadcrumb navigation
 * @param props Component props
 * @returns The rendered breadcrumb navigation
 */
export function WorkflowBreadcrumb({
  workflowHierarchy,
  workflowRelationships,
  onNavigate,
}: WorkflowBreadcrumbProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {workflowHierarchy.map((workflow, index) => {
          const isLast = index === workflowHierarchy.length - 1;

          // Get relationship information
          const relationships = workflowRelationships?.get(workflow.id);
          const childrenCount = relationships?.children?.length || 0;
          const hasChildren = childrenCount > 0;

          return (
            <li key={workflow.id} className="inline-flex items-center">
              {index > 0 && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-[hsl(var(--muted-foreground))]"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
              <button
                onClick={() => onNavigate(workflow.id, index)}
                className={cn(
                  "ml-1 text-sm font-medium hover:text-[hsl(var(--primary))]",
                  isLast
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))]"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {workflow.name}
                {hasChildren && !isLast && (
                  <span className="ml-1 text-xs text-[hsl(var(--primary))]">
                    ({childrenCount})
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
