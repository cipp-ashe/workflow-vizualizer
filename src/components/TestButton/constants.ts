/**
 * Constants for the TestButton component
 */

/**
 * Button variants for demonstration
 */
export const BUTTON_VARIANTS = [
  { name: "Default", variant: undefined },
  { name: "Destructive", variant: "destructive" },
  { name: "Outline", variant: "outline" },
  { name: "Secondary", variant: "secondary" },
  { name: "Ghost", variant: "ghost" },
  { name: "Link", variant: "link" },
] as const;

/**
 * Button sizes for demonstration
 */
export const BUTTON_SIZES = [
  { name: "Small", size: "sm" },
  { name: "Default", size: "default" },
  { name: "Large", size: "lg" },
] as const;

/**
 * SVG path for the icon button
 */
export const ICON_PATH = "M12 5v14M5 12h14";

/**
 * UI text for the TestButton component
 */
export const UI_TEXT = {
  TITLE: "Button Test",
  VARIANTS_TITLE: "Default Variants",
  SIZES_TITLE: "Size Variants",
};
