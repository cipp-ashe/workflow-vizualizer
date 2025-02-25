import { useState } from "react";
import { Handle, Position } from "reactflow";
import { cn } from "../lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
  Zap,
  Database,
  Settings,
  AlertCircle,
  Code,
  Globe,
  Mail,
  Webhook,
  MessageSquare,
  Variable,
} from "lucide-react";

interface TaskNodeData {
  name: string;
  description?: string;
  action?: {
    ref?: string;
    name?: string;
    description?: string;
  };
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  timeout?: number;
  transitionMode?: string;
  humanSecondsSaved?: number;
  publishResultAs?: string;
  type?: string;
  isMocked?: boolean;
  retry?: unknown;
  runAsOrgId?: string;
  securitySchema?: {
    redact?: {
      input?: string[];
      result?: string[];
    };
  };
  packOverrides?: unknown[];
  next?: {
    when: string;
    label?: string;
    followType?: "all" | "first";
  }[];
  hasJinjaTemplates?: boolean;
  isSubWorkflowTask?: boolean;
  subWorkflowId?: string;
  onSubWorkflowClick?: (subWorkflowId: string) => void;
}

const getTaskTypeInfo = (action?: { ref?: string }) => {
  if (!action?.ref) return { icon: Variable, color: "gray", label: "Variable" };

  const ref = action.ref.toLowerCase();
  if (ref.includes("http") || ref.includes("api")) {
    return { icon: Globe, color: "blue", label: "API Call" };
  }
  if (ref.includes("email") || ref.includes("mail")) {
    return { icon: Mail, color: "purple", label: "Email" };
  }
  if (ref.includes("webhook")) {
    return { icon: Webhook, color: "green", label: "Webhook" };
  }
  if (ref.includes("chat") || ref.includes("message")) {
    return { icon: MessageSquare, color: "pink", label: "Message" };
  }
  return { icon: Settings, color: "gray", label: "Action" };
};

export function TaskNode({ data }: { data: TaskNodeData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const taskType = getTaskTypeInfo(data.action);

  const hasDetails =
    data.description ||
    data.action?.ref ||
    (data.input && Object.keys(data.input).length > 0) ||
    (data.output && Object.keys(data.output).length > 0) ||
    data.timeout ||
    data.transitionMode ||
    data.humanSecondsSaved ||
    data.publishResultAs ||
    data.type ||
    data.securitySchema?.redact;

  const hasSecurity =
    data.securitySchema?.redact &&
    (data.securitySchema.redact.input?.length ||
      data.securitySchema.redact.result?.length);
  const hasRetry = !!data.retry;
  const isMocked = !!data.isMocked;
  const hasCustomOrg = !!data.runAsOrgId;
  const hasJinjaTemplates = !!data.hasJinjaTemplates;
  const isSubWorkflowTask = !!data.isSubWorkflowTask;

  return (
    <div className="workflow-node">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-[hsl(var(--workflow-blue))] !border-2 !border-[hsl(var(--background))]"
      />

      <div
        className={cn("space-y-4", hasDetails && "cursor-pointer select-none")}
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              "p-2 rounded",
              `bg-[hsl(var(--workflow-${taskType.color}))]/10`
            )}
          >
            <taskType.icon
              className={cn(
                "w-4 h-4",
                `text-[hsl(var(--workflow-${taskType.color}))]`
              )}
            />
          </div>
          <div className="text-xs text-muted-foreground">{taskType.label}</div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm text-foreground">
              {data.name}
            </div>
            <div className="flex gap-1">
              {hasSecurity && (
                <Settings
                  className="w-3 h-3 text-[hsl(var(--workflow-blue))]"
                  aria-label="Has security redactions"
                />
              )}
              {hasRetry && (
                <Zap
                  className="w-3 h-3 text-[hsl(var(--workflow-orange))]"
                  aria-label="Has retry configuration"
                />
              )}
              {hasJinjaTemplates && (
                <Code
                  className="w-3 h-3 text-[hsl(var(--workflow-purple))]"
                  aria-label="Contains Jinja templates"
                />
              )}
              {isMocked && (
                <AlertCircle
                  className="w-3 h-3 text-[hsl(var(--workflow-yellow))]"
                  aria-label="Mock enabled"
                />
              )}
              {hasCustomOrg && (
                <Database
                  className="w-3 h-3 text-[hsl(var(--workflow-purple))]"
                  aria-label="Custom organization"
                />
              )}
              {isSubWorkflowTask && (
                <div
                  className="w-3 h-3 rounded-full bg-[hsl(var(--workflow-orange))] cursor-pointer"
                  title="Sub-workflow (click to navigate)"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (data.onSubWorkflowClick && data.subWorkflowId) {
                      data.onSubWorkflowClick(data.subWorkflowId);
                    }
                  }}
                />
              )}
            </div>
          </div>
          {hasDetails && (
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
          {data.type && (
            <div className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3" />
              {data.type}
            </div>
          )}
          {data.timeout && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {data.timeout}s
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-[hsl(var(--border))]">
            {data.description && (
              <div className="text-xs text-muted-foreground">
                {data.description}
              </div>
            )}

            {data.action?.ref && (
              <div className="text-xs pt-2">
                <div
                  className={cn(
                    "inline-flex px-2 py-1 rounded text-xs font-medium",
                    "bg-[hsl(var(--workflow-blue))]/10",
                    "text-[hsl(var(--workflow-blue))]"
                  )}
                >
                  {data.action.name || data.action.ref}
                </div>
                {data.action.description && (
                  <div className="text-muted-foreground mt-2">
                    {data.action.description}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {data.input && Object.keys(data.input).length > 0 && (
                <div className="bg-[hsl(var(--muted))]/20 p-4 rounded-lg">
                  <span className="font-medium text-[hsl(var(--workflow-blue))]">
                    Input Parameters:
                  </span>
                  <div className="pl-4 mt-2 space-y-2">
                    {Object.entries(data.input).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className="font-mono text-[hsl(var(--workflow-purple))]">
                          {key}:
                        </span>
                        <span className="text-muted-foreground">
                          {typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.output && Object.keys(data.output).length > 0 && (
                <div className="bg-[hsl(var(--muted))]/20 p-4 rounded-lg">
                  <span className="font-medium text-[hsl(var(--workflow-green))]">
                    Output Parameters:
                  </span>
                  <div className="pl-4 mt-2 space-y-2">
                    {Object.entries(data.output).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className="font-mono text-[hsl(var(--workflow-green))]">
                          {key}:
                        </span>
                        <span className="text-muted-foreground">
                          {typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs space-y-2">
              {data.transitionMode && (
                <div>
                  <span className="font-medium text-foreground">
                    Transition Mode:
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {data.transitionMode.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
              )}

              {typeof data.humanSecondsSaved === "number" &&
                data.humanSecondsSaved > 0 && (
                  <div>
                    <span className="font-medium text-foreground">
                      Time Saved:
                    </span>{" "}
                    <span className="text-[hsl(var(--workflow-green))]">
                      {data.humanSecondsSaved}s
                    </span>
                  </div>
                )}

              {data.publishResultAs && (
                <div>
                  <span className="font-medium text-foreground">
                    Result Published As:
                  </span>{" "}
                  <code className="bg-[hsl(var(--muted))]/20 px-2 py-1 rounded text-muted-foreground">
                    {data.publishResultAs}
                  </code>
                </div>
              )}

              {hasSecurity && (
                <div>
                  <span className="font-medium text-foreground">
                    Security Redactions:
                  </span>
                  <div className="pl-4 text-muted-foreground">
                    {data.securitySchema?.redact?.input?.length && (
                      <div>
                        Input: {data.securitySchema.redact.input.join(", ")}
                      </div>
                    )}
                    {data.securitySchema?.redact?.result?.length && (
                      <div>
                        Result: {data.securitySchema.redact.result.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {data.next && data.next.length > 0 && (
                <div>
                  <span className="font-medium text-foreground">
                    Transitions:
                  </span>
                  <div className="pl-4 text-muted-foreground">
                    {data.next.map((transition, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {transition.followType && (
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              transition.followType === "all"
                                ? "bg-[hsl(var(--workflow-green))]"
                                : "bg-[hsl(var(--workflow-blue))]"
                            )}
                            title={`Follow ${transition.followType}`}
                          />
                        )}
                        {transition.label && (
                          <span className="font-medium text-foreground">
                            {transition.label}:
                          </span>
                        )}
                        <span className="font-mono text-xs">
                          {transition.when}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[hsl(var(--workflow-blue))] !border-2 !border-[hsl(var(--background))]"
      />
    </div>
  );
}
