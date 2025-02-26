/**
 * WorkflowSelector Component
 *
 * Renders a dropdown selector for choosing which workflow to display.
 */
import { useState } from "react";
import { cn } from "../../../../lib/utils";

interface WorkflowSelectorProps {
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

/**
 * WorkflowSelector component for selecting a workflow
 * @param props Component props
 * @returns The rendered workflow selector
 */
export function WorkflowSelector({
  workflows,
  selectedWorkflowId,
  onSelect,
}: WorkflowSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get the selected workflow
  const selectedWorkflow = workflows.find(
    (workflow) => workflow.id === selectedWorkflowId
  );

  // Toggle the dropdown
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // Handle workflow selection
  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Dropdown button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md"
      >
        <span>
          {selectedWorkflow ? `${selectedWorkflow.name}` : "Select Workflow"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-md shadow-md">
          <ul className="py-1">
            {workflows.map((workflow) => (
              <li key={workflow.id}>
                <button
                  onClick={() => handleSelect(workflow.id)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-[hsl(var(--accent))]",
                    workflow.id === selectedWorkflowId &&
                      "bg-[hsl(var(--accent))]"
                  )}
                >
                  <div className="font-medium">{workflow.name}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    <span>{workflow.taskCount} tasks</span>

                    {/* Display parent-child relationships if available */}
                    {(workflow.parentCount || workflow.childCount) && (
                      <span className="ml-2">
                        {workflow.parentCount ? (
                          <span className="mr-2">↑{workflow.parentCount}</span>
                        ) : null}
                        {workflow.childCount ? (
                          <span>↓{workflow.childCount}</span>
                        ) : null}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
