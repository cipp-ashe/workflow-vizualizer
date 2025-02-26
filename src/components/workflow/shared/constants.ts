/**
 * Shared constants for the workflow components
 */
import { LayoutConfig } from "./types";

/**
 * Node dimensions
 */
export const NODE_DIMENSIONS = {
  /**
   * Default width of a node
   */
  width: 300,

  /**
   * Default height of a node
   */
  height: 100,

  /**
   * Padding around a node
   */
  padding: 20,
};

/**
 * Default layout configuration
 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  /**
   * Horizontal spacing between nodes
   */
  horizontalSpacing: 150,

  /**
   * Vertical spacing between nodes
   */
  verticalSpacing: 100,

  /**
   * Margin around the entire layout
   */
  margin: 50,

  /**
   * Direction of the layout
   */
  direction: "TB", // Top to Bottom

  /**
   * Whether to align nodes within the same rank
   */
  alignRanks: true,

  /**
   * Whether to center the graph after layout
   */
  centerGraph: true,

  /**
   * Node size configuration
   */
  nodeSize: {
    width: NODE_DIMENSIONS.width,
    minHeight: NODE_DIMENSIONS.height,
  },

  /**
   * Padding around nodes
   */
  padding: NODE_DIMENSIONS.padding,

  /**
   * Spacing between nodes in the same rank
   */
  nodeSpacing: 50,

  /**
   * Spacing between ranks
   */
  rankSpacing: 120,

  /**
   * Alignment of nodes within ranks
   */
  rankAlignment: "center",

  /**
   * Whether to compact the layout
   */
  compact: true,

  /**
   * Maximum width of the layout
   */
  maxWidth: 1200,

  /**
   * Viewport configuration
   */
  viewport: {
    minZoom: 0.4,
    maxZoom: 1.2,
  },
};

/**
 * Workflow colors
 */
export const WORKFLOW_COLORS = {
  /**
   * Color for action nodes
   */
  action: "hsl(var(--workflow-blue))",

  /**
   * Color for workflow nodes
   */
  workflow: "hsl(var(--workflow-green))",

  /**
   * Color for condition nodes
   */
  condition: "hsl(var(--workflow-yellow))",

  /**
   * Color for multiple targets
   */
  multipleTargets: "hsl(var(--workflow-purple))",

  /**
   * Color for unknown nodes
   */
  unknown: "hsl(var(--muted))",
};
