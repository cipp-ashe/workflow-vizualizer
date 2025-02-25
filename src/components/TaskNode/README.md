# TaskNode Component

## Overview

The TaskNode component is responsible for rendering individual task nodes within the workflow visualization. It displays task information, status indicators, and handles user interactions such as expanding/collapsing details and navigating to sub-workflows.

## Component Structure

### Main Components

- `TaskNode.tsx`: The main component that renders a workflow task as an interactive node
- `TaskNodeHeader.tsx`: Renders the header section of the task node with name, type, and indicators
- `TaskNodeDetails.tsx`: Renders the detailed information about the task when expanded
- `TransitionTabs.tsx`: Renders the transition tabs at the bottom of the node

### Hooks

- `useTaskNode.ts`: Custom hook that manages the task node state and behavior

### Styles

- `TaskNode.css`: Styles specific to the TaskNode component

### Types

- `types.ts`: TypeScript interfaces and types for the TaskNode component

## Dependencies

- ReactFlow: For rendering the node within the workflow graph
- UI Components: Uses shared UI components from `src/components/ui` including:
  - Card
  - ScrollArea
  - Badge
  - Collapsible
- Utility Functions: Uses utility functions from `@/lib/utils`

## Usage

The TaskNode component is registered as a custom node type in ReactFlow and is used automatically when rendering the workflow graph.

```tsx
import { TaskNode } from "@/components/TaskNode";
import ReactFlow, { NodeTypes } from "reactflow";

// Register the TaskNode as a custom node type
const nodeTypes: NodeTypes = {
  task: TaskNode,
};

function WorkflowGraph() {
  return <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} />;
}
```

## UI Component Usage

The TaskNode component uses several shared UI components:

- `Card` and `CardContent`: For structuring the detailed content
- `ScrollArea`: For scrollable content when the details are expanded
- `Badge`: For displaying action references and other metadata
- `Collapsible` and `CollapsibleContent`: For the expandable details section
