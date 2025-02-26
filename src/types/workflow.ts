export interface WorkflowBundle {
  version: number;
  exportedAt: string;
  objects: {
    [key: string]: WorkflowObject;
  };
  references: {
    [key: string]: Reference;
  };
}

export interface WorkflowObject {
  type: string;
  content_hash: string;
  hash: string;
  fields: {
    id?: string;
    tasks?: Task[];
    ref?: string;
    [key: string]: unknown; // Use unknown instead of any
  };
  nonfunctional_fields?: {
    name?: string;
    description?: string;
    metadata?: {
      x: number;
      y: number;
    };
    [key: string]: unknown; // Use unknown instead of any
  };
}

export interface Reference {
  kind: string;
  type: string;
  src_key_hash: string;
  content_hash: string;
  locations: string[];
}

export interface Task {
  id: string;
  type: string;
  metadata?: {
    x: number;
    y: number;
  };
  name?: string;
  description?: string;
  action?: {
    id: string;
    ref?: string;
  };
  next?: {
    id: string;
    label?: string;
    do?: string[];
    when?: string;
    publish?: Array<{ key: string; value: string }>;
  }[];
  input?: Record<string, unknown>; // Use unknown instead of any
  timeout?: number;
  transitionMode?: string;
  humanSecondsSaved?: number;
  publishResultAs?: string;
  // Add missing properties
  isMocked?: boolean;
  join?: number; // Number indicating join behavior
  retry?: unknown;
  runAsOrgId?: string;
  securitySchema?: unknown;
  packOverrides?: unknown;
  mockInput?: Record<string, unknown>; // Mock input for testing
}
