/**
 * Constants for the FileUpload component
 */

export const FILE_UPLOAD_CONSTANTS = {
  /**
   * Accepted file types for the file input
   */
  ACCEPTED_FILE_TYPES: ".json",

  /**
   * Error messages for file upload validation
   */
  ERROR_MESSAGES: {
    INVALID_FORMAT:
      "Invalid workflow format. The file does not contain a valid Rewst workflow.",
    PARSING_ERROR:
      "Error parsing workflow template. Please ensure it is a valid JSON file.",
  },

  /**
   * UI text for the file upload component
   */
  UI_TEXT: {
    CLICK_TO_UPLOAD: "Click to upload",
    DRAG_AND_DROP: "or drag and drop",
    FILE_TYPE_HINT: "Rewst workflow template (.json)",
  },
};
