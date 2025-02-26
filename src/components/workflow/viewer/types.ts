import { WorkflowBundle } from "../../../types/workflow";
import { Node, Edge } from "reactflow";

export interface WorkflowViewerProps {
  template: WorkflowBundle;
}

export interface WorkflowViewerState {
  selectedWorkflowId: string | null;
  workflowHierarchy: Array<{ id: string; name: string }>;
  nodes: Node[];
  edges: Edge[];
}

export interface WorkflowSelectorProps {
  workflows: Array<{
    id: string;
    name: string;
    taskCount: number;
    parentCount?: number;
    childCount?: number;
  }>;
  selectedWorkflowId: string | null;
  onSelect: (id: string) => void;
}

export interface WorkflowBreadcrumbProps {
  workflowHierarchy: Array<{ id: string; name: string }>;
  workflowRelationships?: Map<
    string,
    { parents: string[]; children: string[] }
  >;
  currentWorkflowName: string;
  onNavigate: (id: string, index: number) => void;
}

export interface WorkflowNavigationHookResult {
  selectedWorkflowId: string | null;
  workflowHierarchy: Array<{ id: string; name: string }>;
  workflowRelationships: Map<string, { parents: string[]; children: string[] }>;
  initializeNavigation: () => void;
  handleSubWorkflowClick: (workflowId: string) => void;
  handleWorkflowSelect: (workflowId: string) => void;
  handleBreadcrumbNavigate: (workflowId: string, index: number) => void;
  getParentWorkflows: (workflowId: string) => string[];
}

export interface WorkflowProcessorHookResult {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: import("reactflow").NodeChange[]) => void;
  onEdgesChange: (changes: import("reactflow").EdgeChange[]) => void;
  clearWorkflow: () => void;
}

export interface WorkflowExportHookResult {
  downloadAsSvg: (
    reactFlowInstance: import("reactflow").ReactFlowInstance | null
  ) => void;
}
