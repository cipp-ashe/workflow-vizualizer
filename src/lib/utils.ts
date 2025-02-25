import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a value for display, with special handling for objects (JSON)
 * @param value The value to format
 * @param maxLength Maximum length before truncation
 * @param indent Indentation level for JSON
 * @returns Formatted string representation
 */
export function formatValueForDisplay(
  value: unknown,
  maxLength: number = 200, // Reduced default max length
  indent: number = 2
): string {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "object") {
    try {
      // For objects, use a more compact representation with proper line breaks
      const formatted = JSON.stringify(value, null, indent);

      if (formatted.length > maxLength) {
        // For long objects, show a more readable preview with line breaks
        // This helps with text wrapping in the UI
        try {
          // Try to parse and re-stringify with fewer indents for a more compact view
          const obj = JSON.parse(formatted);
          const compactFormatted = JSON.stringify(obj, null, 1);

          if (compactFormatted.length <= maxLength) {
            return compactFormatted;
          }

          // If still too long, create a preview that's more wrapping-friendly
          const preview = compactFormatted.substring(0, maxLength);
          // Try to end at a logical break point
          const lastBreakPoint = Math.max(
            preview.lastIndexOf(","),
            preview.lastIndexOf("{"),
            preview.lastIndexOf("[")
          );

          return preview.substring(0, lastBreakPoint + 1) + "...";
        } catch {
          // Fallback to simple truncation if parsing fails
          return formatted.substring(0, maxLength) + "...";
        }
      }

      return formatted;
    } catch {
      return String(value);
    }
  }

  const stringValue = String(value);

  // Handle long strings with special characters that might affect wrapping
  if (stringValue.length > maxLength) {
    // For long strings, check if they contain special characters
    const hasSpecialChars = /[{}[\]()<>]/.test(stringValue);

    if (hasSpecialChars) {
      // For strings with special characters, add spaces after certain characters
      // to improve wrapping behavior
      const wrappable = stringValue
        .substring(0, maxLength)
        .replace(/([{}[\]()<>,])/g, "$1 ")
        .replace(/\s+/g, " "); // Normalize spaces

      return wrappable + "...";
    }

    // For regular long strings, just truncate
    return stringValue.substring(0, maxLength) + "...";
  }

  // For strings with special characters that might affect wrapping
  if (/[{}[\]()<>]/.test(stringValue) && stringValue.length > 50) {
    // Add spaces after certain characters to improve wrapping behavior
    return stringValue.replace(/([{}[\]()<>,])/g, "$1 ").replace(/\s+/g, " ");
  }

  return stringValue;
}
