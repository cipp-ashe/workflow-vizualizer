import { useMemo } from "react";
import { MarkerType } from "reactflow";

/**
 * Custom hook for ReactFlow configuration
 * Provides memoized configuration options for ReactFlow
 */
export function useReactFlowConfig() {
  // Performance optimization: memoize ReactFlow props
  const reactFlowProps = useMemo(
    () => ({
      fitViewOptions: {
        padding: 4.0,
        includeHiddenNodes: true,
        minZoom: 0.4,
        maxZoom: 1.2,
      },
      defaultEdgeOptions: {
        type: "smoothstep",
        style: {
          strokeWidth: 3,
          stroke: "hsl(var(--workflow-blue))",
          strokeOpacity: 0.8,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
        },
        pathOptions: {
          offset: 15, // Offset from the node
          borderRadius: 8, // Rounded corners for paths
        },
      },
      defaultViewport: { x: 0, y: 0, zoom: 0.7 },
    }),
    []
  );

  return {
    reactFlowProps,
  };
}
