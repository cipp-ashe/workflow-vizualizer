import { Globe, Mail, Webhook, MessageSquare, Code, Zap } from "lucide-react";

/**
 * Legend items for the workflow viewer
 * These define the visual indicators shown in the legend
 */
export const legendItems = [
  // Task Types
  {
    type: "task",
    icon: Globe,
    color: "blue-500",
    label: "API",
    title: "API Call",
  },
  {
    type: "task",
    icon: Mail,
    color: "purple-500",
    label: "Email",
    title: "Email Task",
  },
  {
    type: "task",
    icon: Webhook,
    color: "green-500",
    label: "Hook",
    title: "Webhook",
  },
  {
    type: "task",
    icon: MessageSquare,
    color: "pink-500",
    label: "Chat",
    title: "Message/Chat",
  },

  // Indicators
  {
    type: "indicator",
    icon: Code,
    color: "purple-500",
    label: "Jinja",
    title: "Jinja Templates",
  },
  {
    type: "indicator",
    icon: Zap,
    color: "orange-500",
    label: "Retry",
    title: "Has Retry Config",
  },

  // Transitions
  {
    type: "transition",
    color: "blue-500",
    label: "First",
    title: "Follow First",
  },
  {
    type: "transition",
    color: "green-500",
    label: "All",
    title: "Follow All",
  },
];
