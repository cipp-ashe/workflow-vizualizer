import { WorkflowBundle } from "@/types/workflow";

/**
 * Props for the FileUpload component
 */
export interface FileUploadProps {
  /**
   * Callback function that is called when a file is successfully uploaded and parsed
   * @param template The parsed workflow bundle
   */
  onFileUpload: (template: WorkflowBundle) => void;
}
