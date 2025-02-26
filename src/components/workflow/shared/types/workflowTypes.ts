/**
 * Shared type definitions for workflow components
 */
import { Node, Edge } from "reactflow";

/**
 * Workflow object structure
 */
export interface WorkflowObject {
  type: string;
  hash?: string;
  fields?: {
    id?: string;
    name?: string;
    tasks?: WorkflowTask[];
    [key: string]: unknown;
  };
  nonfunctional_fields?: {
    [key: string]: unknown;
  };
}

/**
 * Workflow bundle structure
 */
export interface WorkflowBundle {
  objects?: Record<string, WorkflowObject>;
  references?: Record<string, WorkflowReference>;
  type?: string;
  fields?: {
    tasks?: WorkflowTask[];
    [key: string]: unknown;
  };
}

/**
 * Workflow reference structure
 */
export interface WorkflowReference {
  src_key_hash: string;
  locations?: string[];
}

/**
 * Workflow task structure
 */
export interface WorkflowTask {
  id: string;
  name?: string;
  description?: string;
  action?: { id: string; ref?: string };
  next?: WorkflowTransition[];
  metadata?: { x: number; y: number; clonedFromId?: string };
  nonfunctional_fields?: {
    metadata?: { x: number; y: number; clonedFromId?: string };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Workflow transition structure
 */
export interface WorkflowTransition {
  when?: string;
  label?: string | null;
  do?: string[];
  followType?: "all" | "first";
  [key: string]: unknown;
}

/**
 * Layout configuration interface
 */
export interface LayoutConfig {
  direction: "TB" | "LR";
  nodeSpacing: number;
  rankSpacing: number;
  rankAlignment: "left" | "center" | "right";
  padding: number;
  compact: boolean;
  maxWidth: number;
  nodeSize: {
    width: number;
    minHeight: number;
    tabHeight: number;
    padding: number;
  };
  viewport: {
    padding: number;
    minZoom: number;
    maxZoom: number;
    fitViewOnInit: boolean;
    fitViewOnChange: boolean;
    animationDuration: number;
  };
}

/**
 * Style configuration interface
 */
export interface StyleConfig {
  node: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    header: {
      backgroundColor: string;
      textColor: string;
      fontSize: string;
      fontWeight: number;
      padding: string;
    };
    content: {
      backgroundColor: string;
      textColor: string;
      fontSize: string;
      padding: string;
    };
    tabs: {
      backgroundColor: string;
      activeBackgroundColor: string;
      textColor: string;
      activeTextColor: string;
      fontSize: string;
      borderRadius: number;
    };
    handle: {
      size: number;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    };
  };
  edge: {
    default: {
      strokeColor: string;
      strokeWidth: number;
      animated: boolean;
    };
    highlighted: {
      strokeColor: string;
      strokeWidth: number;
      animated: boolean;
    };
    followAll: {
      strokeColor: string;
      strokeWidth: number;
      animated: boolean;
    };
    followFirst: {
      strokeColor: string;
      strokeWidth: number;
      animated: boolean;
    };
    marker: {
      type: string;
      width: number;
      height: number;
    };
  };
  background: {
    color: string;
    pattern: string | null;
    patternColor: string;
    patternSize: number;
    patternSpacing: number;
  };
}

/**
 * Task node data structure
 */
export interface TaskNodeData {
  id: string;
  name: string;
  description?: string;
  action?: {
    ref?: string;
    name?: string;
    description?: string;
  };
  input?: unknown;
  output?: unknown;
  timeout?: number;
  transitionMode?: string;
  humanSecondsSaved?: number;
  publishResultAs?: string;
  type?: string;
  isMocked?: boolean;
  retry?: unknown;
  runAsOrgId?: string;
  securitySchema?: unknown;
  packOverrides?: unknown;
  hasJinjaTemplates?: boolean;
  isSubWorkflowTask?: boolean;
  subWorkflowId?: string;
  onSubWorkflowClick?: (subWorkflowId: string) => void;
  onTransitionHover?: (nodeId: string, transitionIndex: number | null) => void;
  next?: {
    when: string;
    label: string | null;
    followType: "all" | "first";
  }[];
}

/**
 * Extended Node type with workflow-specific data
 */
export type WorkflowNode = Node<TaskNodeData>;

/**
 * Extended Edge type with workflow-specific data
 */
export type WorkflowEdge = Edge<{
  condition?: string;
  followType?: "all" | "first";
  transitionIndex?: number;
}>;
