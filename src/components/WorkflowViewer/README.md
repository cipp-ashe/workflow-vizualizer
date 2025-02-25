# WorkflowViewer Component

## Overview

The WorkflowViewer is a complex component responsible for visualizing workflow templates as interactive node graphs. It uses ReactFlow for rendering the graph and provides features like navigation, zooming, panning, and exporting.

## Component Structure

### Main Components

- `WorkflowViewer.tsx`: The main component that orchestrates the workflow visualization
- `WorkflowCanvas.tsx`: Renders the ReactFlow canvas with nodes and edges
- `WorkflowNavigation.tsx`: Provides navigation controls for the workflow
- `WorkflowControls.tsx`: UI controls for interacting with the workflow
- `WorkflowLegend.tsx`: Displays a legend for the workflow elements

### Hooks

- `useWorkflowNavigation.ts`: Manages navigation state and handlers
- `useWorkflowProcessor.ts`: Processes workflow data into nodes and edges
- `useWorkflowExport.ts`: Provides functionality for exporting the workflow

### Utils

- `edgeUtils.ts`: Utilities for creating and manipulating edges
- `nodeUtils.ts`: Utilities for creating and manipulating nodes
- `positionUtils.ts`: Utilities for calculating node positions
- `referenceUtils.ts`: Utilities for resolving references in the workflow
- `templateUtils.ts`: Utilities for working with workflow templates

### Constants

- `legendItems.ts`: Constants for the workflow legend
- `nodeTypes.ts`: Defines the node types used in the workflow

## Dependencies

- ReactFlow: For rendering the interactive node graph
- TaskNode: For rendering individual task nodes
- UI Components: Uses shared UI components from `src/components/ui`

## Usage

```tsx
import { WorkflowViewer } from "@/components/WorkflowViewer";
import { WorkflowBundle } from "@/types/workflow";

function MyComponent({ template }: { template: WorkflowBundle }) {
  return <WorkflowViewer template={template} />;
}
```
