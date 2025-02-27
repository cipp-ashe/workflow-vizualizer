import { NodeTypes } from "reactflow";
import { TaskNode } from "../../node/TaskNode";

/**
 * Node types for the ReactFlow component
 * Maps node type identifiers to their respective React components
 */
export const nodeTypes: NodeTypes = {
  task: TaskNode,
};
