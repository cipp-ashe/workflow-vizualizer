import { useState } from "react";
import { ReactFlowProvider } from "reactflow";
import { FileUpload } from "./components/FileUpload";
import { WorkflowViewer } from "./components/WorkflowViewer";
import { GitHubRepoBrowser } from "./components/GitHubRepoBrowser";
import { TestWorkflow } from "./components/TestWorkflow";
import { WorkflowBundle } from "./types/workflow";
import "./styles/globals.css";

// Set this to true to use the test workflow component
const USE_TEST_WORKFLOW = true;

function App() {
  const [template, setTemplate] = useState<WorkflowBundle | null>(null);
  const [showBrowser, setShowBrowser] = useState(true);

  const handleFileUpload = (data: WorkflowBundle) => {
    console.log("Uploaded template:", data);
    setTemplate(data);
    // Don't hide the browser when a workflow is loaded
    // This allows users to easily go back to browsing after viewing a workflow
  };

  const handleBackClick = () => {
    setTemplate(null);
  };

  // Use the test workflow component for debugging
  if (USE_TEST_WORKFLOW) {
    return <TestWorkflow />;
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Rewst Workflow Viewer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left side: File upload and GitHub browser */}
          <div
            className={`${
              template ? "lg:col-span-4" : "lg:col-span-12"
            } space-y-8`}
          >
            {/* Only show file upload when no template is loaded */}
            {!template && (
              <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg">
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
            )}

            {/* Always show GitHub browser */}
            {showBrowser && (
              <GitHubRepoBrowser onWorkflowSelect={handleFileUpload} />
            )}
          </div>

          {/* Right side: Workflow visualization */}
          {template && (
            <div className="lg:col-span-8">
              <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg h-[800px] flex flex-col">
                <div className="p-4 border-b border-[hsl(var(--border))]">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handleBackClick}
                      className="px-4 py-2 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80
                                text-foreground rounded-md transition-colors"
                    >
                      ← Back
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowBrowser(!showBrowser)}
                        className="px-4 py-2 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80
                                  text-foreground rounded-md transition-colors"
                      >
                        {showBrowser ? "Hide Browser" : "Show Browser"}
                      </button>
                    </div>
                  </div>
                </div>
                <ReactFlowProvider>
                  <WorkflowViewer template={template} />
                </ReactFlowProvider>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
