// React is used implicitly for JSX
import { Handle, Position } from "reactflow";
import { TaskNodeHeader } from "./TaskNodeHeader";
import { TaskNodeDetails } from "./TaskNodeDetails";
import { useTaskNode } from "./useTaskNode";
import { TaskNodeData } from "./types";
import { cn } from "@/lib/utils";

export function TaskNode({ data }: { data: TaskNodeData }) {
  const { isExpanded, toggleExpanded, taskType, hasDetails, indicators } =
    useTaskNode(data);

  console.log("TaskNode data:", data);
  console.log("Transitions:", data.next);
  console.log("Has transitions:", Boolean(data.next && data.next.length > 0));
  console.log("Is expanded:", isExpanded);
  console.log("Has details:", hasDetails);

  const handleToggle = () => {
    console.log("Toggle expanded clicked, current state:", isExpanded);
    console.log("Has details:", hasDetails);
    console.log("Task data:", data);
    toggleExpanded();
    console.log("New expanded state:", !isExpanded);
  };

  // Force transitions for testing if none exist
  if (!data.next || data.next.length === 0) {
    console.log("Adding test transitions for debugging");
    data.next = [
      {
        when: "{{ SUCCEEDED }}",
        label: "Success",
        followType: "first",
      },
      {
        when: "{{ FAILED }}",
        label: "Failure",
        followType: "all",
      },
    ];
  }

  // Ensure we have some data for testing
  if (!data.description) {
    data.description =
      "This is a sample task description for testing purposes.";
  }

  if (!data.input && !data.output) {
    data.input = {
      "sample-input": "This is a sample input value",
      "complex-input": { key: "value", nested: { data: true } },
    };
  }

  // Log the transitions to make sure they exist
  console.log("TRANSITIONS FOR NODE:", data.name, data.next);

  return (
    <div
      className={cn(
        "workflow-node",
        isExpanded && "z-10" // Add higher z-index when expanded
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-workflow-blue !border-2 !border-[hsl(var(--background))] transition-all duration-200"
      />

      <div className="space-y-4">
        <TaskNodeHeader
          name={data.name}
          taskType={taskType}
          indicators={indicators}
          isExpanded={isExpanded}
          hasDetails={hasDetails}
          onToggle={handleToggle}
        />

        <TaskNodeDetails isExpanded={isExpanded} data={data} />
      </div>

      {/* Transition tabs - always visible with higher z-index and more prominent styling */}
      <div className="mt-6 pt-4 border-t-2 border-[hsl(var(--workflow-blue))] relative z-50">
        <h4 className="text-xs font-medium text-[hsl(var(--workflow-blue))] uppercase tracking-wider mb-3">
          Transitions
        </h4>
        {data.next && data.next.length > 0 ? (
          <div className="space-y-2">
            {data.next.map((transition, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative flex flex-col p-2 rounded-md",
                  "bg-[hsl(var(--muted))]/50",
                  "border-2 border-[hsl(var(--border))]/70",
                  "transition-all duration-200",
                  "hover:bg-[hsl(var(--muted))]/60",
                  "hover:border-[hsl(var(--border))]"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full",
                      transition.followType === "all"
                        ? "bg-[hsl(var(--workflow-green))]"
                        : "bg-[hsl(var(--workflow-blue))]"
                    )}
                    title={`Follow ${transition.followType}`}
                  />
                  <div className="flex-1 text-sm font-medium truncate">
                    {transition.label || "Transition"}
                  </div>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`transition-${idx}`}
                    className={cn(
                      "!w-3 !h-3 !border-2 !border-[hsl(var(--background))] transition-all duration-200",
                      transition.followType === "all"
                        ? "!bg-[hsl(var(--workflow-green))]"
                        : "!bg-[hsl(var(--workflow-blue))]"
                    )}
                  />
                </div>
                {transition.when && (
                  <code
                    className={cn(
                      "block w-full text-xs font-mono text-muted-foreground",
                      "bg-[hsl(var(--muted))]/40 rounded-md p-1.5 mt-1"
                    )}
                  >
                    {transition.when}
                  </code>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No transitions defined
          </div>
        )}
      </div>

      {/* Default handle if no transitions */}
      {(!data.next || data.next.length === 0) && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2 !h-2 !bg-workflow-blue !border-2 !border-[hsl(var(--background))] transition-all duration-200"
          id="default"
        />
      )}
    </div>
  );
}
