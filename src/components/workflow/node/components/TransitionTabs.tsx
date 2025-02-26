/**
 * TransitionTabs Component
 *
 * Renders the transition tabs for a task node, allowing users to see
 * and interact with the transitions defined for the task.
 */
import { useState } from "react";
import { Handle, Position } from "reactflow";
import { TransitionTabsProps } from "../types";
import { cn } from "../../../../lib/utils";
import { formatTransitionLabel, getTransitionColor } from "../../shared/utils";

/**
 * TransitionTabs component for rendering the transition tabs of a task node
 * @param props Component props
 * @returns The rendered transition tabs
 */
export function TransitionTabs({
  transitions,
  onTransitionHover,
}: TransitionTabsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Handle mouse enter
  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    onTransitionHover(index);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredIndex(null);
    onTransitionHover(null);
  };

  // Handle click to toggle expanded state
  const handleClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (!transitions || transitions.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center">
      <div className="flex">
        {transitions.map((transition, index) => {
          const isHovered = hoveredIndex === index;
          const isExpanded = expandedIndex === index;
          const hasCondition = Boolean(transition.when);
          const hasMultipleTargets = transition.do && transition.do.length > 1;
          const hasPublish = Boolean(
            transition.publish && transition.publish.length > 0
          );
          const transitionColor = getTransitionColor(transition);
          const formattedLabel = formatTransitionLabel(transition);

          return (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Transition tab */}
              <div
                className={cn(
                  "px-3 py-1.5 border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-xs font-medium cursor-pointer transition-all",
                  index === 0 && "rounded-bl-md",
                  index === transitions.length - 1 && "rounded-br-md",
                  isHovered && "bg-[hsl(var(--accent))]",
                  isExpanded && "bg-[hsl(var(--accent))]"
                )}
                style={{
                  borderBottomColor:
                    isHovered || isExpanded ? transitionColor : undefined,
                  borderBottomWidth: isHovered || isExpanded ? "2px" : "1px",
                }}
                onClick={() => handleClick(index)}
              >
                {/* Transition label or index */}
                <div className="flex items-center gap-1.5">
                  <span>{formattedLabel || `Transition ${index + 1}`}</span>

                  {/* Condition indicator */}
                  {hasCondition && (
                    <div
                      className="w-3 h-3 text-[hsl(var(--workflow-yellow))]"
                      title={`Condition: ${transition.when}`}
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
                  {hasMultipleTargets && (
                    <div
                      className="w-3 h-3 text-[hsl(var(--workflow-purple))]"
                      title="Multiple targets"
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

                  {/* Publish indicator */}
                  {hasPublish && (
                    <div
                      className="w-3 h-3 text-[hsl(var(--workflow-green))]"
                      title="Publishes variables"
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
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded transition details */}
              {isExpanded && (
                <div className="absolute bottom-full left-0 mb-1 w-64 p-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md shadow-md z-10 space-y-3">
                  {/* Label */}
                  {transition.label && (
                    <div>
                      <div className="font-medium text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        Label
                      </div>
                      <div className="text-[hsl(var(--foreground))]">
                        {transition.label}
                      </div>
                    </div>
                  )}

                  {/* Condition */}
                  {hasCondition && (
                    <div>
                      <div className="font-medium text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        Condition
                      </div>
                      <div className="text-[hsl(var(--foreground))]">
                        {transition.when}
                      </div>
                    </div>
                  )}

                  {/* Targets */}
                  {transition.do && transition.do.length > 0 && (
                    <div>
                      <div className="font-medium text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        Targets
                      </div>
                      <div className="text-[hsl(var(--foreground))]">
                        {transition.do.join(", ")}
                      </div>
                    </div>
                  )}

                  {/* Published Variables */}
                  {hasPublish && (
                    <div>
                      <div className="font-medium text-xs text-[hsl(var(--muted-foreground))] mb-1">
                        Published Variables
                      </div>
                      <div className="text-[hsl(var(--foreground))] space-y-1">
                        {transition.publish?.map(
                          (pub: { key: string; value: string }, i: number) => (
                            <div key={i} className="flex items-start">
                              <span className="font-medium mr-2">
                                {pub.key}:
                              </span>
                              <span className="text-[hsl(var(--muted-foreground))]">
                                {pub.value}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Source handle for the transition */}
              <Handle
                type="source"
                position={Position.Bottom}
                id={`transition-${index}`}
                className={cn(
                  "!w-2 !h-2 !bg-[hsl(var(--background))] !border-2 transition-all duration-200",
                  isHovered || isExpanded
                    ? "!border-[hsl(var(--primary))]"
                    : "!border-[hsl(var(--muted))]"
                )}
                style={{
                  bottom: "-4px",
                  borderColor:
                    isHovered || isExpanded ? transitionColor : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
