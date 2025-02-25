import { useState } from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";

interface TransitionTabsProps {
  transitions: {
    when: string;
    label?: string;
    followType?: "all" | "first";
  }[];
  onTransitionHover?: (transitionIndex: number | null) => void;
}

/**
 * Component for displaying transition tabs at the bottom of a node
 */
export function TransitionTabs({
  transitions,
  onTransitionHover,
}: TransitionTabsProps) {
  const [hoveredTransition, setHoveredTransition] = useState<number | null>(
    null
  );

  // If there are no transitions, don't render anything
  if (!transitions || transitions.length === 0) {
    return (
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-[hsl(var(--workflow-blue))] !border-2 !border-[hsl(var(--background))]"
        id="default"
        style={{
          bottom: "-2px", // Consistent with the other handles
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
        }}
      />
    );
  }

  const handleMouseEnter = (index: number) => {
    setHoveredTransition(index);
    onTransitionHover?.(index);
  };

  const handleMouseLeave = () => {
    setHoveredTransition(null);
    onTransitionHover?.(null);
  };

  return (
    <div className="transition-tabs-container">
      <div className="transition-tabs">
        {transitions.map((transition, idx) => {
          const isFollowAll = transition.followType === "all";
          const isHovered = hoveredTransition === idx;

          return (
            <div
              key={`transition-tab-${idx}`}
              className={cn(
                "transition-tab",
                isFollowAll
                  ? "bg-[hsl(var(--workflow-green))]/20 border-[hsl(var(--workflow-green))]"
                  : "bg-[hsl(var(--workflow-blue))]/20 border-[hsl(var(--workflow-blue))]",
                isHovered && "ring-2 ring-[hsl(var(--ring))]"
              )}
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={handleMouseLeave}
              title={transition.when}
            >
              <div className="transition-tab-content">
                {transition.label && transition.label.trim() ? (
                  <span className="font-medium w-full">{transition.label}</span>
                ) : (
                  <span className="font-mono text-xs w-full">
                    {transition.when}
                  </span>
                )}
              </div>

              <Handle
                type="source"
                position={Position.Bottom}
                id={`transition-${idx}`}
                className={cn(
                  "!w-2 !h-2 !border-2 !border-[hsl(var(--background))]",
                  isFollowAll
                    ? "!bg-[hsl(var(--workflow-green))]"
                    : "!bg-[hsl(var(--workflow-blue))]"
                )}
                style={{
                  bottom: "-2px", // Moved up from -8px to -2px to better align with rounded tabs
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 50,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
