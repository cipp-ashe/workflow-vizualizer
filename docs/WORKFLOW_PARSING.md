# Workflow Parsing Process

This document provides a detailed explanation of how the Rewst Workflow Viewer parses and visualizes workflow templates.

## Overview

The workflow parsing process involves several steps:

1. **Validation**: Verifying the JSON structure matches the expected Rewst workflow format
2. **Processing**: Converting workflow tasks into nodes and transitions into edges
3. **Layout**: Automatically positioning nodes if no position data is available
4. **Rendering**: Displaying the workflow as an interactive graph

## Workflow Bundle Structure

Rewst workflow bundles follow a specific structure:

```json
{
  "version": number,        // Version of the workflow format (1 or 2)
  "exportedAt": string,     // Timestamp when the workflow was exported
  "objects": {              // Map of workflow objects
    [key: string]: {
      "type": string,       // Object type (e.g., "workflow", "action", etc.)
      "content_hash": string,
      "hash": string,
      "fields": {
        "tasks": [          // Array of workflow tasks
          {
            "id": string,   // Unique identifier for the task
            "type": string, // Task type
            "name": string, // Display name
            "description": string,
            "action": {     // Action to perform
              "id": string,
              "ref": string // Reference to action definition
            },
            "next": [       // Transitions to next tasks
              {
                "id": string,
                "label": string,
                "do": string[]
              }
            ],
            // Additional task properties...
          }
        ],
        // Additional workflow fields...
      },
      "nonfunctional_fields": {
        // Metadata and display properties
      }
    }
  },
  "references": {
    // References to external objects
  }
}
```

## Detailed Parsing Process

### 1. Bundle Validation

The first step is to validate that the uploaded JSON is a valid Rewst workflow bundle. This is handled by the `isValidWorkflowBundle` function in `src/lib/workflow-validation.ts`.

```typescript
export const isValidWorkflowBundle = (data: unknown): boolean => {
  // Check for required top-level properties
  if (!data || typeof data !== "object") return false;

  const bundle = data as WorkflowBundleForValidation;

  // Check version (support both version 1 and 2)
  if (
    typeof bundle.version !== "number" ||
    (bundle.version !== 1 && bundle.version !== 2)
  )
    return false;

  // Check exportedAt
  if (typeof bundle.exportedAt !== "string") return false;

  // Check for objects property
  if (!bundle.objects || typeof bundle.objects !== "object") return false;

  // Check for at least one workflow object with tasks
  const hasWorkflow = Object.values(bundle.objects).some(
    (obj: WorkflowObjectForValidation) =>
      obj &&
      typeof obj === "object" &&
      obj.type === "workflow" &&
      obj.fields &&
      Array.isArray(obj.fields.tasks)
  );

  if (!hasWorkflow) return false;

  // Check for references property (version 1) or dependencies (version 2)
  if (bundle.version === 1) {
    if (!bundle.references || typeof bundle.references !== "object")
      return false;
  } else if (bundle.version === 2) {
    // Version 2 might have a signing property and different structure
    // Just check that objects exist and have the right structure
    return true;
  }

  return true;
};
```

The validation checks:

- The data is an object
- It has a valid version (1 or 2)
- It has an exportedAt timestamp
- It has an objects property that's an object
- At least one object is a workflow with tasks
- It has the appropriate properties for its version

### 2. Workflow Processing

Once validated, the workflow is processed by the `useWorkflowProcessor` hook in `src/components/workflow/viewer/hooks/useWorkflowProcessor.ts`. This hook:

1. Identifies the selected workflow from the bundle
2. Extracts tasks and converts them to nodes
3. Processes transitions into edges
4. Adds trigger connections if applicable
5. Applies automatic layout if position data is missing

#### 2.1 Workflow Selection

The processor first identifies the selected workflow:

```typescript
// Find the selected workflow
let selectedWorkflow;

// First try to find the workflow by its ID in fields
selectedWorkflow = Object.values(template.objects).find(
  (obj) => obj.type === "workflow" && obj.fields?.id === selectedWorkflowId
);

// If not found, try to find it by the key in the objects map
if (!selectedWorkflow) {
  selectedWorkflow = template.objects[selectedWorkflowId];
}

// If still not found, try to extract the ID part from the selectedWorkflowId
if (!selectedWorkflow && selectedWorkflowId.includes(":")) {
  const idPart = selectedWorkflowId.split(":")[1];
  selectedWorkflow = Object.values(template.objects).find(
    (obj) =>
      obj.type === "workflow" &&
      (obj.fields?.id === idPart ||
        (obj as unknown as Record<string, string>).id === idPart)
  );
}
```

This handles different ways the workflow might be identified in the bundle.

#### 2.2 Task to Node Conversion

Tasks are converted to nodes with the appropriate data:

```typescript
const processedNodes: Node[] = tasks.map((task, index) => {
  // Extract transition labels from nonfunctional_fields
  const next = task.next?.map((transition, transitionIndex) => {
    const labelKey = `tasks[${index}].next[${transitionIndex}].label`;
    const label = selectedWorkflow.nonfunctional_fields?.[labelKey] as
      | string
      | undefined;

    return {
      ...transition,
      label: label || transition.label,
    };
  });

  return {
    id: task.id,
    type: "task",
    position: {
      x: task.metadata?.x || 0,
      y: task.metadata?.y || 0,
    },
    data: {
      ...task,
      next: next || task.next, // Use the updated next array with labels
      onSubWorkflowClick,
    },
  };
});
```

#### 2.3 Transition to Edge Conversion

Transitions between tasks are converted to edges:

```typescript
let processedEdges: Edge[] = [];
const processedEdgeIds = new Set<string>();

tasks.forEach((task) => {
  const taskEdges = createEdgesFromTransitions(
    task as unknown as WorkflowTask,
    processedEdgeIds
  );
  processedEdges.push(...taskEdges);
});
```

The `createEdgesFromTransitions` function in `src/components/workflow/shared/utils/transitionUtils.ts` handles the conversion of task transitions to ReactFlow edges.

#### 2.4 Trigger Processing

If the workflow is a main workflow (not a sub-workflow), triggers are also processed:

```typescript
// Add trigger edges if this is the main workflow
if (selectedWorkflow && !selectedWorkflow.fields?.parent_workflow_id) {
  // Extract triggers from the workflow bundle
  const triggers = extractTriggers(template);

  // Create edges for triggers targeting this workflow
  const triggerEdges = createTriggerEdges(
    triggers.filter((t) => t.workflowId === selectedWorkflowId)
  );
  processedEdges = [...processedEdges, ...triggerEdges];
}
```

The `extractTriggers` and `createTriggerEdges` functions in `src/components/workflow/shared/utils/triggerUtils.ts` handle the extraction and conversion of triggers.

### 3. Layout Application

If the tasks don't have position data, an automatic layout is applied:

```typescript
// Apply layout if needed
const hasPositions = processedNodes.some(
  (node) => node.position.x !== 0 || node.position.y !== 0
);

if (!hasPositions && processedNodes.length > 0) {
  // Apply automatic layout
  const positionedNodes = layoutEngine.applyLayout(
    processedNodes,
    processedEdges
  );
  setNodes(positionedNodes);
} else {
  setNodes(processedNodes);
}
```

The layout engine uses a directed acyclic graph (DAG) layout algorithm to position nodes in a logical flow.

### 4. Rendering

Finally, the processed nodes and edges are rendered using ReactFlow in the `WorkflowViewer` component.

## Alternative Workflow Formats

The processor also handles alternative workflow formats that might have a different structure:

```typescript
// Try a different approach if the structure is different
if (selectedWorkflow && !selectedWorkflow.fields?.tasks) {
  console.log("Trying alternative task structure", selectedWorkflow);

  // Check if tasks might be at a different location in the object
  // Use type assertion to access potential properties not in the type
  const workflowAny = selectedWorkflow as unknown as Record<string, unknown>;
  const tasksObj =
    workflowAny.tasks ||
    (workflowAny.fields as Record<string, unknown>)?.workflow_tasks;

  if (tasksObj) {
    const tasks = Array.isArray(tasksObj) ? tasksObj : Object.values(tasksObj);
    console.log("Found tasks in alternative location", { tasks });

    // Process tasks into nodes
    // ...
  }
}
```

This flexibility allows the viewer to handle different versions and variations of the Rewst workflow format.

## Troubleshooting

### Common Parsing Issues

1. **Missing Tasks**: If the workflow doesn't have a tasks array, the processor will try to find tasks in alternative locations.

2. **Missing Position Data**: If tasks don't have position data, the automatic layout will be applied.

3. **Invalid References**: If a task references another task that doesn't exist, the edge will be created but might not connect to anything.

4. **Version Differences**: The processor handles both version 1 and version 2 of the Rewst workflow format, with automatic detection and appropriate handling.

### Debugging

The processor includes console logs at key points to help with debugging:

```typescript
console.log("Processing workflow", {
  template,
  selectedWorkflowId,
  objectsCount: Object.keys(template.objects).length,
  objectTypes: Object.values(template.objects)
    .map((obj) => obj.type)
    .filter((v, i, a) => a.indexOf(v) === i),
});
```

These logs can be viewed in the browser's developer console to understand what's happening during the parsing process.

## Extending the Parser

To extend the parser to support additional workflow formats or features:

1. Update the `WorkflowBundle` and `Task` interfaces in `src/types/workflow.ts`
2. Modify the validation logic in `src/lib/workflow-validation.ts`
3. Update the processing logic in `useWorkflowProcessor`
4. Add any new visual elements or indicators to the `TaskNode` component

## Conclusion

The workflow parsing process is designed to be flexible and handle different versions and variations of the Rewst workflow format. By understanding this process, you can better troubleshoot issues and extend the functionality of the Rewst Workflow Viewer.
