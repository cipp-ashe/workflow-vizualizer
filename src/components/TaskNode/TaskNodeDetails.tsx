// React is used implicitly for JSX
import { TaskNodeData } from "./types";
import { cn, formatValueForDisplay } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface TaskNodeDetailsProps {
  isExpanded: boolean;
  data: TaskNodeData;
  hideTransitions?: boolean;
}

export function TaskNodeDetails({ isExpanded, data }: TaskNodeDetailsProps) {
  return (
    <Collapsible open={isExpanded} className="w-full">
      <CollapsibleContent className="space-y-2 pt-2 border-t border-[hsl(var(--border))] details-section">
        <ScrollArea className="max-h-[400px]">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0 space-y-4">
              {data.description && (
                <div className="text-xs text-foreground/80 whitespace-pre-wrap">
                  {data.description}
                </div>
              )}

              {data.isSubWorkflowTask && data.subWorkflowId && (
                <div className="mb-2">
                  <button
                    onClick={() =>
                      data.onSubWorkflowClick?.(data.subWorkflowId!)
                    }
                    className={cn(
                      "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                      "bg-[hsl(var(--workflow-orange))]/10",
                      "text-[hsl(var(--workflow-orange))]",
                      "hover:bg-[hsl(var(--workflow-orange))]/20",
                      "transition-colors"
                    )}
                  >
                    <span className="mr-1">View Sub-workflow</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
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

              {data.action?.ref && (
                <div className="space-y-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                      "bg-[hsl(var(--workflow-blue))]/10",
                      "text-[hsl(var(--workflow-blue))]"
                    )}
                  >
                    {data.action.name || data.action.ref}
                  </Badge>
                  {data.action.description && (
                    <p className="text-xs text-foreground/80 whitespace-pre-wrap">
                      {data.action.description}
                    </p>
                  )}
                </div>
              )}

              {data.input && Object.keys(data.input).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-[hsl(var(--workflow-blue))] uppercase tracking-wider">
                    Input Parameters:
                  </h4>
                  <div className="bg-[hsl(var(--muted))]/20 p-2 rounded">
                    <div className="space-y-2">
                      {Object.entries(data.input).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="font-mono text-xs text-[hsl(var(--workflow-purple))]">
                            {key}:
                          </span>
                          <div className="text-foreground/80 text-xs font-mono whitespace-pre-wrap overflow-visible">
                            {formatValueForDisplay(value, 150)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {data.output && Object.keys(data.output).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-[hsl(var(--workflow-blue))] uppercase tracking-wider">
                    Output Parameters:
                  </h4>
                  <div className="bg-[hsl(var(--muted))]/20 p-2 rounded">
                    <div className="space-y-2">
                      {Object.entries(data.output).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="font-mono text-xs text-[hsl(var(--workflow-green))]">
                            {key}:
                          </span>
                          <div className="text-foreground/80 text-xs font-mono whitespace-pre-wrap overflow-visible">
                            {formatValueForDisplay(value, 150)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[hsl(var(--muted))]/20 p-2 rounded">
                <div className="space-y-1 text-xs">
                  {data.transitionMode && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="font-medium text-foreground">Mode:</span>
                      <span className="text-foreground/80">
                        {data.transitionMode.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </div>
                  )}

                  {data.humanSecondsSaved && data.humanSecondsSaved > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="font-medium text-foreground">
                        Time Saved:
                      </span>
                      <span className="text-[hsl(var(--workflow-green))]">
                        {data.humanSecondsSaved}s
                      </span>
                    </div>
                  )}

                  {data.publishResultAs && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="font-medium text-foreground">
                        Published As:
                      </span>
                      <div className="font-mono text-xs text-foreground/80 whitespace-pre-wrap overflow-visible">
                        {formatValueForDisplay(data.publishResultAs, 100)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transitions section - hidden when hideTransitions is true */}
              {data.next && data.next.length > 0 ? (
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-[hsl(var(--workflow-blue))] uppercase tracking-wider">
                    Transitions:
                  </h4>
                  <div className="bg-[hsl(var(--muted))]/20 p-2 rounded">
                    <div className="space-y-2">
                      {data.next.map((transition, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full flex-shrink-0 mt-1",
                              transition.followType === "all"
                                ? "bg-[hsl(var(--workflow-green))]"
                                : "bg-[hsl(var(--workflow-blue))]"
                            )}
                            title={`Follow ${transition.followType}`}
                          />
                          <div className="font-mono text-xs text-foreground/80 whitespace-pre-wrap overflow-visible">
                            {formatValueForDisplay(transition.when, 150)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
}
