import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TaskTypeInfo, NodeIndicators } from "./types";
import { cn } from "@/lib/utils";

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
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={cn(
              "p-2.5 rounded-md ring-1 transition-colors",
              `bg-[hsl(var(--workflow-${taskType.color}))]/10`,
              `ring-[hsl(var(--workflow-${taskType.color}))]/20`
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                `text-[hsl(var(--workflow-${taskType.color}))]`
              )}
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-base text-foreground leading-tight">
              {name}
            </h3>
            <div className="text-sm text-muted-foreground mt-1.5">
              {taskType.label}
            </div>
          </div>
        </div>

        {hasDetails && (
          <button
            onClick={() => {
              console.log(
                "TaskNodeHeader toggle button clicked, isExpanded:",
                isExpanded
              );
              onToggle();
            }}
            className="p-2 -mt-1 -mr-1 rounded-md transition-colors hover:bg-[hsl(var(--muted))]/20"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      {indicators.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {indicators.map((indicator, index) => (
            <div
              key={index}
              className={cn(
                "p-2 rounded-md ring-1 transition-all hover:scale-110",
                `bg-[hsl(var(--workflow-${indicator.color}))]/10`,
                `ring-[hsl(var(--workflow-${indicator.color}))]/20`
              )}
              title={indicator.title}
            >
              <indicator.icon
                className={cn(
                  "w-4 h-4",
                  `text-[hsl(var(--workflow-${indicator.color}))]`
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
