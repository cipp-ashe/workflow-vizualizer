/**
 * Component for displaying workflow triggers
 */
import { TriggerInfo } from "../../shared/utils/triggerUtils";
import { cn } from "../../../../lib/utils";

interface WorkflowTriggersProps {
  triggers: TriggerInfo[];
  onTriggerClick?: (triggerId: string) => void;
}

/**
 * Component for displaying workflow triggers
 */
export function WorkflowTriggers({
  triggers,
  onTriggerClick,
}: WorkflowTriggersProps) {
  if (!triggers || triggers.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">Workflow Triggers</h3>
      <div className="space-y-2">
        {triggers.map((trigger) => (
          <div
            key={trigger.id}
            className="flex items-center p-2 bg-[hsl(var(--muted))] rounded border border-[hsl(var(--border))]"
            onClick={() => onTriggerClick && onTriggerClick(trigger.id)}
            role="button"
            tabIndex={0}
          >
            <div className="flex-1">
              <div className="font-medium">{trigger.name}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                Type: {trigger.type}
              </div>
              {Object.entries(trigger.parameters).length > 0 && (
                <div className="mt-1 text-xs">
                  <div className="font-medium">Parameters:</div>
                  <ul className="list-disc list-inside">
                    {Object.entries(trigger.parameters).map(([key, value]) => (
                      <li
                        key={key}
                        className="text-[hsl(var(--muted-foreground))]"
                      >
                        {key}: {JSON.stringify(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="ml-2">
              <span
                className={cn(
                  "inline-block w-3 h-3 rounded-full",
                  trigger.enabled ? "bg-green-500" : "bg-red-500"
                )}
                title={trigger.enabled ? "Enabled" : "Disabled"}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
