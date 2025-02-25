import { readFileSync } from "fs";
import { useWorkflowProcessor } from "./src/components/WorkflowViewer/useWorkflowProcessor";

// Mock React hooks
const mockState = (initialValue) => {
  let value = initialValue;
  const setValue = (newValue) => {
    if (typeof newValue === "function") {
      value = newValue(value);
    } else {
      value = newValue;
    }
    console.log(
      `State updated to:`,
      Array.isArray(value) ? `Array with ${value.length} items` : value
    );
    return value;
  };
  return [value, setValue, () => {}];
};

// Mock React's useState and useCallback
global.React = {
  useState: mockState,
  useCallback: (fn) => fn,
  useEffect: (fn) => fn(),
  useMemo: (fn) => fn(),
};

// Mock ReactFlow hooks
global.useNodesState = mockState;
global.useEdgesState = mockState;

// Load the sample workflow
try {
  const sampleWorkflow = JSON.parse(
    readFileSync("./sample-workflow.json", "utf8")
  );
  console.log("Successfully loaded sample workflow");

  // Test the workflow processor
  console.log("Testing workflow processor...");
  const processor = useWorkflowProcessor(sampleWorkflow);

  console.log("\nTest Results:");
  console.log("-------------");
  console.log(`Nodes generated: ${processor.nodes.length}`);
  console.log(`Edges generated: ${processor.edges.length}`);

  if (processor.nodes.length > 0 && processor.edges.length > 0) {
    console.log(
      "\nSUCCESS: Workflow processor generated nodes and edges from the sample workflow"
    );

    console.log("\nNode details:");
    processor.nodes.forEach((node) => {
      console.log(
        `- Node ID: ${node.id}, Type: ${node.type}, Name: ${node.data.name}`
      );
    });

    console.log("\nEdge details:");
    processor.edges.forEach((edge) => {
      console.log(
        `- Edge ID: ${edge.id}, Source: ${edge.source} -> Target: ${
          edge.target
        }, Label: ${edge.label || "No label"}`
      );
    });
  } else {
    console.log(
      "\nFAILURE: Workflow processor failed to generate nodes and edges"
    );
  }
} catch (error) {
  console.error("Error testing workflow processor:", error);
}
