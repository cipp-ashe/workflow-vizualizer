import { Download, Trash2 } from "lucide-react";

interface WorkflowControlsProps {
  onExportSvg: () => void;
  onClearWorkflow: () => void;
}

/**
 * Component for displaying workflow control buttons
 */
export function WorkflowControls({
  onExportSvg,
  onClearWorkflow,
}: WorkflowControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-50 flex gap-2">
      <button
        onClick={onExportSvg}
        className="flex items-center gap-1 px-2 py-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary))/90] text-xs font-medium transition-colors"
        title="Save as SVG"
      >
        <Download className="w-3 h-3" />
        <span className="hidden sm:inline">Save</span>
      </button>

      <button
        onClick={onClearWorkflow}
        className="flex items-center gap-1 px-2 py-1 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] rounded-md hover:bg-[hsl(var(--destructive))/90] text-xs font-medium transition-colors"
        title="Clear Workflow"
      >
        <Trash2 className="w-3 h-3" />
        <span className="hidden sm:inline">Clear</span>
      </button>
    </div>
  );
}
