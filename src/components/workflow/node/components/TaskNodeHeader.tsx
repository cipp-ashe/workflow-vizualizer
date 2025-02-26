/**
 * TaskNodeHeader Component
 *
 * Renders the header section of a task node, including the task name,
 * type indicator, and status indicators.
 */
import { TaskNodeHeaderProps } from "../types";
import { cn } from "../../../../lib/utils";

/**
 * TaskNodeHeader component for rendering the header of a task node
 * @param props Component props
 * @returns The rendered task node header
 */
export function TaskNodeHeader({
  name,
  taskType,
  indicators,
  isExpanded,
  hasDetails,
  onToggle,
}: TaskNodeHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-t-lg">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Task type indicator */}
        <div
          className={cn(
            "flex-shrink-0 w-3 h-3 rounded-full",
            taskType === "action" && "bg-[hsl(var(--workflow-blue))]",
            taskType === "workflow" && "bg-[hsl(var(--workflow-green))]",
            taskType === "condition" && "bg-[hsl(var(--workflow-yellow))]",
            taskType === "unknown" && "bg-[hsl(var(--muted))]"
          )}
          title={`Task type: ${taskType}`}
        />

        {/* Task name */}
        <div className="font-medium truncate" title={name}>
          {name || "Unnamed Task"}
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-1.5">
        {/* Action indicator */}
        {indicators.hasAction && (
          <div
            className="w-4 h-4 text-[hsl(var(--workflow-blue))]"
            title="Has action"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22v-5" />
              <path d="M9 8V2" />
              <path d="M15 8V2" />
              <path d="M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path d="M12 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path d="M12 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </svg>
          </div>
        )}

        {/* Sub-workflow indicator */}
        {indicators.hasSubWorkflow && (
          <div
            className="w-4 h-4 text-[hsl(var(--workflow-green))]"
            title="Has sub-workflow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h10" />
              <path d="M7 12h10" />
              <path d="M7 17h10" />
            </svg>
          </div>
        )}

        {/* Condition indicator */}
        {indicators.hasCondition && (
          <div
            className="w-4 h-4 text-[hsl(var(--workflow-yellow))]"
            title="Has condition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        )}

        {/* Multiple targets indicator */}
        {indicators.hasMultipleTargets && (
          <div
            className="w-4 h-4 text-[hsl(var(--workflow-purple))]"
            title="Has multiple targets"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 3h5v5" />
              <path d="M8 3H3v5" />
              <path d="M3 16v5h5" />
              <path d="M16 21h5v-5" />
            </svg>
          </div>
        )}

        {/* Expand/collapse button */}
        {hasDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="w-5 h-5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "transition-transform",
                isExpanded ? "rotate-180" : "rotate-0"
              )}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
