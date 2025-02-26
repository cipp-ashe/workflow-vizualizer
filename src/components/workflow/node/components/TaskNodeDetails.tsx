/**
 * TaskNodeDetails Component
 *
 * Renders the detailed information for a task node, including description,
 * input parameters, and transitions.
 */
import { TaskNodeDetailsProps } from "../types";
import { cn } from "../../../../lib/utils";
import React, { ReactNode } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../../components/ui/tabs";

// Import from the correct path - it's directly from src/, not relative to this file
import { Task } from "../../../../types/workflow";

// ========== Type Definitions ==========

/**
 * Extended type for Task with component-specific properties
 */
interface TaskData extends Task {
  onSubWorkflowClick?: (workflowId: string) => void;
  onTransitionHover?: (nodeId: string, transitionIndex: number | null) => void;
  // Reference to workflow context
  references?: Record<string, unknown>;
}

/**
 * Type-safe definition for transitions
 */
interface TaskTransition {
  id: string;
  label?: string;
  when?: string;
  do?: string[];
  publish?: Array<{ key: string; value: unknown }>;
}

// ========== Utility Functions ==========

/**
 * Safely converts an unknown value to a string for display
 */
const safeToString = (value: unknown): string => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/**
 * Type guard to check if an object has the expected properties of a TaskTransition
 */
const isTaskTransition = (obj: unknown): obj is TaskTransition => {
  if (typeof obj !== "object" || obj === null) return false;
  const transition = obj as Record<string, unknown>;
  return typeof transition.id !== "undefined";
};

/**
 * Converts a potentially unsafe transition object to a type-safe TaskTransition
 */
const toSafeTransition = (transition: unknown): TaskTransition => {
  if (!isTaskTransition(transition)) {
    // Create a default transition with just an ID if input is invalid
    return { id: "unknown" };
  }

  return {
    id:
      typeof transition.id === "string" ? transition.id : String(transition.id),
    label: transition.label ? String(transition.label) : undefined,
    when: transition.when ? String(transition.when) : undefined,
    do: Array.isArray(transition.do) ? transition.do.map(String) : undefined,
    publish: Array.isArray(transition.publish)
      ? transition.publish.map((p) => ({
          key: String(p.key),
          value: p.value,
        }))
      : undefined,
  };
};

/**
 * Resolves references from the workflow data
 * This allows us to display the actual values instead of placeholders
 */
const resolveReference = (
  value: string,
  references?: Record<string, unknown>
): string => {
  // If the value matches a reference pattern like @@@action_ref1@@@
  if (
    typeof value === "string" &&
    value.startsWith("@@@") &&
    value.endsWith("@@@") &&
    references
  ) {
    const refKey = value.replace(/@@@/g, "");
    if (references[refKey]) {
      // Return the actual reference value if found
      return safeToString(references[refKey]);
    }
  }
  return value;
};

/**
 * Determines task type based on available data
 */
const getTaskType = (data: TaskData): string => {
  // Determine task type based on available information
  if (data.type) return data.type;
  if (data.action?.ref) {
    // Parse the action ref to get a more friendly display name
    const ref = data.action.ref;
    if (typeof ref === "string") {
      if (ref.includes(".")) {
        const parts = ref.split(".");
        return `${parts[0]} / ${parts[1]}`;
      }
      return ref;
    }
  }
  return data.action ? "Action Task" : "Task";
};

// ========== Sub-Components ==========

/**
 * Field component for displaying labeled data
 */
const Field = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <div className="font-medium text-xs text-[hsl(var(--muted-foreground))] mb-1">
      {label}
    </div>
    <div className="text-[hsl(var(--foreground))] break-words">{value}</div>
  </div>
);

/**
 * Badge component for displaying status indicators
 */
interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "warning" | "info";
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "primary" }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "warning":
        return "bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]";
      case "info":
        return "bg-[hsl(var(--info)/0.1)] text-[hsl(var(--info))]";
      case "primary":
      default:
        return "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]";
    }
  };

  return (
    <span
      className={cn("px-2 py-0.5 text-xs rounded-full", getVariantClasses())}
    >
      {children}
    </span>
  );
};

/**
 * Component to display a transition in a task node
 */
interface TransitionProps {
  transition: TaskTransition;
  onSubWorkflowClick?: (workflowId: string) => void;
  references?: Record<string, unknown>;
}

const Transition: React.FC<TransitionProps> = ({
  transition,
  onSubWorkflowClick,
  references,
}) => {
  // Skip rendering if no meaningful content
  if (
    !transition.label &&
    !transition.when &&
    !transition.do &&
    !transition.publish
  ) {
    return null;
  }

  // Determine transition type for styling
  const transitionType = transition.when
    ? "conditional"
    : transition.do && transition.do.length > 1
    ? "multi-target"
    : "standard";

  return (
    <div
      className={cn(
        "p-2 border rounded",
        transitionType === "conditional" &&
          "border-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.1)]",
        transitionType === "multi-target" &&
          "border-[hsl(var(--info))] bg-[hsl(var(--info)/0.1)]",
        transitionType === "standard" &&
          "border-[hsl(var(--border))] bg-[hsl(var(--background))]"
      )}
    >
      {/* Transition Header with Type Indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm">
          {transition.label || "Transition"}
        </div>
        <div className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--muted))]">
          {transitionType === "conditional" && "Conditional"}
          {transitionType === "multi-target" && "Multi-Target"}
          {transitionType === "standard" && "Standard"}
        </div>
      </div>

      {/* Condition */}
      {transition.when && (
        <div className="mb-2">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Condition:
          </span>
          <div className="bg-[hsl(var(--muted))] rounded p-2 mt-1 overflow-x-auto">
            <pre className="text-xs whitespace-pre-wrap break-words max-w-full font-mono">
              {safeToString(transition.when)}
            </pre>
          </div>
        </div>
      )}

      {/* Target Tasks */}
      {transition.do && transition.do.length > 0 && (
        <div className="mb-2">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Target Tasks:
          </span>
          <div className="mt-1 flex flex-wrap gap-1">
            {transition.do.map((target: string, i: number) => (
              <button
                key={i}
                className="px-2 py-1 text-xs bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] rounded hover:bg-[hsl(var(--primary)/0.2)] inline-flex items-center"
                onClick={() => onSubWorkflowClick && onSubWorkflowClick(target)}
                aria-label={`Navigate to ${target}`}
              >
                {target}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Publish Variables */}
      {transition.publish && transition.publish.length > 0 && (
        <div>
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Published Variables:
          </span>
          <div className="mt-2 space-y-2 border border-[hsl(var(--border))] rounded bg-[hsl(var(--muted)/0.2)] p-3">
            {transition.publish.map((pub, i: number) => {
              // Look up reference values in the payload if they exist
              const valueDisplay =
                typeof pub.value === "string" && pub.value.startsWith("@@@")
                  ? resolveReference(pub.value, references)
                  : safeToString(pub.value);

              // Format template expressions for better readability
              const formattedValue =
                typeof pub.value === "string"
                  ? pub.value
                      // Format CTX expressions
                      .replace(/CTX\.([\w_.]+)/g, (_, path) => {
                        return `<span class="text-[hsl(var(--info))]">CTX</span>.<span class="text-[hsl(var(--primary))]">${path}</span>`;
                      })
                      // Format {{ }} expressions
                      .replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, content) => {
                        return `<span class="text-[hsl(var(--warning))]">{{</span> <span class="text-[hsl(var(--primary))]">${content}</span> <span class="text-[hsl(var(--warning))]">}}</span>`;
                      })
                      // Format @@@ references
                      .replace(/@@@([^@]+)@@@/g, (_, ref) => {
                        return `<span class="text-[hsl(var(--info))]">@@@</span><span class="text-[hsl(var(--primary))]">${ref}</span><span class="text-[hsl(var(--info))]">@@@</span>`;
                      })
                  : valueDisplay;

              return (
                <div
                  key={i}
                  className="border-b border-[hsl(var(--border))/30] pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] rounded text-xs font-medium">
                      {pub.key}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {typeof pub.value === "string" &&
                      pub.value.startsWith("{{")
                        ? "Template"
                        : "Value"}
                    </span>
                  </div>
                  {typeof pub.value === "string" &&
                  (pub.value.includes("CTX.") ||
                    pub.value.includes("{{") ||
                    pub.value.includes("@@@")) ? (
                    <div className="bg-[hsl(var(--muted))] rounded p-2 text-xs font-mono overflow-x-auto">
                      <div
                        dangerouslySetInnerHTML={{ __html: formattedValue }}
                        className="break-words whitespace-pre-wrap max-w-full"
                      />
                      {/* Show resolved value if available */}
                      {pub.value !== valueDisplay && (
                        <div className="mt-1 pt-1 border-t border-[hsl(var(--border))/30]">
                          <span className="text-[hsl(var(--muted-foreground))] text-xs">
                            Resolved value:
                          </span>
                          <div className="text-[hsl(var(--foreground))] font-medium mt-1">
                            {valueDisplay}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[hsl(var(--foreground))] overflow-hidden break-words whitespace-pre-wrap">
                      {valueDisplay}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Component to display task description and basic metadata
 */
interface TaskMetadataProps {
  data: TaskData;
}

const TaskMetadata: React.FC<TaskMetadataProps> = ({ data }) => {
  const taskType = getTaskType(data);

  return (
    <>
      {/* Task Type Badge */}
      <div className="flex justify-between items-start mb-2">
        <Badge>{taskType}</Badge>
        {data.isMocked && <Badge variant="warning">Mocked</Badge>}
      </div>

      {/* Description */}
      {data.description && (
        <Field
          label="Description"
          value={
            typeof data.description === "string"
              ? data.description
              : safeToString(data.description)
          }
        />
      )}

      {/* Action Reference */}
      {data.action && (
        <Field
          label="Action"
          value={
            <span className="break-words">
              {String(data.action.id)}
              {data.action.ref && (
                <span className="text-[hsl(var(--muted-foreground))]">
                  {" "}
                  (ref: {String(data.action.ref)})
                </span>
              )}
            </span>
          }
        />
      )}
    </>
  );
};

/**
 * Component to display task configuration parameters
 */
interface TaskConfigurationProps {
  data: TaskData;
}

const TaskConfiguration: React.FC<TaskConfigurationProps> = ({ data }) => {
  // Filter out undefined/null configuration values
  const hasTransitionMode =
    data.transitionMode !== undefined && data.transitionMode !== null;
  const hasPublishResultAs =
    data.publishResultAs !== undefined && data.publishResultAs !== null;
  const hasHumanSecondsSaved =
    data.humanSecondsSaved !== undefined && data.humanSecondsSaved !== null;
  const hasJoin = data.join !== undefined && data.join !== null;
  const hasRunAsOrgId =
    data.runAsOrgId !== undefined && data.runAsOrgId !== null;

  // If no configuration values exist, return null
  if (
    !hasTransitionMode &&
    !hasPublishResultAs &&
    !hasHumanSecondsSaved &&
    !hasJoin &&
    !hasRunAsOrgId
  ) {
    return (
      <div className="text-xs text-[hsl(var(--muted-foreground))]">
        No configuration parameters available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Left column */}
      <div className="space-y-3">
        {hasTransitionMode && (
          <Field label="Transition Mode" value={data.transitionMode} />
        )}

        {hasPublishResultAs && (
          <Field label="Publish Result As" value={data.publishResultAs} />
        )}

        {hasHumanSecondsSaved && (
          <Field
            label="Human Time Saved"
            value={<>{`${data.humanSecondsSaved} seconds`}</>}
          />
        )}
      </div>

      {/* Right column */}
      <div className="space-y-3">
        {hasJoin && (
          <Field
            label="Join"
            value={
              // Ensure join is always rendered as a string ReactNode
              typeof data.join === "boolean"
                ? String(data.join)
                : typeof data.join === "string"
                ? data.join
                : JSON.stringify(data.join)
            }
          />
        )}

        {hasRunAsOrgId && (
          <Field
            label="Run As Organization"
            value={
              typeof data.runAsOrgId === "string"
                ? data.runAsOrgId
                : String(data.runAsOrgId)
            }
          />
        )}
      </div>
    </div>
  );
};

/**
 * Component to display input parameters
 */
interface InputParametersProps {
  input: Record<string, unknown> | undefined;
}

const InputParameters: React.FC<InputParametersProps> = ({ input }) => {
  if (!input || Object.keys(input).length === 0) {
    return (
      <div className="text-xs text-[hsl(var(--muted-foreground))]">
        No input parameters available
      </div>
    );
  }

  // Filter out null and undefined values
  const filteredInput = Object.entries(input).filter(
    ([, value]) => value !== null && value !== undefined
  );

  if (filteredInput.length === 0) {
    return (
      <div className="text-xs text-[hsl(var(--muted-foreground))]">
        No non-null input parameters available
      </div>
    );
  }

  return (
    <div>
      <div className="font-medium text-xs text-[hsl(var(--muted-foreground))] mb-1">
        Input Parameters
      </div>
      <div className="border border-[hsl(var(--border))] rounded bg-[hsl(var(--muted)/0.3)] p-2 max-h-40 overflow-y-auto">
        <div className="space-y-1">
          {filteredInput.map(([key, value]) => {
            // Convert value to string first to avoid ReactNode type errors
            const displayValue = safeToString(value);

            return (
              <div
                key={key}
                className="grid grid-cols-[minmax(auto,30%)_1fr] gap-2"
              >
                <span className="font-medium text-xs whitespace-nowrap">
                  {key}:
                </span>
                <span className="text-[hsl(var(--muted-foreground))] text-xs overflow-x-auto break-words whitespace-normal">
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Component to display transitions
 */
interface TransitionsListProps {
  data: TaskData;
}

const TransitionsList: React.FC<TransitionsListProps> = ({ data }) => {
  if (!data.next || data.next.length === 0) {
    return (
      <div className="text-xs text-[hsl(var(--muted-foreground))]">
        No transitions available
      </div>
    );
  }

  return (
    <div>
      <div className="font-medium text-xs text-[hsl(var(--muted-foreground))] mb-1">
        Transitions
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {data.next.map((transition, index) => (
          <Transition
            key={index}
            transition={toSafeTransition(transition)}
            onSubWorkflowClick={data.onSubWorkflowClick}
            references={data.references}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Component to display advanced configuration
 */
interface AdvancedConfigurationProps {
  data: TaskData;
}

const AdvancedConfiguration: React.FC<AdvancedConfigurationProps> = ({
  data,
}) => {
  const hasAdvancedConfig =
    (data.retry && Object.keys(data.retry).length > 0) ||
    (data.securitySchema && Object.keys(data.securitySchema).length > 0) ||
    (data.mockInput &&
      Object.keys(data.mockInput).length > 0 &&
      (!data.mockInput.mock_result ||
        Object.keys(data.mockInput.mock_result).length > 0));

  if (!hasAdvancedConfig) {
    return (
      <div className="text-xs text-[hsl(var(--muted-foreground))]">
        No advanced configuration available
      </div>
    );
  }

  return (
    <div>
      <div className="font-medium text-xs text-[hsl(var(--muted-foreground))] mb-1">
        Advanced Configuration
      </div>
      <div className="space-y-3">
        {/* Mock Input if available and not empty */}
        {data.mockInput &&
          typeof data.mockInput === "object" &&
          data.mockInput !== null &&
          Object.keys(data.mockInput).length > 0 && (
            <div>
              <div className="text-xs font-medium mb-1">Mock Input</div>
              <div className="text-[hsl(var(--foreground))] rounded bg-[hsl(var(--muted))] p-2 max-h-40 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap overflow-x-auto break-words">
                  {JSON.stringify(data.mockInput, null, 2)}
                </pre>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

// ========== Main Component ==========

/**
 * TaskNodeDetails component for rendering the details of a task node
 * @param props Component props
 * @returns The rendered task node details
 */
export function TaskNodeDetails({
  isExpanded,
  data,
  hideTransitions = false,
}: TaskNodeDetailsProps) {
  if (!isExpanded) {
    return null;
  }

  return (
    <div
      className={cn(
        "p-3 bg-[hsl(var(--card))] border-x border-b border-[hsl(var(--border))] rounded-b-lg text-sm",
        !hideTransitions && "pb-6" // Add padding at the bottom if transitions are shown
      )}
    >
      {/* Task metadata (type, description, action) */}
      <TaskMetadata data={data} />

      {/* Tabbed interface for better organization */}
      <Tabs
        defaultValue="config"
        className="mt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <TabsList
          className="w-full justify-start flex-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          <TabsTrigger value="config" onClick={(e) => e.stopPropagation()}>
            Configuration
          </TabsTrigger>
          <TabsTrigger value="input" onClick={(e) => e.stopPropagation()}>
            Input
          </TabsTrigger>
          {!hideTransitions && (
            <TabsTrigger
              value="transitions"
              onClick={(e) => e.stopPropagation()}
            >
              Transitions
            </TabsTrigger>
          )}
          <TabsTrigger value="advanced" onClick={(e) => e.stopPropagation()}>
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" onClick={(e) => e.stopPropagation()}>
          <TaskConfiguration data={data} />
        </TabsContent>

        <TabsContent value="input" onClick={(e) => e.stopPropagation()}>
          <InputParameters input={data.input} />
        </TabsContent>

        {!hideTransitions && (
          <TabsContent value="transitions" onClick={(e) => e.stopPropagation()}>
            <TransitionsList data={data} />
          </TabsContent>
        )}

        <TabsContent value="advanced" onClick={(e) => e.stopPropagation()}>
          <AdvancedConfiguration data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
