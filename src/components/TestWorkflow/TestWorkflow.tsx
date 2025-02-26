import { useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import { WorkflowViewer } from "../workflow/viewer";
import { WorkflowBundle } from "@/types/workflow";
import sampleWorkflow from "../../../sample-workflow.json";

/**
 * TestWorkflow - A component for testing the WorkflowViewer with a sample workflow
 *
 * This component automatically loads a sample workflow and renders it using
 * the WorkflowViewer component. It's primarily used for development and testing.
 */
export function TestWorkflow() {
  const [template, setTemplate] = useState<WorkflowBundle | null>(null);

  useEffect(() => {
    console.log("Loading sample workflow automatically for testing");
    // Load the sample workflow automatically
    // Force the type to WorkflowBundle
    setTemplate(sampleWorkflow as unknown as WorkflowBundle);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Test Workflow Viewer
        </h1>

        <div className="grid grid-cols-1 gap-8">
          {template ? (
            <div className="col-span-1">
              <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg h-[800px] flex flex-col">
                <div className="p-4 border-b border-[hsl(var(--border))]">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Sample Workflow</h2>
                  </div>
                </div>
                <ReactFlowProvider>
                  <WorkflowViewer template={template} />
                </ReactFlowProvider>
              </div>
            </div>
          ) : (
            <div className="col-span-1 flex items-center justify-center h-[400px]">
              <p className="text-lg text-muted-foreground">
                Loading sample workflow...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
