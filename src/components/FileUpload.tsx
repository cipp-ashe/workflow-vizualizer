import React, { useCallback } from "react";
import { Upload } from "lucide-react";
import { WorkflowBundle } from "../types/workflow";
import { isValidWorkflowBundle } from "../lib/workflow-validation";

interface FileUploadProps {
  onFileUpload: (template: WorkflowBundle) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          // Validate that the data is a valid WorkflowBundle
          if (!isValidWorkflowBundle(data)) {
            throw new Error(
              "Invalid workflow format. The file does not contain a valid Rewst workflow."
            );
          }

          onFileUpload(data as WorkflowBundle);
        } catch (error) {
          console.error("Error parsing workflow template:", error);
          alert(
            error instanceof Error
              ? error.message
              : "Error parsing workflow template. Please ensure it is a valid JSON file."
          );
        }
      };
      reader.readAsText(file);
    },
    [onFileUpload]
  );

  return (
    <div className="flex items-center justify-center w-full p-8">
      <label
        className="flex flex-col items-center justify-center w-full h-64 
                        border-2 border-border border-dashed rounded-lg 
                        cursor-pointer bg-[hsl(var(--muted))]
                        hover:bg-[hsl(var(--muted))]/80 transition-colors duration-200"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
          <p className="mb-2 text-sm text-foreground">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-muted-foreground">
            Rewst workflow template (.json)
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".json"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
