/**
 * Control panel component for workflow viewer
 * Provides buttons for exporting and clearing the workflow
 */
import { Panel } from "reactflow";
import { Download, Trash2 } from "lucide-react";

interface ControlPanelProps {
  /**
   * Callback for exporting the workflow as PNG
   */
  onExportPng: () => void;

  /**
   * Callback for exporting the workflow as SVG
   */
  onExportSvg: () => void;

  /**
   * Callback for clearing the workflow
   */
  onClear: () => void;
}

/**
 * Control panel component for workflow viewer
 * Provides buttons for exporting and clearing the workflow
 */
export function ControlPanel({
  onExportPng,
  onExportSvg,
  onClear,
}: ControlPanelProps) {
  /**
   * Handle clearing the workflow with confirmation
   */
  const handleClear = () => {
    if (
      window.confirm("Are you sure you want to clear the current workflow?")
    ) {
      onClear();
    }
  };

  return (
    <Panel position="top-right" className="space-y-2 min-w-[160px]">
      <button
        onClick={onExportPng}
        className="workflow-button workflow-button-primary"
      >
        <Download className="w-4 h-4" />
        Save as PNG
      </button>

      <button
        onClick={onExportSvg}
        className="workflow-button workflow-button-primary"
      >
        <Download className="w-4 h-4" />
        Save as SVG
      </button>

      <button
        onClick={handleClear}
        className="workflow-button workflow-button-danger"
      >
        <Trash2 className="w-4 h-4" />
        Clear Workflow
      </button>
    </Panel>
  );
}
