/**
 * Shared types for the workflow components
 */
import { Task } from "../../../types/workflow";
import { Node, Edge } from "reactflow";

/**
 * WorkflowTask type for use in the workflow components
 */
export interface WorkflowTask extends Task {
  [key: string]: unknown;
}

/**
 * Layout configuration for the workflow layout engine
 */
export interface LayoutConfig {
  /**
   * Horizontal spacing between nodes
   */
  horizontalSpacing: number;

  /**
   * Vertical spacing between nodes
   */
  verticalSpacing: number;

  /**
   * Margin around the entire layout
   */
  margin: number;

  /**
   * Direction of the layout
   */
  direction: "TB" | "LR" | "RL" | "BT";

  /**
   * Whether to align nodes within the same rank
   */
  alignRanks: boolean;

  /**
   * Whether to center the graph after layout
   */
  centerGraph: boolean;

  /**
   * Node size configuration
   */
  nodeSize: {
    /**
     * Default width of a node
     */
    width: number;

    /**
     * Default minimum height of a node
     */
    minHeight: number;
  };

  /**
   * Padding around nodes
   */
  padding: number;

  /**
   * Spacing between nodes in the same rank
   */
  nodeSpacing: number;

  /**
   * Spacing between ranks
   */
  rankSpacing: number;

  /**
   * Alignment of nodes within ranks
   */
  rankAlignment?: "left" | "center" | "right";

  /**
   * Whether to compact the layout
   */
  compact?: boolean;

  /**
   * Maximum width of the layout
   */
  maxWidth?: number;

  /**
   * Viewport configuration
   */
  viewport?: {
    /**
     * Minimum zoom level
     */
    minZoom: number;

    /**
     * Maximum zoom level
     */
    maxZoom: number;
  };
}

/**
 * Layout engine interface
 */
export interface LayoutEngine {
  /**
   * Apply layout to nodes and edges
   * @param nodes The nodes to layout
   * @param edges The edges to consider for layout
   * @returns The nodes with updated positions
   */
  applyLayout(nodes: Node[], edges: Edge[]): Node[];
}

/**
 * Layout algorithm interface
 */
export interface LayoutAlgorithm {
  /**
   * Apply the layout algorithm to nodes and edges
   * @param nodes The nodes to layout
   * @param edges The edges to consider for layout
   * @param config The layout configuration
   * @returns The nodes with updated positions
   */
  apply(nodes: Node[], edges: Edge[], config: LayoutConfig): Node[];
}

/**
 * TaskNodeData type for use in the TaskNode component
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
}
