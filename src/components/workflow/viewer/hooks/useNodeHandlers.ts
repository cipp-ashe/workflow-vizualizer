import { useMemo } from "react";
import { Node } from "reactflow";

interface UseNodeHandlersProps {
  nodes: Node[];
  handleTransitionHover: (
    sourceId: string | null,
    transitionIndex: number | null
  ) => void;
}

/**
 * Custom hook for preparing nodes with event handlers
 * Adds transition hover handlers to each node
 */
export function useNodeHandlers({
  nodes,
  handleTransitionHover,
}: UseNodeHandlersProps) {
  // Create nodes with transition hover handlers
  const nodesWithHandlers = useMemo(() => {
    try {
      return nodes.map((node) => {
        // Ensure node has valid data property
        if (!node.data) {
          return {
            ...node,
            data: {
              onTransitionHover: handleTransitionHover,
            },
          };
        }
        return {
          ...node,
          data: {
            ...node.data,
            onTransitionHover: handleTransitionHover,
          },
        };
      });
    } catch (error) {
      console.error("Error creating nodes with handlers", {
        error: error instanceof Error ? error.message : String(error),
      });
      return nodes; // Return original nodes as fallback
    }
  }, [nodes, handleTransitionHover]);

  return {
    nodesWithHandlers,
  };
}
