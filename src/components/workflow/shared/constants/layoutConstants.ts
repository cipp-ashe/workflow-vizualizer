/**
 * Layout configuration for the workflow visualization
 * This centralized configuration allows for easy adjustment of layout parameters
 */
export const DEFAULT_LAYOUT_CONFIG = {
  // Direction of the layout
  direction: "TB", // 'TB' (top to bottom), 'LR' (left to right)

  // Spacing between nodes
  nodeSpacing: 450,

  // Spacing between ranks (levels)
  rankSpacing: 500,

  // Alignment within ranks
  rankAlignment: "center", // 'left', 'center', 'right'

  // Padding around the entire layout
  padding: 50,

  // Whether to compact the layout
  compact: true,

  // Maximum width before wrapping to a new row/column
  maxWidth: 1200,

  // Node dimensions
  nodeSize: {
    width: 250,
    minHeight: 100,
    tabHeight: 40,
    padding: 20,
  },

  // Viewport settings
  viewport: {
    padding: 0.2,
    minZoom: 0.4,
    maxZoom: 1.2,
    fitViewOnInit: true,
    fitViewOnChange: true,
    animationDuration: 800,
  },

  // Legacy constants for backward compatibility
  // These will be deprecated in future versions
  legacy: {
    MIN_HEIGHT: "600px",
    DEFAULT_SPACING: 700,
    VERTICAL_SPACING: 550,
    NODE_HEIGHT: 100,
    TAB_HEIGHT: 150,
    NODE_PADDING: 90,
  },
};

// Export individual constants for convenience
export const {
  direction,
  nodeSpacing,
  rankSpacing,
  rankAlignment,
  padding,
  compact,
  maxWidth,
  nodeSize,
  viewport,
  legacy,
} = DEFAULT_LAYOUT_CONFIG;
