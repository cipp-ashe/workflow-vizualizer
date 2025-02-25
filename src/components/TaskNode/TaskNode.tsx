/**
 * TaskNode Component
 *
 * Renders a workflow task as an interactive node within the workflow graph.
 * This component displays task information, status indicators, and handles user
 * interactions such as expanding/collapsing details and navigating to sub-workflows.
 *
 * @module components/TaskNode
 */
import { useEffect, useState, useRef } from "react";
import { Handle, Position } from "reactflow";
import { TaskNodeHeader } from "./TaskNodeHeader";
import { TaskNodeDetails } from "./TaskNodeDetails";
import { useTaskNode } from "./useTaskNode";
import { TransitionTabs } from "./TransitionTabs";
import { TaskNodeData } from "./types";
import { cn } from "@/lib/utils";
import "./TaskNode.css";

/**
 * TaskNode component for rendering workflow tasks
 *
 * @param {Object} props - Component props
 * @param {TaskNodeData} props.data - Task data containing all information about the task
 * @returns {JSX.Element} The rendered task node
 */
export function TaskNode({ data }: { data: TaskNodeData }) {
  // Initialize as ready to avoid rendering issues
  const [isReady, setIsReady] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);

  const { isExpanded, toggleExpanded, taskType, hasDetails, indicators } =
    useTaskNode(data);

  // Pass the hoveredTransitionIndex to the parent component via data callback if available
  // Removed console.log for production code

  // Force a re-render after component mount to ensure proper layout
  useEffect(() => {
    // Use requestAnimationFrame to ensure the DOM has been painted
    const rafId = requestAnimationFrame(() => {
      // This will trigger a re-render after the initial paint
      setIsReady(true);
    });

    return () => cancelAnimationFrame(rafId);
  }, []); // Only run once on mount

  // Keep the original function signature to match the TaskNodeHeader props
  const handleToggle = () => {
    toggleExpanded();
  };

  // Handle transition hover
  const handleTransitionHover = (transitionIndex: number | null) => {
    if (data.id) data.onTransitionHover?.(data.id, transitionIndex);
  };

  // Calculate the width of the node to properly size the tabs
  useEffect(() => {
    if (nodeRef.current) {
      nodeRef.current.style.setProperty(
        "--node-width",
        `${nodeRef.current.offsetWidth}px`
      );
    }
  }, [isExpanded]);

  // Don't render until ready to prevent grey nodes
  if (!isReady) {
    return (
      <div className="workflow-node-loading">
        <div className="p-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg">
          <div className="animate-pulse h-4 w-3/4 bg-[hsl(var(--muted))] rounded mb-2"></div>
          <div className="animate-pulse h-3 w-1/2 bg-[hsl(var(--muted))] rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={nodeRef}
      className={cn(
        "workflow-node",
        isExpanded && "expanded" // Use the expanded class for systematic z-index handling
      )}
      draggable="true"
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-[hsl(var(--workflow-blue))] !border-2 !border-[hsl(var(--background))] transition-all duration-200"
        data-nodeid={data.name}
        data-handlepos="top"
        data-id={`${data.name}-null-target`}
      />

      <div
        className={cn("space-y-4", hasDetails && "cursor-pointer select-none")}
        onClick={() => hasDetails && toggleExpanded()}
      >
        <TaskNodeHeader
          name={data.name}
          taskType={taskType}
          indicators={indicators}
          isExpanded={isExpanded}
          hasDetails={hasDetails}
          onToggle={handleToggle}
        />

        <TaskNodeDetails
          isExpanded={isExpanded}
          data={data}
          hideTransitions={true} // Hide transitions in details since they're now shown as tabs
        />
      </div>
      <div className="task-node-tabs">
        <TransitionTabs
          transitions={data.next || []}
          onTransitionHover={handleTransitionHover}
        />
      </div>
    </div>
  );
}
