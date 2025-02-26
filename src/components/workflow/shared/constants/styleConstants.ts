/**
 * Style configuration for the workflow visualization
 * This centralized configuration allows for easy adjustment of visual styling parameters
 */
export const DEFAULT_STYLE_CONFIG = {
  // Node styling
  node: {
    // Base styles
    backgroundColor: "hsl(var(--card))",
    borderColor: "hsl(var(--border))",
    borderWidth: 1,
    borderRadius: 8,

    // Header styles
    header: {
      backgroundColor: "hsl(var(--card))",
      textColor: "hsl(var(--foreground))",
      fontSize: "1rem",
      fontWeight: 600,
      padding: "0.75rem",
    },

    // Content styles
    content: {
      backgroundColor: "hsl(var(--card))",
      textColor: "hsl(var(--foreground))",
      fontSize: "0.875rem",
      padding: "0.75rem",
    },

    // Transition tab styles
    tabs: {
      backgroundColor: "hsl(var(--muted))",
      activeBackgroundColor: "hsl(var(--primary))",
      textColor: "hsl(var(--muted-foreground))",
      activeTextColor: "hsl(var(--primary-foreground))",
      fontSize: "0.75rem",
      borderRadius: 4,
    },

    // Handle styles (connection points)
    handle: {
      size: 8,
      backgroundColor: "hsl(var(--workflow-blue))",
      borderColor: "hsl(var(--background))",
      borderWidth: 2,
    },
  },

  // Edge styling (connections between nodes)
  edge: {
    // Default edge style
    default: {
      strokeColor: "hsl(var(--workflow-blue))",
      strokeWidth: 2,
      animated: true,
    },

    // Highlighted edge style
    highlighted: {
      strokeColor: "hsl(var(--workflow-green))",
      strokeWidth: 3,
      animated: true,
    },

    // Follow-all edge style (when all transitions are followed)
    followAll: {
      strokeColor: "hsl(var(--workflow-green))",
      strokeWidth: 2,
      animated: true,
    },

    // Follow-first edge style (when only the first transition is followed)
    followFirst: {
      strokeColor: "hsl(var(--workflow-blue))",
      strokeWidth: 2,
      animated: true,
    },

    // Marker (arrow) styles
    marker: {
      type: "arrowclosed",
      width: 20,
      height: 20,
    },
  },

  // Background styling
  background: {
    color: "hsl(var(--background))",
    pattern: "dots", // 'dots', 'lines', 'cross', or null for no pattern
    patternColor: "hsl(var(--muted))",
    patternSize: 1,
    patternSpacing: 12,
  },
};

// Export individual constants for convenience
export const { node, edge, background } = DEFAULT_STYLE_CONFIG;
