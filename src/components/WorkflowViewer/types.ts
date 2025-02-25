import { WorkflowBundle } from "../../types/workflow";
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
  }>;
  selectedWorkflowId: string | null;
  onSelect: (id: string) => void;
}

export interface WorkflowBreadcrumbProps {
  workflowHierarchy: Array<{ id: string; name: string }>;
  currentWorkflowName: string;
  onNavigate: (id: string, index: number) => void;
}
