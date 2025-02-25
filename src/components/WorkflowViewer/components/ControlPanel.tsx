import React from "react";
import { Panel } from "reactflow";
import { Download, Trash2 } from "lucide-react";

interface ControlPanelProps {
  onExportPng: () => void;
  onExportSvg: () => void;
  onClear: () => void;
}

export function ControlPanel({
  onExportPng,
  onExportSvg,
  onClear,
}: ControlPanelProps) {
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
