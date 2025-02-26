/**
 * Hook for managing task node state and behavior
 */
import { useMemo, useState } from "react";
import { TaskNodeData } from "../types";

/**
 * Hook for managing task node state and behavior
 * @param data The task node data
 * @returns Task node state and handlers
 */
export function useTaskNode(data: TaskNodeData) {
  // State for expanded/collapsed state
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  // Determine task type
  const taskType = useMemo(() => {
    if (data.action) {
      return "action";
    } else if (data.type === "workflow") {
      return "workflow";
    } else if (data.next && data.next.some((t) => t.when)) {
      return "condition";
    } else {
      return "unknown";
    }
  }, [data]);

  // Determine if the task has details to show
  const hasDetails = useMemo(() => {
    return Boolean(
      data.description ||
        data.action ||
        (data.input && Object.keys(data.input).length > 0) ||
        data.timeout
    );
  }, [data]);

  // Determine indicators to show
  const indicators = useMemo(() => {
    return {
      hasAction: Boolean(data.action),
      hasSubWorkflow: taskType === "workflow",
      hasCondition: Boolean(data.next && data.next.some((t) => t.when)),
      hasMultipleTargets: Boolean(
        data.next && data.next.some((t) => t.do && t.do.length > 1)
      ),
    };
  }, [data, taskType]);

  return {
    isExpanded,
    toggleExpanded,
    taskType,
    hasDetails,
    indicators,
  };
}
