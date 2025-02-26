/**
 * Types for the TaskNode component
 */
import { Task } from "../../../types/workflow";

/**
 * Data for the TaskNode component
 */
export interface TaskNodeData extends Task {
  /**
   * Callback for when a sub-workflow is clicked
   */
  onSubWorkflowClick?: (workflowId: string) => void;

  /**
   * Callback for when a transition is hovered
   */
  onTransitionHover?: (nodeId: string, transitionIndex: number | null) => void;

  /**
   * References to the workflow context for resolving variable placeholders
   */
  references?: Record<string, unknown>;
}

/**
 * Props for the TaskNodeHeader component
 */
export interface TaskNodeHeaderProps {
  /**
   * The name of the task
   */
  name?: string;

  /**
   * The type of the task
   */
  taskType: string;

  /**
   * Indicators for the task
   */
  indicators: {
    hasAction: boolean;
    hasSubWorkflow: boolean;
    hasCondition: boolean;
    hasMultipleTargets: boolean;
  };

  /**
   * Whether the task node is expanded
   */
  isExpanded: boolean;

  /**
   * Whether the task has details
   */
  hasDetails: boolean;

  /**
   * Callback for when the expand/collapse toggle is clicked
   */
  onToggle: () => void;
}

/**
 * Props for the TaskNodeDetails component
 */
export interface TaskNodeDetailsProps {
  /**
   * Whether the task node is expanded
   */
  isExpanded: boolean;

  /**
   * The data for the task
   */
  data: TaskNodeData;

  /**
   * Whether to hide transitions
   */
  hideTransitions?: boolean;

  /**
   * References from the workflow context
   */
  references?: Record<string, unknown>;
}

/**
 * Props for the TransitionTabs component
 */
export interface TransitionTabsProps {
  /**
   * The transitions for the task
   */
  transitions: Array<{
    id?: string;
    label?: string;
    when?: string;
    do?: string[];
    publish?: Array<{ key: string; value: string }>;
  }>;

  /**
   * Callback for when a transition is hovered
   */
  onTransitionHover: (transitionIndex: number | null) => void;
}
