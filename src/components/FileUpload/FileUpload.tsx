import React, { useCallback } from "react";
import { Upload } from "lucide-react";
import { isValidWorkflowBundle } from "@/lib/workflow-validation";
import { FILE_UPLOAD_CONSTANTS } from "./constants";
import { FileUploadProps } from "./types";

/**
 * FileUpload Component
 *
 * A component that allows users to upload Rewst workflow JSON templates.
 * It provides a drag-and-drop interface and validates that the uploaded
 * file contains a valid workflow bundle.
 *
 * @example
 * ```tsx
 * <FileUpload onFileUpload={(data) => console.log('Uploaded workflow:', data)} />
 * ```
 */
export function FileUpload({ onFileUpload }: FileUploadProps) {
  /**
   * Handles file selection from the input element
   * Reads the file, validates it as a workflow bundle, and calls the onFileUpload callback
   */
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
              FILE_UPLOAD_CONSTANTS.ERROR_MESSAGES.INVALID_FORMAT
            );
          }

          onFileUpload(data);
        } catch (error) {
          console.error("Error parsing workflow template:", error);
          alert(
            error instanceof Error
              ? error.message
              : FILE_UPLOAD_CONSTANTS.ERROR_MESSAGES.PARSING_ERROR
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
            <span className="font-semibold">
              {FILE_UPLOAD_CONSTANTS.UI_TEXT.CLICK_TO_UPLOAD}
            </span>{" "}
            {FILE_UPLOAD_CONSTANTS.UI_TEXT.DRAG_AND_DROP}
          </p>
          <p className="text-xs text-muted-foreground">
            {FILE_UPLOAD_CONSTANTS.UI_TEXT.FILE_TYPE_HINT}
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept={FILE_UPLOAD_CONSTANTS.ACCEPTED_FILE_TYPES}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
