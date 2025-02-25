import { DivideIcon as LucideIcon } from "lucide-react";

export interface TaskNodeData {
  id?: string; // Add id property for node identification
  name: string;
  description?: string;
  action?: {
    ref?: string;
    name?: string;
    description?: string;
  };
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  timeout?: number;
  transitionMode?: string;
  humanSecondsSaved?: number;
  publishResultAs?: string;
  type?: string;
  isMocked?: boolean;
  retry?: unknown;
  runAsOrgId?: string;
  securitySchema?: {
    redact?: {
      input?: string[];
      result?: string[];
    };
  };
  packOverrides?: unknown[];
  next?: {
    when: string;
    label?: string;
    followType?: "all" | "first";
  }[];
  hasJinjaTemplates?: boolean;
  isSubWorkflowTask?: boolean;
  subWorkflowId?: string;
  onSubWorkflowClick?: (subWorkflowId: string) => void;
  onTransitionHover?: (nodeId: string, transitionIndex: number | null) => void; // Add callback for transition hover
}

export interface TaskTypeInfo {
  icon: typeof LucideIcon;
  color: string;
  label: string;
  type?: string;
  timeout?: number;
}

export interface NodeIndicator {
  icon: typeof LucideIcon;
  color: string;
  title: string;
  label: string;
}

export interface NodeIndicators extends Array<NodeIndicator> {
  timeout?: number;
}
