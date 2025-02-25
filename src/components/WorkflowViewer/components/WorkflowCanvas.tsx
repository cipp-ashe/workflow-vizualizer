import { useState, useCallback, useMemo } from "react";
import { LAYOUT_CONSTANTS } from "../constants/layoutConstants";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  MarkerType,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "../constants/nodeTypes";
import { WorkflowLegend } from "./WorkflowLegend";
import { WorkflowControls } from "./WorkflowControls";

// Node position type for force-directed layout
interface NodePosition {
  id: string;
  x: number;
  y: number;
}

/**
 * Apply force-directed layout to node positions
 * This function applies repulsive forces between nodes to prevent overlapping
 */
function applyForceDirectedLayout(nodePositions: NodePosition[]) {
  const repulsionForce = LAYOUT_CONSTANTS.DEFAULT_SPACING * 1.5; // Increased repulsion strength
  const minDistance = LAYOUT_CONSTANTS.DEFAULT_SPACING * 1.2; // Increased minimum distance between nodes

  // Apply repulsion between each pair of nodes
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      const nodeA = nodePositions[i];
      const nodeB = nodePositions[j];

      // Calculate distance between nodes
      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If nodes are too close, apply repulsion
      if (distance < minDistance) {
        // Calculate repulsion force
        const force = repulsionForce / (distance || 0.1); // Avoid division by zero

        // Calculate force components
        const fx = (dx / distance || 0) * force;
        const fy = (dy / distance || 0) * force;

        // Apply forces in opposite directions
        nodeA.x -= fx;
        nodeA.y -= fy;
        nodeB.x += fx;
        nodeB.y += fy;
      }
    }
  }
}

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onExportSvg: () => void;
  onClearWorkflow: () => void;
}

/**
 * Component for rendering the ReactFlow canvas with nodes and edges
 */
export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onExportSvg,
  onClearWorkflow,
}: WorkflowCanvasProps) {
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

  // Add transition hover handler to node data
  const nodesWithHandlers = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onTransitionHover: handleTransitionHover,
        id: node.id, // Ensure id is passed to the node data
      },
    }));
  }, [nodes, handleTransitionHover]);

  // Apply highlighting to edges when a transition is hovered
  const edgesWithHighlighting = useMemo(() => {
    if (!highlightedEdge.sourceId || highlightedEdge.transitionIndex === null) {
      return edges;
    }

    return edges.map((edge) => {
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
          opacity: 0.3,
        },
        zIndex: 0,
      };
    });
  }, [edges, highlightedEdge]);

  return (
    <div className="relative flex-1">
      <ReactFlow
        key="workflow-viewer"
        nodes={nodesWithHandlers}
        edges={highlightedEdge.sourceId ? edgesWithHighlighting : edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{
          padding: 3.0, // Further increased padding for more space around nodes
          includeHiddenNodes: true,
          minZoom: 0.5, // Limit how far it can zoom out
          maxZoom: 1.0, // Limit how far it can zoom in when fitting
        }}
        defaultEdgeOptions={{
          type: "step",
          style: { strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }} // Reduced zoom to show more of the graph
        connectionLineType={ConnectionLineType.Step}
        className="h-full"
        nodesDraggable={true}
        minZoom={0.1}
        maxZoom={2}
        nodesFocusable={true}
        elementsSelectable={true}
        onInit={(reactFlowInstance) => {
          // Force a re-render after initial render
          setTimeout(() => {
            window.dispatchEvent(new Event("resize"));

            // Apply force-directed layout to separate overlapping nodes
            if (nodes.length > 0) {
              // Get current node positions
              const nodePositions = nodes.map((node) => ({
                id: node.id,
                x: node.position.x,
                y: node.position.y,
              }));

              // Apply repulsion between nodes to separate them
              for (let i = 0; i < 10; i++) {
                // Run multiple iterations
                applyForceDirectedLayout(nodePositions);
              }

              // Update node positions
              const updatedNodes = nodes.map((node) => {
                const newPos = nodePositions.find((pos) => pos.id === node.id);
                if (newPos) {
                  return {
                    ...node,
                    position: { x: newPos.x, y: newPos.y },
                  };
                }
                return node;
              });

              // Update the nodes with new positions
              reactFlowInstance.setNodes(updatedNodes);

              // Fit view after layout is applied
              setTimeout(() => {
                reactFlowInstance.fitView({ padding: 3.0 });
              }, 100);
            }
          }, 100);
        }}
      >
        <Background />
        <Controls />

        {/* Legend component */}
        <WorkflowLegend />

        {/* Controls component */}
        <WorkflowControls
          onExportSvg={onExportSvg}
          onClearWorkflow={onClearWorkflow}
        />
      </ReactFlow>
    </div>
  );
}
