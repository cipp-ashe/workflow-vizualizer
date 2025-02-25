import { DivideIcon as LucideIcon } from "lucide-react";

export interface TaskNodeData {
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
}

export type NodeIndicators = NodeIndicator[];
