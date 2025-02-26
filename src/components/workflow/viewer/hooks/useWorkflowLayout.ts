/**
 * Hook for managing workflow layout
 *
 * This hook provides a way to apply automatic layout to workflow nodes
 * using the layout engine.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Node, Edge, ReactFlowInstance } from "reactflow";
import { DEFAULT_LAYOUT_CONFIG } from "../../shared/constants";
import { LayoutConfig } from "../../shared/types";
import { DagLayout, LayoutEngine } from "../layout";

interface UseWorkflowLayoutProps {
  nodes: Node[];
  edges: Edge[];
  reactFlowInstanceRef: React.RefObject<ReactFlowInstance | null>;
  config?: Partial<LayoutConfig>;
  autoLayout?: boolean;
}

/**
 * Hook for managing workflow layout
 */
export function useWorkflowLayout({
  nodes,
  edges,
  reactFlowInstanceRef,
  config = {},
  autoLayout = true,
}: UseWorkflowLayoutProps) {
  // State to track if layout is in progress
  const [isLayoutInProgress, setIsLayoutInProgress] = useState(false);

  // State to track if initial layout has been applied
  const [initialLayoutApplied, setInitialLayoutApplied] = useState(false);

  // Create layout engine with DAG algorithm - memoized to prevent recreation on every render
  const layoutEngine = useMemo(() => {
    return new LayoutEngine(new DagLayout(), {
      ...DEFAULT_LAYOUT_CONFIG,
      ...config,
    } as LayoutConfig);
  }, [config]);

  /**
   * Apply layout to the nodes
   * @param customConfig Optional custom layout configuration
   */
  const applyLayout = useCallback(
    (customConfig?: Partial<LayoutConfig>) => {
      if (
        nodes.length > 0 &&
        reactFlowInstanceRef.current &&
        !isLayoutInProgress
      ) {
        setIsLayoutInProgress(true);
        console.log(
          "WorkflowLayout: Applying layout",
          customConfig ? "with custom config" : "with default config"
        );

        try {
          // Create a layout engine with the custom config if provided
          const currentLayoutEngine = customConfig
            ? new LayoutEngine(new DagLayout(), {
                ...DEFAULT_LAYOUT_CONFIG,
                ...config,
                ...customConfig,
              } as LayoutConfig)
            : layoutEngine;

          // Apply layout to nodes
          const positionedNodes = currentLayoutEngine.applyLayout(nodes, edges);

          // Update node positions with animation
          const updatedNodes = nodes.map((node) => {
            const positionedNode = positionedNodes.find(
              (n) => n.id === node.id
            );
            if (positionedNode) {
              return {
                ...node,
                position: positionedNode.position,
              };
            }
            return node;
          });

          reactFlowInstanceRef.current.setNodes(updatedNodes);

          // Fit view to ensure all nodes are visible
          setTimeout(() => {
            if (reactFlowInstanceRef.current) {
              reactFlowInstanceRef.current.fitView({
                padding: 2.0,
                minZoom: 0.4,
                maxZoom: 1.2,
                duration: 800,
              });
            }
          }, 100);

          console.log("WorkflowLayout: Successfully applied layout");

          // Mark initial layout as applied
          setInitialLayoutApplied(true);
        } catch (error) {
          console.error("WorkflowLayout: Error applying layout", {
            error: error instanceof Error ? error.message : String(error),
          });
        } finally {
          // Reset layout flag when complete
          setTimeout(() => {
            setIsLayoutInProgress(false);
          }, 1200);
        }
      }
    },
    [
      nodes,
      edges,
      isLayoutInProgress,
      reactFlowInstanceRef,
      layoutEngine,
      config,
    ]
  );

  /**
   * Apply initial layout when nodes change
   */
  useEffect(() => {
    if (
      autoLayout &&
      nodes.length > 0 &&
      reactFlowInstanceRef.current &&
      !initialLayoutApplied &&
      !isLayoutInProgress
    ) {
      setIsLayoutInProgress(true);
      console.log("WorkflowLayout: Applying initial layout");

      // Apply layout with a small delay to ensure the DOM is ready
      const layoutTimer = window.setTimeout(() => {
        applyLayout();
      }, 300);

      return () => {
        window.clearTimeout(layoutTimer);
      };
    }
  }, [
    nodes,
    autoLayout,
    initialLayoutApplied,
    isLayoutInProgress,
    applyLayout,
    reactFlowInstanceRef,
  ]);

  /**
   * Handle window resize events
   */
  const handleResize = useCallback(() => {
    if (
      reactFlowInstanceRef.current &&
      nodes.length > 0 &&
      initialLayoutApplied &&
      !isLayoutInProgress
    ) {
      console.log("WorkflowLayout: Window resize detected, fitting view");
      reactFlowInstanceRef.current.fitView({
        padding: 2.0,
        minZoom: 0.4,
        maxZoom: 1.2,
      });
    }
  }, [nodes, initialLayoutApplied, isLayoutInProgress, reactFlowInstanceRef]);

  /**
   * Add window resize event listener
   */
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return {
    initialLayoutApplied,
    isLayoutInProgress,
    applyLayout,
  };
}
