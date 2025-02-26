/**
 * WorkflowCanvas Component
 *
 * Renders the ReactFlow canvas for visualizing workflows.
 */
import { useCallback, useRef, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  ReactFlowInstance,
  Panel,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflowLayout } from "../hooks/useWorkflowLayout";
import { useEdgeHighlighting } from "../hooks/useEdgeHighlighting";
import { useNodeHandlers } from "../hooks/useNodeHandlers";
import { useReactFlowConfig } from "../hooks/useReactFlowConfig";
import { nodeTypes } from "../constants/nodeTypes";
import { WorkflowLegend } from "./WorkflowLegend";
import { WorkflowControls } from "./WorkflowControls";
import { LayoutControls } from "./LayoutControls";
import { Task } from "../../../../types/workflow";

interface WorkflowCanvasProps {
  nodes: Node<Task>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onExportSvg: (reactFlowInstance: ReactFlowInstance | null) => void;
  onClearWorkflow: () => void;
}

/**
 * WorkflowCanvas component for rendering the workflow graph
 * @param props Component props
 * @returns The rendered canvas
 */
export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onExportSvg,
  onClearWorkflow,
}: WorkflowCanvasProps) {
  // Reference to the ReactFlow instance
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

  // Use custom hooks for different functionalities
  const { reactFlowProps } = useReactFlowConfig();

  // Memoize edge highlighting to prevent unnecessary recalculations
  const { handleTransitionHover, edgesWithHighlighting, highlightedEdge } =
    useEdgeHighlighting({ edges });

  // Memoize node handlers to prevent unnecessary recalculations
  const { nodesWithHandlers } = useNodeHandlers({
    nodes,
    handleTransitionHover,
  });

  // Use the layout hook
  const { applyLayout } = useWorkflowLayout({
    nodes,
    edges,
    reactFlowInstanceRef,
    autoLayout: true,
  });

  // Memoize the nodes and edges to use based on highlighting state
  const displayNodes = useMemo(
    () => (highlightedEdge.sourceId ? nodesWithHandlers : nodes),
    [highlightedEdge.sourceId, nodesWithHandlers, nodes]
  );

  const displayEdges = useMemo(
    () => (highlightedEdge.sourceId ? edgesWithHighlighting : edges),
    [highlightedEdge.sourceId, edgesWithHighlighting, edges]
  );

  // Handle ReactFlow initialization
  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;

    // Trigger a resize event to ensure proper rendering
    window.dispatchEvent(new Event("resize"));
  }, []);

  // Handle export button click
  const handleExportClick = useCallback(() => {
    onExportSvg(reactFlowInstanceRef.current);
  }, [onExportSvg]);

  // Handle auto-layout button click
  const handleAutoLayoutClick = useCallback(() => {
    applyLayout();
  }, [applyLayout]);

  // Handle clear button click
  const handleClearClick = useCallback(() => {
    onClearWorkflow();
  }, [onClearWorkflow]);

  return (
    <div className="relative flex-1 h-full min-h-[500px]">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        fitView
        fitViewOptions={reactFlowProps.fitViewOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        attributionPosition="bottom-right"
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        minZoom={0.1}
        maxZoom={2}
        nodesFocusable={true}
        elementsSelectable={true}
        defaultEdgeOptions={reactFlowProps.defaultEdgeOptions}
        defaultViewport={reactFlowProps.defaultViewport}
      >
        <Background />
        <Controls />

        {/* Legend component */}
        <WorkflowLegend />

        {/* Controls component */}
        <WorkflowControls
          onExportSvg={handleExportClick}
          onClearWorkflow={handleClearClick}
        />

        {/* Layout controls component */}
        <LayoutControls onApplyLayout={applyLayout} />

        <Panel position="top-right" className="flex gap-2 mt-16">
          <button
            onClick={handleAutoLayoutClick}
            className="px-3 py-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md text-sm"
          >
            Auto Layout
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
