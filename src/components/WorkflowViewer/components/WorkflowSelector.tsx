import React from "react";
import { WorkflowSelectorProps } from "./types";

export class WorkflowSelector extends React.Component<WorkflowSelectorProps> {
  render() {
    const { workflows, selectedWorkflowId, onSelect } = this.props;

    if (workflows.length <= 1) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        <label
          htmlFor="workflow-select"
          className="text-sm font-medium text-[hsl(var(--foreground))]"
        >
          Select Workflow:
        </label>
        <select
          id="workflow-select"
          value={selectedWorkflowId || ""}
          onChange={(e) => onSelect(e.target.value)}
          className="h-9 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {workflows.map((workflow) => (
            <option key={workflow.id} value={workflow.id}>
              {workflow.name} ({workflow.taskCount} tasks)
            </option>
          ))}
        </select>
      </div>
    );
  }
}
