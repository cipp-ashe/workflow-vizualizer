import { useState, useCallback, useMemo } from "react";
import { Edge } from "reactflow";

interface UseEdgeHighlightingProps {
  edges: Edge[];
}

/**
 * Custom hook for managing edge highlighting in the workflow
 * Handles highlighting edges when transitions are hovered
 */
export function useEdgeHighlighting({ edges }: UseEdgeHighlightingProps) {
  // State for tracking highlighted edges
  const [highlightedEdge, setHighlightedEdge] = useState<{
    sourceId: string | null;
    transitionIndex: number | null;
  }>({
    sourceId: null,
    transitionIndex: null,
  });

  // Handle transition hover events
  const handleTransitionHover = useCallback(
    (sourceId: string | null, transitionIndex: number | null) => {
      setHighlightedEdge({ sourceId, transitionIndex });
    },
    []
  );

  // Apply highlighting to edges when a transition is hovered
  const edgesWithHighlighting = useMemo(() => {
    if (!highlightedEdge.sourceId || highlightedEdge.transitionIndex === null) {
      return edges;
    }

    const highlightedEdges = edges.map((edge) => {
      if (
        edge.source === highlightedEdge.sourceId &&
        edge.sourceHandle === `transition-${highlightedEdge.transitionIndex}`
      ) {
        return {
          ...edge,
          style: {
            ...edge.style,
            strokeWidth: 5,
            stroke: "hsl(var(--accent))",
          },
          animated: true,
          zIndex: 1000,
          // Maintain the marker end
          markerEnd: edge.markerEnd,
        };
      }
      return {
        ...edge,
        style: {
          ...edge.style,
          opacity: 0.5, // Increased opacity for better visibility
        },
        zIndex: 0,
      };
    });

    return highlightedEdges;
  }, [edges, highlightedEdge]);

  return {
    highlightedEdge,
    handleTransitionHover,
    edgesWithHighlighting,
  };
}
