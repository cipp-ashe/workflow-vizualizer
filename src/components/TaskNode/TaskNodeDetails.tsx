// React is used implicitly for JSX
import { Code } from "lucide-react";
import { TaskNodeData } from "./types";
import { cn } from "@/lib/utils";

interface TaskNodeDetailsProps {
  isExpanded: boolean;
  data: TaskNodeData;
}

export function TaskNodeDetails({ isExpanded, data }: TaskNodeDetailsProps) {
  console.log("TaskNodeDetails render:", { isExpanded, data });
  console.log("TaskNodeDetails data keys:", Object.keys(data));
  console.log("TaskNodeDetails input:", data.input);
  console.log("TaskNodeDetails description:", data.description);

  if (!isExpanded) {
    console.log("TaskNodeDetails not expanded, returning null");
    return null;
  }

  return (
    <div className="space-y-6 pt-6 mt-6 border-t border-[hsl(var(--border))]">
      {data.isSubWorkflowTask && data.subWorkflowId && (
        <div className="mb-4">
          <button
            onClick={() => data.onSubWorkflowClick?.(data.subWorkflowId!)}
            className={cn(
              "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium",
              "bg-[hsl(var(--workflow-orange))]/10",
              "text-[hsl(var(--workflow-orange))]",
              "ring-1 ring-[hsl(var(--workflow-orange))]/30",
              "hover:bg-[hsl(var(--workflow-orange))]/20",
              "transition-colors"
            )}
          >
            <span className="mr-2">View Sub-workflow</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
        </div>
      )}

      {data.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.description}
        </p>
      )}

      {data.action?.ref && (
        <div className="space-y-3">
          <div
            className={cn(
              "inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium",
              "bg-[hsl(var(--workflow-blue))]/10",
              "text-[hsl(var(--workflow-blue))]",
              "ring-1 ring-[hsl(var(--workflow-blue))]/30"
            )}
          >
            {data.action.name || data.action.ref}
          </div>
          {data.action.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.action.description}
            </p>
          )}
        </div>
      )}

      {data.input && Object.keys(data.input).length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Input Parameters
          </h4>
          <div className="space-y-3">
            {Object.entries(data.input).map(([key, value]) => (
              <div
                key={key}
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-lg",
                  "bg-[hsl(var(--muted))]/20",
                  "border border-[hsl(var(--border))]/50",
                  "transition-all duration-200",
                  "hover:bg-[hsl(var(--muted))]/30",
                  "hover:border-[hsl(var(--border))]"
                )}
              >
                <Code className="w-4 h-4 text-[hsl(var(--workflow-purple))] mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-[hsl(var(--workflow-purple))] mb-2">
                    {key}
                  </div>
                  <pre
                    className={cn(
                      "text-sm text-muted-foreground break-all whitespace-pre-wrap",
                      "bg-[hsl(var(--muted))]/30 rounded-md p-2"
                    )}
                  >
                    {typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.output && Object.keys(data.output).length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Output Parameters
          </h4>
          <div className="space-y-3">
            {Object.entries(data.output).map(([key, value]) => (
              <div
                key={key}
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-lg",
                  "bg-[hsl(var(--muted))]/20",
                  "border border-[hsl(var(--border))]/50",
                  "transition-all duration-200",
                  "hover:bg-[hsl(var(--muted))]/30",
                  "hover:border-[hsl(var(--border))]"
                )}
              >
                <Code className="w-4 h-4 text-[hsl(var(--workflow-green))] mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-[hsl(var(--workflow-green))] mb-2">
                    {key}
                  </div>
                  <pre
                    className={cn(
                      "text-sm text-muted-foreground break-all whitespace-pre-wrap",
                      "bg-[hsl(var(--muted))]/30 rounded-md p-2"
                    )}
                  >
                    {typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {data.transitionMode && (
          <div
            className={cn(
              "flex items-start gap-3 p-3.5 rounded-lg",
              "bg-[hsl(var(--muted))]/20",
              "border border-[hsl(var(--border))]/50",
              "transition-all duration-200"
            )}
          >
            <div className="flex-1">
              <div className="text-sm font-medium mb-2 text-foreground">
                Transition Mode
              </div>
              <div className="text-sm text-muted-foreground">
                {data.transitionMode.replace(/_/g, " ").toLowerCase()}
              </div>
            </div>
          </div>
        )}

        {data.humanSecondsSaved && data.humanSecondsSaved > 0 && (
          <div
            className={cn(
              "flex items-start gap-3 p-3.5 rounded-lg",
              "bg-[hsl(var(--muted))]/20",
              "border border-[hsl(var(--border))]/50",
              "transition-all duration-200"
            )}
          >
            <div className="flex-1">
              <div className="text-sm font-medium mb-2 text-foreground">
                Time Saved
              </div>
              <div className="text-sm text-[hsl(var(--workflow-green))]">
                {data.humanSecondsSaved}s
              </div>
            </div>
          </div>
        )}

        {data.publishResultAs && (
          <div
            className={cn(
              "flex items-start gap-3 p-3.5 rounded-lg",
              "bg-[hsl(var(--muted))]/20",
              "border border-[hsl(var(--border))]/50",
              "transition-all duration-200"
            )}
          >
            <div className="flex-1">
              <div className="text-sm font-medium mb-2 text-foreground">
                Result Published As
              </div>
              <code
                className={cn(
                  "block text-sm font-mono text-muted-foreground",
                  "bg-[hsl(var(--muted))]/30 rounded-md p-2"
                )}
              >
                {data.publishResultAs}
              </code>
            </div>
          </div>
        )}

        {/* Transitions are displayed at the bottom of the node */}
      </div>
    </div>
  );
}
