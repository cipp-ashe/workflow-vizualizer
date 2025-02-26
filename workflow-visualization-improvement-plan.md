# Workflow Visualization Improvement Plan

## Current Issues

Based on the code analysis and your feedback, we've identified several key issues with the current workflow visualization:

1. **Node Placement Issues**

   - Nodes are being placed incorrectly with transitions criss-crossing
   - The DAG layout algorithm needs improvement to better handle complex workflows

2. **Navigation Issues**

   - Can't swap between workflows in a bundle effectively
   - Can't see the path back from sub-workflows to parent workflows
   - Breadcrumb navigation may not be working correctly

3. **Triggers Not Displayed**

   - Workflow triggers are not being displayed in the UI
   - The JSON data contains trigger objects, but they're not processed or visualized

4. **Data Display Issues**
   - The expanded node and transition displays need improvement
   - Not following design or UI component best practices
   - React Flow integration could be improved

## Root Causes

### 1. Node Placement Issues

The DAG layout algorithm in `dagLayout.ts` has several limitations:

- The current node ordering algorithm doesn't effectively minimize edge crossings
- The rank assignment doesn't properly handle complex workflow structures
- The coordinate assignment doesn't account for node sizes and edge routing
- The compaction algorithm may cause nodes to overlap or be positioned too close together

### 2. Navigation Issues

The workflow navigation system has several gaps:

- The `useWorkflowNavigation` hook doesn't properly track the relationship between parent and sub-workflows
- The breadcrumb component is implemented correctly, but the data feeding it may be incomplete
- The workflow selection dropdown doesn't provide context about parent-child relationships
- There's no visual indication of how workflows are connected to each other

### 3. Triggers Not Displayed

The trigger display is completely missing:

- No code exists to extract and process trigger objects from the workflow bundle
- No UI components are designed to display triggers
- No connection is made between triggers and their associated workflows
- The workflow processor doesn't include triggers in the node/edge generation

### 4. Data Display Issues

The node and transition displays have several issues:

- The `TaskNodeDetails` component doesn't follow a consistent design pattern
- The transition display doesn't effectively communicate the relationship between nodes
- The data formatting doesn't handle complex nested structures well
- The UI doesn't adapt well to different screen sizes and data volumes

## Improvement Plan

### 1. Enhance the DAG Layout Algorithm

#### 1.1 Improve Node Ranking

- Modify the `assignRanks` method in `dagLayout.ts` to better handle cycles and complex dependencies
- Implement a more sophisticated algorithm for determining the optimal rank for each node
- Add support for constraints that can influence the ranking process

```typescript
private assignRanks(nodes: RankedNode[], graph: Map<string, { incoming: string[]; outgoing: string[] }>): void {
  // Implement a network simplex algorithm for optimal rank assignment
  // This will minimize the total edge length while respecting dependencies

  // First, find all source nodes (no incoming edges)
  const sourceNodes = nodes.filter(node => graph.get(node.id)?.incoming.length === 0);

  // If no source nodes, find nodes with minimal incoming edges
  if (sourceNodes.length === 0 && nodes.length > 0) {
    // ... existing code ...
  }

  // Use a more sophisticated algorithm for rank assignment
  // This will consider the entire graph structure, not just immediate neighbors
  this.networkSimplexRanking(nodes, graph);

  // Handle disconnected nodes
  nodes.forEach(node => {
    if (node.rank === undefined) {
      node.rank = 0;
    }
  });
}

private networkSimplexRanking(nodes: RankedNode[], graph: Map<string, { incoming: string[]; outgoing: string[] }>): void {
  // Implementation of the Network Simplex algorithm for rank assignment
  // This is a more sophisticated algorithm that produces better results
  // ...
}
```

#### 1.2 Improve Node Ordering Within Ranks

- Enhance the `orderNodesWithinRanks` method to better minimize edge crossings
- Implement a crossing reduction algorithm like the Barycenter heuristic
- Consider node and edge weights in the ordering process

```typescript
private orderNodesWithinRanks(nodes: RankedNode[], graph: Map<string, { incoming: string[]; outgoing: string[] }>): void {
  // Group nodes by rank
  const rankGroups = new Map<number, RankedNode[]>();
  // ... existing code ...

  // Implement a more sophisticated crossing reduction algorithm
  // This will minimize edge crossings between adjacent ranks
  this.reduceCrossings(rankGroups, graph);

  // Final ordering within each rank
  ranks.forEach(rank => {
    const nodesInRank = rankGroups.get(rank)!;
    nodesInRank.sort((a, b) => (a.order || 0) - (b.order || 0));
  });
}

private reduceCrossings(rankGroups: Map<number, RankedNode[]>, graph: Map<string, { incoming: string[]; outgoing: string[] }>): void {
  // Implementation of a crossing reduction algorithm
  // This will iteratively improve the ordering to minimize crossings
  // ...
}
```

#### 1.3 Improve Coordinate Assignment

- Enhance the `assignCoordinates` method to better utilize available space
- Implement a more sophisticated algorithm for horizontal positioning
- Add support for different layout styles (horizontal, vertical, compact)

```typescript
private assignCoordinates(nodes: RankedNode[], config: LayoutConfig): void {
  // ... existing code ...

  // Implement a more sophisticated coordinate assignment algorithm
  // This will position nodes to minimize edge length and maximize readability
  this.optimizeCoordinates(rankGroups, config);

  // Final coordinate assignment
  ranks.forEach(rank => {
    const nodesInRank = rankGroups.get(rank)!;
    // ... assign coordinates based on optimized positions ...
  });
}

private optimizeCoordinates(rankGroups: Map<number, RankedNode[]>, config: LayoutConfig): void {
  // Implementation of a coordinate optimization algorithm
  // This will adjust node positions to improve overall layout quality
  // ...
}
```

### 2. Improve Workflow Navigation

#### 2.1 Enhance the Workflow Navigation Hook

- Modify the `useWorkflowNavigation` hook to better track parent-child relationships
- Implement a more robust method for building the workflow hierarchy
- Add support for navigating between related workflows

```typescript
export function useWorkflowNavigation(
  template: WorkflowBundle
): WorkflowNavigationHookResult {
  // ... existing state ...

  // Add state for tracking parent-child relationships
  const [workflowRelationships, setWorkflowRelationships] = useState<
    Map<string, { parents: string[]; children: string[] }>
  >(new Map());

  // Build workflow relationships on initialization
  const buildWorkflowRelationships = useCallback(() => {
    const relationships = new Map<
      string,
      { parents: string[]; children: string[] }
    >();

    // Initialize relationships for all workflows
    Object.values(template.objects)
      .filter((obj) => obj.type === "workflow")
      .forEach((workflow) => {
        relationships.set(workflow.fields.id as string, {
          parents: [],
          children: [],
        });
      });

    // Analyze task transitions to identify parent-child relationships
    Object.values(template.objects)
      .filter((obj) => obj.type === "workflow")
      .forEach((workflow) => {
        const workflowId = workflow.fields.id as string;
        const tasks = (workflow.fields.tasks as Task[]) || [];

        tasks.forEach((task) => {
          const transitions = task.next || [];
          transitions.forEach((transition) => {
            const targetIds = transition.do || [];
            targetIds.forEach((targetId) => {
              // Check if the target is another workflow
              if (relationships.has(targetId)) {
                // Add parent-child relationship
                relationships.get(workflowId)?.children.push(targetId);
                relationships.get(targetId)?.parents.push(workflowId);
              }
            });
          });
        });
      });

    setWorkflowRelationships(relationships);
  }, [template]);

  // Initialize navigation with relationships
  const initializeNavigation = useCallback(() => {
    // ... existing code ...

    // Build workflow relationships
    buildWorkflowRelationships();
  }, [template, buildWorkflowRelationships]);

  // Enhanced sub-workflow navigation
  const handleSubWorkflowClick = useCallback(
    (workflowId: string) => {
      // ... existing code ...

      // Update hierarchy with proper parent-child relationship
      setWorkflowHierarchy((prev) => {
        // Check if this is a child of the current workflow
        const currentWorkflowId = prev[prev.length - 1].id;
        const isChild = workflowRelationships
          .get(currentWorkflowId)
          ?.children.includes(workflowId);

        if (isChild) {
          // Add to the hierarchy
          return [...prev, { id: workflowId, name: workflowName }];
        } else {
          // Check if this is a sibling or unrelated workflow
          // If it's a sibling, replace the last item
          // If it's unrelated, start a new hierarchy
          const parentIds =
            workflowRelationships.get(workflowId)?.parents || [];
          const commonParentIndex = prev.findIndex((item) =>
            parentIds.includes(item.id)
          );

          if (commonParentIndex >= 0) {
            // It's a sibling or cousin, keep the common ancestry
            return [
              ...prev.slice(0, commonParentIndex + 1),
              { id: workflowId, name: workflowName },
            ];
          } else {
            // It's unrelated, start a new hierarchy
            return [{ id: workflowId, name: workflowName }];
          }
        }
      });
    },
    [template, workflowRelationships]
  );

  // ... rest of the hook ...

  return {
    // ... existing return values ...
    workflowRelationships,
  };
}
```

#### 2.2 Enhance the Workflow Navigation UI

- Improve the `WorkflowNavigation` component to show parent-child relationships
- Enhance the breadcrumb to provide more context about the navigation path
- Add visual indicators for workflow relationships

```tsx
export function WorkflowNavigation({
  template,
  selectedWorkflowId,
  workflowHierarchy,
  workflowRelationships,
  onWorkflowSelect,
  onBreadcrumbNavigate,
}: WorkflowNavigationProps) {
  // Get the list of workflows with relationship information
  const workflows = Object.values(template.objects)
    .filter((obj) => obj.type === "workflow")
    .map((workflow) => {
      const id = workflow.fields.id as string;
      const relationships = workflowRelationships.get(id) || {
        parents: [],
        children: [],
      };

      return {
        id,
        name: workflow.nonfunctional_fields?.name || "Workflow",
        taskCount: ((workflow.fields.tasks as unknown[]) || []).length,
        parentCount: relationships.parents.length,
        childCount: relationships.children.length,
      };
    });

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b bg-[hsl(var(--background))]">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
        {/* Enhanced Workflow Selector with relationship indicators */}
        <WorkflowSelector
          workflows={workflows}
          selectedWorkflowId={selectedWorkflowId}
          onSelect={onWorkflowSelect}
        />

        {/* Enhanced Breadcrumb Navigation with relationship context */}
        {workflowHierarchy.length > 0 && (
          <WorkflowBreadcrumb
            workflowHierarchy={workflowHierarchy}
            workflowRelationships={workflowRelationships}
            onNavigate={onBreadcrumbNavigate}
          />
        )}
      </div>
    </div>
  );
}
```

### 3. Implement Trigger Display

#### 3.1 Extract Trigger Data

- Create a new utility function to extract trigger information from the workflow bundle
- Map triggers to their associated workflows
- Process trigger parameters and conditions

```typescript
// src/components/workflow/shared/utils/triggerUtils.ts

import { WorkflowBundle } from "../../../../types/workflow";

export interface TriggerInfo {
  id: string;
  name: string;
  type: string;
  workflowId: string;
  parameters: Record<string, unknown>;
  enabled: boolean;
}

/**
 * Extract trigger information from a workflow bundle
 * @param bundle The workflow bundle
 * @returns Array of trigger information
 */
export function extractTriggers(bundle: WorkflowBundle): TriggerInfo[] {
  const triggers: TriggerInfo[] = [];

  // Find all trigger objects
  Object.entries(bundle.objects).forEach(([key, obj]) => {
    if (obj.type === "trigger") {
      const triggerObj = obj;
      const workflowId = triggerObj.fields.workflowId as string;
      const triggerTypeId = triggerObj.fields.triggerTypeId as string;

      // Find the trigger type object
      const triggerType = Object.values(bundle.objects).find(
        (o) => o.hash === triggerTypeId || o.content_hash === triggerTypeId
      );

      // Extract trigger information
      triggers.push({
        id: key,
        name: triggerObj.nonfunctional_fields?.name || "Trigger",
        type: (triggerType?.fields?.ref as string) || "unknown",
        workflowId,
        parameters:
          (triggerObj.fields.parameters as Record<string, unknown>) || {},
        enabled: (triggerObj.fields.enabled as boolean) || false,
      });
    }
  });

  return triggers;
}

/**
 * Group triggers by workflow ID
 * @param triggers Array of trigger information
 * @returns Map of workflow ID to array of triggers
 */
export function groupTriggersByWorkflow(
  triggers: TriggerInfo[]
): Map<string, TriggerInfo[]> {
  const groupedTriggers = new Map<string, TriggerInfo[]>();

  triggers.forEach((trigger) => {
    if (!groupedTriggers.has(trigger.workflowId)) {
      groupedTriggers.set(trigger.workflowId, []);
    }

    groupedTriggers.get(trigger.workflowId)!.push(trigger);
  });

  return groupedTriggers;
}
```

#### 3.2 Create Trigger Display Components

- Create a new component for displaying workflow triggers
- Integrate with the workflow viewer
- Add visual indicators for trigger types and parameters

```tsx
// src/components/workflow/viewer/components/WorkflowTriggers.tsx

import { TriggerInfo } from "../../shared/utils/triggerUtils";

interface WorkflowTriggersProps {
  triggers: TriggerInfo[];
  onTriggerClick?: (triggerId: string) => void;
}

export function WorkflowTriggers({
  triggers,
  onTriggerClick,
}: WorkflowTriggersProps) {
  if (!triggers || triggers.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">Workflow Triggers</h3>
      <div className="space-y-2">
        {triggers.map((trigger) => (
          <div
            key={trigger.id}
            className="flex items-center p-2 bg-[hsl(var(--muted))] rounded border border-[hsl(var(--border))]"
          >
            <div className="flex-1">
              <div className="font-medium">{trigger.name}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                Type: {trigger.type}
              </div>
              {Object.entries(trigger.parameters).length > 0 && (
                <div className="mt-1 text-xs">
                  <div className="font-medium">Parameters:</div>
                  <ul className="list-disc list-inside">
                    {Object.entries(trigger.parameters).map(([key, value]) => (
                      <li key={key}>
                        {key}: {JSON.stringify(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="ml-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  trigger.enabled ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 3.3 Integrate Triggers with Workflow Viewer

- Modify the workflow processor to include trigger information
- Update the workflow viewer to display triggers
- Add visual connections between triggers and their workflows

```tsx
// Update WorkflowViewer.tsx to include triggers

export function WorkflowViewer({ template }: WorkflowViewerProps) {
  // ... existing code ...

  // Extract and process triggers
  const triggers = useMemo(() => extractTriggers(template), [template]);
  const triggersByWorkflow = useMemo(
    () => groupTriggersByWorkflow(triggers),
    [triggers]
  );

  // Get triggers for the selected workflow
  const selectedWorkflowTriggers = useMemo(() => {
    if (!selectedWorkflowId) return [];
    return triggersByWorkflow.get(selectedWorkflowId) || [];
  }, [selectedWorkflowId, triggersByWorkflow]);

  return (
    <div className="flex flex-col h-full min-h-[600px] w-full">
      {/* Workflow Navigation Bar */}
      <WorkflowNavigation
        template={template}
        selectedWorkflowId={selectedWorkflowId}
        workflowHierarchy={workflowHierarchy}
        workflowRelationships={workflowRelationships}
        onWorkflowSelect={handleWorkflowSelect}
        onBreadcrumbNavigate={handleBreadcrumbNavigate}
      />

      {/* Workflow Triggers */}
      {selectedWorkflowTriggers.length > 0 && (
        <div className="px-4 py-2 border-b">
          <WorkflowTriggers triggers={selectedWorkflowTriggers} />
        </div>
      )}

      {/* Main canvas with controls */}
      <ReactFlowProvider>
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onExportSvg={downloadAsSvg}
          onClearWorkflow={clearWorkflow}
        />
      </ReactFlowProvider>
    </div>
  );
}
```

### 4. Improve Data Display

#### 4.1 Enhance TaskNodeDetails Component

- Refactor the `TaskNodeDetails` component to follow better design patterns
- Improve the display of complex data structures
- Add better support for different screen sizes

```tsx
// Refactor TaskNodeDetails.tsx to use a more modular approach

export function TaskNodeDetails({
  isExpanded,
  data,
  hideTransitions = false,
}: TaskNodeDetailsProps) {
  if (!isExpanded) {
    return null;
  }

  return (
    <div
      className={cn(
        "p-3 bg-[hsl(var(--card))] border-x border-b border-[hsl(var(--border))] rounded-b-lg text-sm space-y-3 overflow-hidden",
        !hideTransitions && "pb-6"
      )}
    >
      {/* Use a more modular approach with better responsive design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {/* Task metadata (type, description, action) */}
          <TaskMetadata data={data} />

          {/* Input parameters */}
          <InputParameters input={data.input} />
        </div>

        <div className="space-y-3">
          {/* Configuration parameters */}
          <TaskConfiguration data={data} />

          {/* Advanced configuration */}
          <AdvancedConfiguration data={data} />
        </div>
      </div>

      {/* Transitions */}
      {!hideTransitions && (
        <div className="mt-4">
          <TransitionsList data={data} />
        </div>
      )}
    </div>
  );
}
```

#### 4.2 Improve Transition Display

- Enhance the transition display to better communicate relationships
- Add visual indicators for different transition types
- Improve the display of transition conditions and parameters

```tsx
// Enhance the Transition component in TaskNodeDetails.tsx

const Transition: React.FC<TransitionProps> = ({
  transition,
  onSubWorkflowClick,
  references,
}) => {
  // Skip rendering if no meaningful content
  if (
    !transition.label &&
    !transition.when &&
    !transition.do &&
    !transition.publish
  ) {
    return null;
  }

  // Determine transition type for styling
  const transitionType = transition.when
    ? "conditional"
    : transition.do && transition.do.length > 1
    ? "multi-target"
    : "standard";

  return (
    <div
      className={cn(
        "p-2 border rounded",
        transitionType === "conditional" &&
          "border-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.1)]",
        transitionType === "multi-target" &&
          "border-[hsl(var(--info))] bg-[hsl(var(--info)/0.1)]",
        transitionType === "standard" &&
          "border-[hsl(var(--border))] bg-[hsl(var(--background))]"
      )}
    >
      {/* Transition Header with Type Indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm">
          {transition.label || "Transition"}
        </div>
        <div className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--muted))]">
          {transitionType === "conditional" && "Conditional"}
          {transitionType === "multi-target" && "Multi-Target"}
          {transitionType === "standard" && "Standard"}
        </div>
      </div>

      {/* Condition */}
      {transition.when && (
        <div className="mb-2">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            When:
          </span>
          <CodeBlock value={safeToString(transition.when)} />
        </div>
      )}

      {/* Target Tasks */}
      {transition.do && transition.do.length > 0 && (
        <div className="mb-2">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Target Tasks:
          </span>
          <div className="mt-1 flex flex-wrap gap-1">
            {transition.do.map((target: string, i: number) => (
              <button
                key={i}
                className="px-2 py-1 text-xs bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] rounded hover:bg-[hsl(var(--primary)/0.2)] inline-flex items-center"
                onClick={() => onSubWorkflowClick && onSubWorkflowClick(target)}
              >
                {target}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Publish Variables */}
      {transition.publish && transition.publish.length > 0 && (
        <div>
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Publish Variables:
          </span>
          <div className="mt-1 space-y-1">
            {transition.publish.map((pub, i: number) => {
              // Look up reference values in the payload if they exist
              const valueDisplay =
                typeof pub.value === "string" && pub.value.startsWith("@@@")
                  ? resolveReference(pub.value, references)
                  : safeToString(pub.value);

              return (
                <div key={i} className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="text-xs font-semibold">{pub.key}:</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] overflow-hidden text-ellipsis">
                    {valueDisplay}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
```

## Implementation Strategy

To implement these improvements, we'll follow this phased approach:

### Phase 1: Layout Algorithm Enhancements

1. Improve the DAG layout algorithm in `dagLayout.ts`
2. Add better support for complex workflow structures
3. Enhance the node ordering to minimize edge crossings
4. Improve the coordinate assignment for better spacing

### Phase 2: Navigation Improvements

1. Enhance the workflow navigation hook to track parent-child relationships
2. Improve the breadcrumb component to provide better context
3. Update the workflow selector to show relationship information
4. Add visual indicators for workflow relationships

### Phase 3: Trigger Display Implementation

1. Create utility functions to extract trigger information
2. Develop components for displaying triggers
3. Integrate triggers with the workflow viewer
4. Add visual connections between triggers and workflows

### Phase 4: Data Display Enhancements

1. Refactor the TaskNodeDetails component for better organization
2. Improve the transition display for better clarity
3. Enhance the display of complex data structures
4. Add better support for different screen sizes

## Expected Outcomes

After implementing these improvements, we expect to see:

1. **Clearer Workflow Visualization**

   - Nodes will be positioned optimally with minimal edge crossings
   - The layout will adapt to different workflow structures
   - The visualization will be more intuitive and easier to understand

2. **Better Navigation Experience**

   - Users can easily navigate between related workflows
   - The breadcrumb will provide clear context about the navigation path
   - The workflow selector will show relationship information

3. **Complete Trigger Visualization**

   - Triggers will be displayed with their parameters and conditions
   - Users can see which triggers are associated with each workflow
   - The visualization will provide a complete picture of the workflow system

4. **Improved Data Display**
   - Node details will be displayed in a more organized and readable way
   - Transitions will be clearly visualized with their conditions and targets
   - Complex data structures will be displayed in a more user-friendly way
   - The UI will adapt to different screen sizes and data volumes
