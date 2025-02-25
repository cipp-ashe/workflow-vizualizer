import { useState, useMemo } from "react";
import {
  Settings,
  Zap,
  Code,
  AlertCircle,
  Database,
  Globe,
  Mail,
  Webhook,
  MessageSquare,
  Variable,
} from "lucide-react";
import { TaskNodeData, NodeIndicators } from "./types";

export function useTaskNode(data: TaskNodeData) {
  // Always start with nodes collapsed by default and ensure they stay that way
  const [isExpanded, setIsExpanded] = useState(false);

  const taskType = useMemo(() => {
    if (!data.action?.ref) {
      return { icon: Variable, color: "gray", label: "Variable" };
    }

    const ref = data.action.ref.toLowerCase();
    if (ref.includes("http") || ref.includes("api")) {
      return { icon: Globe, color: "blue", label: "API" };
    }
    if (ref.includes("email") || ref.includes("mail")) {
      return { icon: Mail, color: "purple", label: "Email" };
    }
    if (ref.includes("webhook")) {
      return { icon: Webhook, color: "green", label: "Hook" };
    }
    if (ref.includes("chat") || ref.includes("message")) {
      return { icon: MessageSquare, color: "pink", label: "Chat" };
    }
    return { icon: Settings, color: "gray", label: "Action" };
  }, [data.action?.ref]);

  const indicators = useMemo<NodeIndicators>(() => {
    const list = [] as NodeIndicators;

    if (data.securitySchema?.redact) {
      list.push({
        icon: Settings,
        color: "blue",
        title: "Security",
        label: "Has security redactions",
      });
    }

    if (data.retry) {
      list.push({
        icon: Zap,
        color: "orange",
        title: "Retry",
        label: "Has retry configuration",
      });
    }

    if (data.hasJinjaTemplates) {
      list.push({
        icon: Code,
        color: "purple",
        title: "Jinja",
        label: "Contains Jinja templates",
      });
    }

    if (data.isMocked) {
      list.push({
        icon: AlertCircle,
        color: "yellow",
        title: "Mock",
        label: "Mock enabled",
      });
    }

    if (data.runAsOrgId) {
      list.push({
        icon: Database,
        color: "purple",
        title: "Org",
        label: "Custom organization",
      });
    }

    // Add indicator for sub-workflow tasks
    if (data.isSubWorkflowTask) {
      list.push({
        icon: Webhook, // Using Webhook icon for sub-workflows
        color: "orange",
        title: "Sub-workflow",
        label: "Sub-workflow (click to navigate)",
      });
    }

    // Add timeout information
    if (data.timeout) {
      list.timeout = data.timeout;
    }

    return list;
  }, [data]);

  const hasDetails = Boolean(
    data.description ||
      data.action?.ref ||
      (data.input && Object.keys(data.input).length > 0) ||
      (data.output && Object.keys(data.output).length > 0) ||
      data.timeout ||
      data.transitionMode ||
      data.humanSecondsSaved ||
      data.publishResultAs ||
      data.type ||
      data.securitySchema?.redact
  );

  return {
    isExpanded,
    toggleExpanded: () => setIsExpanded((prev) => !prev),
    taskType,
    hasDetails,
    indicators,
  };
}
