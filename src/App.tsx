import { useState, useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { FileUpload } from "./components/FileUpload";
import { WorkflowViewer } from "./components/WorkflowViewer/index";
import { GitHubRepoBrowser } from "./components/GitHubRepoBrowser";
import { TestWorkflow } from "./components/TestWorkflow/index";
import { TestButton } from "./components/TestButton";
import { WorkflowBundle } from "./types/workflow";
import { Moon, Sun } from "lucide-react";
import { Button } from "./components/ui/button";
import "./styles/globals.css";

// Set this to false to allow users to upload/browse
const USE_TEST_WORKFLOW = false;

// Set this to true to show the shadcn/ui button test component
const SHOW_BUTTON_TEST = false;

function App() {
  const [template, setTemplate] = useState<WorkflowBundle | null>(null);
  const [showBrowser, setShowBrowser] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  // Initialize dark mode based on localStorage or use dark mode as default
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      // Default to dark mode
      setDarkMode(true);
    }
  }, []);

  // Update the DOM when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save preference to localStorage
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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

  // Show the shadcn/ui button test component
  if (SHOW_BUTTON_TEST) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Shadcn UI Button Test
          </h1>
          <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg p-6">
            <TestButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Rewst Workflow Viewer
          </h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-700" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        <div className="flex flex-col gap-8">
          {/* Top: File upload when no template is loaded */}
          {!template && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-12 space-y-8">
                {/* File Upload with toggle button */}
                <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg flex flex-col">
                  <div className="p-4 border-b border-[hsl(var(--border))]">
                    <div className="flex justify-end items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowBrowser(!showBrowser)}
                          className="px-4 py-2 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80
                                    text-foreground rounded-md transition-colors"
                        >
                          {showBrowser
                            ? "Hide GitHub Browser"
                            : "Show GitHub Browser"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <FileUpload onFileUpload={handleFileUpload} />
                  </div>
                </div>
              </div>
              {/* GitHub Browser Component - Only shown when showBrowser is true */}
              {showBrowser && (
                <div className="lg:col-span-12 bg-[hsl(var(--card))] rounded-lg shadow-lg">
                  <GitHubRepoBrowser onWorkflowSelect={handleFileUpload} />
                </div>
              )}
            </div>
          )}

          {/* Workflow visualization */}
          {template && (
            <div className="grid grid-cols-1 gap-8">
              {/* Canvas at the top */}
              <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg h-[700px] flex flex-col">
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
                        {showBrowser
                          ? "Hide GitHub Browser"
                          : "Show GitHub Browser"}
                      </button>
                    </div>
                  </div>
                </div>
                <ReactFlowProvider>
                  <WorkflowViewer template={template} />
                </ReactFlowProvider>
              </div>

              {/* GitHub browser below the canvas */}
              {showBrowser && (
                <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg">
                  <GitHubRepoBrowser onWorkflowSelect={handleFileUpload} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
