import React from "react";
import { ReactFlowProvider } from "reactflow";
import { WorkflowViewer as WorkflowViewerComponent } from "./WorkflowViewer/WorkflowViewer";
import { WorkflowBundle } from "../types/workflow";

export function WorkflowViewer({ template }: { template: WorkflowBundle }) {
  return (
    <ReactFlowProvider>
      <WorkflowViewerComponent template={template} />
    </ReactFlowProvider>
  );
}
