# Workflow Visualizer Transitions Fix Plan

## Problem Analysis

After analyzing the code, I've identified the root cause of why the transitions aren't displaying at the bottom of the nodes in the workflow visualizer.

### Current Behavior

- The transitions section is defined in the TaskNode component
- The edges are correctly connected to the transitions using the sourceHandle property
- But the transitions themselves are not visible on the nodes

### Root Cause

The issue is in how ReactFlow renders nodes and handles. There are several contributing factors:

1. **Handle Positioning**: In the TaskNode component, the transitions are being rendered with handles that have IDs like `transition-${idx}` and are positioned on the right side of each transition. However, these handles might not be properly positioned or visible.

2. **Edge Connection**: In the WorkflowViewer component, when creating edges (lines 490-529), it's using `sourceHandle: transition-${transitionIndex}` to specify which transition handle the edge should connect to. This connection is correct, but the handles themselves might not be visible.

3. **Z-Index Issues**: The transitions section might be hidden behind other elements due to z-index issues. While we've added `z-index: 50` to the transitions section, there might be other elements with higher z-index values.

4. **ReactFlow Rendering**: ReactFlow has its own rendering logic for nodes and edges, which might be interfering with our custom node rendering.

## Solution Plan

To fix this issue, we need to make targeted changes to ensure the transitions are visible and properly connected to the edges:

### 1. Update the TaskNode Component

The TaskNode component needs to be modified to ensure the transitions are always visible:

```jsx
// In TaskNode.tsx
// Change the transitions section to be more prominent and always visible
<div className="mt-6 pt-4 border-t-2 border-[hsl(var(--workflow-blue))] relative z-50">
  <h4 className="text-xs font-medium text-[hsl(var(--workflow-blue))] uppercase tracking-wider mb-3">
    Transitions
  </h4>
  {data.next && data.next.length > 0 ? (
    <div className="space-y-2">
      {data.next.map((transition, idx) => (
        <div
          key={idx}
          className={cn(
            "relative flex flex-col p-2 rounded-md",
            "bg-[hsl(var(--muted))]/50",
            "border-2 border-[hsl(var(--border))]/70",
            "transition-all duration-200",
            "hover:bg-[hsl(var(--muted))]/60",
            "hover:border-[hsl(var(--border))]"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={cn(
                "w-4 h-4 rounded-full",
                transition.followType === "all"
                  ? "bg-[hsl(var(--workflow-green))]"
                  : "bg-[hsl(var(--workflow-blue))]"
              )}
              title={`Follow ${transition.followType}`}
            />
            <div className="flex-1 text-sm font-medium truncate">
              {transition.label || "Transition"}
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id={`transition-${idx}`}
              className={cn(
                "!w-3 !h-3 !border-2 !border-[hsl(var(--background))] transition-all duration-200",
                transition.followType === "all"
                  ? "!bg-[hsl(var(--workflow-green))]"
                  : "!bg-[hsl(var(--workflow-blue))]"
              )}
            />
          </div>
          {transition.when && (
            <code
              className={cn(
                "block w-full text-xs font-mono text-muted-foreground",
                "bg-[hsl(var(--muted))]/40 rounded-md p-1.5 mt-1"
              )}
            >
              {transition.when}
            </code>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="text-sm text-muted-foreground">No transitions defined</div>
  )}
</div>
```

### 2. Update the CSS for ReactFlow Nodes

We need to update the CSS to ensure the transitions are properly styled and visible:

```css
/* In globals.css */
.react-flow__node-task foreignObject {
  @apply !bg-[hsl(var(--card))] !important;
  overflow: visible !important;
  width: auto !important;
  height: auto !important;
  z-index: 5 !important;
  pointer-events: all !important;
}

/* Make sure transitions are visible */
.react-flow__node-task .workflow-node > div:last-child {
  z-index: 50 !important;
  position: relative !important;
  pointer-events: all !important;
}
```

### 3. Update the Edge Styling

We need to update the edge styling to make the edges more visible:

```css
/* In globals.css */
.react-flow__edge-path {
  @apply !stroke-[hsl(var(--workflow-blue))] !stroke-[3px];
  z-index: 10;
  filter: drop-shadow(0 0 2px rgba(52, 152, 219, 0.5));
}
```

### 4. Update the WorkflowViewer Component

We need to update the WorkflowViewer component to ensure the edges are properly connected to the transitions:

```jsx
// In WorkflowViewer.tsx
// When creating edges
newEdges.push({
  id: edgeId,
  source: task.id,
  target: targetId,
  sourceHandle: `transition-${transitionIndex}`, // This should match the ID in TaskNode.tsx
  animated: true,
  label: label || transition.label,
  style: {
    stroke: `hsl(var(--workflow-${isFollowAll ? "green" : "blue"}))`,
    strokeWidth: 3, // Increase stroke width for better visibility
  },
  type: "smoothstep",
  data: {
    condition: transition.when,
    followType: isFollowAll ? "all" : "first",
  },
});
```

### 5. Add Debug Logging

To help diagnose the issue, we should add debug logging to track the transitions and edges:

```jsx
// In TaskNode.tsx
console.log("TRANSITIONS FOR NODE:", data.name, data.next);

// In WorkflowViewer.tsx
console.log("CREATING EDGE:", {
  source: task.id,
  target: targetId,
  sourceHandle: `transition-${transitionIndex}`,
});
```

## Implementation Plan

1. Switch to Code mode to implement these changes
2. Update the TaskNode component first
3. Update the CSS for ReactFlow nodes
4. Update the edge styling
5. Update the WorkflowViewer component
6. Test the changes to ensure the transitions are visible and properly connected to the edges

## Expected Outcome

After implementing these changes, the transitions should be visible at the bottom of the nodes in the workflow visualizer, and the edges should be properly connected to the transitions.
