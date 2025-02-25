import { useCallback } from "react";
import { toPng, toSvg } from "html-to-image";
import { useReactFlow, getRectOfNodes, getTransformForBounds } from "reactflow";

export function useWorkflowExport() {
  const { getNodes } = useReactFlow();

  const downloadImage = useCallback(
    async (type: "png" | "svg") => {
      const flowContainer = document.querySelector(
        ".react-flow"
      ) as HTMLElement;
      if (!flowContainer) {
        console.error("Flow container not found");
        return;
      }

      try {
        const nodes = getNodes();
        if (nodes.length === 0) {
          console.error("No nodes to export");
          return;
        }

        const nodesBounds = getRectOfNodes(nodes);
        const padding = 40;
        const width = nodesBounds.width + padding * 2;
        const height = nodesBounds.height + padding * 2;

        // Get transform but we don't need to use it with html-to-image
        getTransformForBounds(
          nodesBounds,
          width,
          height,
          0.95,
          1 // Add maxZoom parameter
        );

        const exportOptions = {
          width,
          height,
          style: {
            width: `${width}px`,
            height: `${height}px`,
            background: "hsl(var(--background))",
          },
          filter: (node: Element) => {
            const excludeClasses = [
              "react-flow__panel",
              "react-flow__background",
              "react-flow__controls",
              "react-flow__minimap",
            ];
            return !excludeClasses.some((className) =>
              node.classList?.contains(className)
            );
          },
          beforeClone: (originalNode: HTMLElement) => {
            const style = document.createElement("style");
            style.textContent = `
            .react-flow__node {
              background: hsl(var(--card));
              border: 1px solid hsl(var(--border));
              color: hsl(var(--foreground));
              font-family: "Work Sans", sans-serif;
            }
            .react-flow__edge-path {
              stroke: hsl(var(--workflow-blue));
              stroke-width: 2;
            }
            .workflow-node {
              background: hsl(var(--card));
              border: 1px solid hsl(var(--border));
              padding: 1.5rem;
              border-radius: 0.5rem;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            }
            .workflow-parameter {
              background: hsla(var(--muted) / 0.2);
              border: 1px solid hsla(var(--border) / 0.5);
              padding: 0.875rem;
              border-radius: 0.5rem;
            }
            .expanded-content,
            .node-content {
              display: block !important;
            }
            code, pre {
              background: hsla(var(--muted) / 0.2);
              color: hsl(var(--muted-foreground));
              padding: 0.5rem;
              border-radius: 0.375rem;
              font-family: ui-monospace, monospace;
            }
            * {
              color: hsl(var(--foreground));
            }
            .text-muted-foreground {
              color: hsl(var(--muted-foreground));
            }
            .text-workflow-blue { color: hsl(var(--workflow-blue)); }
            .text-workflow-green { color: hsl(var(--workflow-green)); }
            .text-workflow-purple { color: hsl(var(--workflow-purple)); }
            .text-workflow-pink { color: hsl(var(--workflow-pink)); }
            .text-workflow-yellow { color: hsl(var(--workflow-yellow)); }
            .text-workflow-orange { color: hsl(var(--workflow-orange)); }
            .text-workflow-red { color: hsl(var(--workflow-red)); }
            
            .bg-workflow-blue { background-color: hsl(var(--workflow-blue)); }
            .bg-workflow-green { background-color: hsl(var(--workflow-green)); }
            .bg-workflow-purple { background-color: hsl(var(--workflow-purple)); }
            .bg-workflow-pink { background-color: hsl(var(--workflow-pink)); }
            .bg-workflow-yellow { background-color: hsl(var(--workflow-yellow)); }
            .bg-workflow-orange { background-color: hsl(var(--workflow-orange)); }
            .bg-workflow-red { background-color: hsl(var(--workflow-red)); }
            
            .bg-workflow-blue\\/20 { background-color: hsla(var(--workflow-blue), 0.2); }
            .bg-workflow-green\\/20 { background-color: hsla(var(--workflow-green), 0.2); }
            .bg-workflow-purple\\/20 { background-color: hsla(var(--workflow-purple), 0.2); }
            .bg-workflow-pink\\/20 { background-color: hsla(var(--workflow-pink), 0.2); }
            .bg-workflow-yellow\\/20 { background-color: hsla(var(--workflow-yellow), 0.2); }
            .bg-workflow-orange\\/20 { background-color: hsla(var(--workflow-orange), 0.2); }
            .bg-workflow-red\\/20 { background-color: hsla(var(--workflow-red), 0.2); }
          `;
            originalNode.appendChild(style);
          },
        };

        let dataUrl: string;

        if (type === "png") {
          dataUrl = await toPng(flowContainer, exportOptions);
        } else {
          dataUrl = await toSvg(flowContainer, exportOptions);
        }

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `workflow-${new Date()
          .toISOString()
          .slice(0, 10)}.${type}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error(`Failed to export as ${type}:`, error);
      }
    },
    [getNodes]
  );

  return {
    downloadAsPng: () => downloadImage("png"),
    downloadAsSvg: () => downloadImage("svg"),
  };
}
