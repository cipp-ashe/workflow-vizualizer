// React is used implicitly for JSX
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskTypeInfo, NodeIndicators } from "./types";

interface TaskNodeHeaderProps {
  name: string;
  taskType: TaskTypeInfo;
  indicators: NodeIndicators;
  isExpanded: boolean;
  hasDetails: boolean;
  onToggle: () => void;
}

export function TaskNodeHeader({
  name,
  taskType,
  indicators,
  isExpanded,
  hasDetails,
  onToggle,
}: TaskNodeHeaderProps) {
  const Icon = taskType.icon;

  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <div
          className={cn(
            "p-2 rounded",
            `bg-[hsl(var(--workflow-${taskType.color}))]/10`
          )}
        >
          <Icon
            className={cn(
              "w-4 h-4",
              `text-[hsl(var(--workflow-${taskType.color}))]`
            )}
          />
        </div>
        <div className="text-xs text-foreground/80">{taskType.label}</div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 max-w-full">
          <div
            className="font-medium text-sm text-foreground truncate max-w-[200px]"
            title={name}
          >
            {name}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {indicators.map((indicator, index) => (
              <indicator.icon
                key={index}
                className={`w-3 h-3 text-[hsl(var(--workflow-${indicator.color}))]`}
                aria-label={indicator.title}
              />
            ))}
          </div>
        </div>
        {hasDetails && (
          <button
            className="text-foreground/70 hover:text-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
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

      <div className="flex gap-4 mt-1 text-xs text-foreground/80">
        {indicators.timeout && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {indicators.timeout}s
          </div>
        )}
      </div>
    </>
  );
}
