/**
 * Hook for exporting workflow visualizations
 */
import { useCallback } from "react";
import { ReactFlowInstance } from "reactflow";
import { WorkflowExportHookResult } from "../types";

/**
 * Hook for exporting workflow visualizations
 * @returns Export functions
 */
export function useWorkflowExport(): WorkflowExportHookResult {
  /**
   * Download the workflow as an SVG
   * @param reactFlowInstance The ReactFlow instance
   */
  const downloadAsSvg = useCallback(
    (reactFlowInstance: ReactFlowInstance | null) => {
      if (!reactFlowInstance) return;

      // Get the ReactFlow viewport
      const flowElement = document.querySelector(".react-flow") as HTMLElement;
      if (!flowElement) return;

      // Create a new SVG element
      const svgElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      const svgContent = flowElement.querySelector(
        ".react-flow__viewport"
      ) as SVGElement;
      if (!svgContent) return;

      // Copy the SVG content
      const svgContentClone = svgContent.cloneNode(true) as SVGElement;

      // Set the SVG attributes
      const boundingRect = svgContent.getBoundingClientRect();
      svgElement.setAttribute("width", boundingRect.width.toString());
      svgElement.setAttribute("height", boundingRect.height.toString());
      svgElement.setAttribute(
        "viewBox",
        `0 0 ${boundingRect.width} ${boundingRect.height}`
      );

      // Append the SVG content to the SVG element
      svgElement.appendChild(svgContentClone);

      // Convert the SVG element to a string
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create a download link
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "workflow.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up
      URL.revokeObjectURL(svgUrl);
    },
    []
  );

  return {
    downloadAsSvg,
  };
}
