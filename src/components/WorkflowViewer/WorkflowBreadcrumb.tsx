import React from "react";
import { WorkflowBreadcrumbProps } from "./types";

export class WorkflowBreadcrumb extends React.Component<WorkflowBreadcrumbProps> {
  render() {
    const { workflowHierarchy, currentWorkflowName, onNavigate } = this.props;

    if (workflowHierarchy.length === 0) {
      return null;
    }

    return (
      <div className="flex items-center gap-2 mr-4">
        <div className="flex items-center gap-1 text-sm text-[hsl(var(--foreground))]">
          {workflowHierarchy.map((wf, index) => (
            <React.Fragment key={wf.id}>
              <button
                onClick={() => onNavigate(wf.id, index)}
                className="text-[hsl(var(--primary))] hover:underline font-medium"
              >
                {wf.name}
              </button>
              <span className="mx-1 text-[hsl(var(--muted-foreground))]">
                /
              </span>
            </React.Fragment>
          ))}
          <span className="font-medium">{currentWorkflowName}</span>
        </div>
      </div>
    );
  }
}
