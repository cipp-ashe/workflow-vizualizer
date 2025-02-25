import React from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  NodeTypes,
  Panel,
  NodeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { TaskNode } from "../TaskNode";
import {
  Globe,
  Mail,
  Webhook,
  MessageSquare,
  Settings,
  Code,
  Zap,
  AlertCircle,
  Database,
  Download,
  Trash2,
} from "lucide-react";
import { WorkflowBreadcrumb } from "./WorkflowBreadcrumb";
import { WorkflowSelector } from "./WorkflowSelector";
import { WorkflowViewerProps } from "./types";

const nodeTypes: NodeTypes = {
  task: TaskNode,
};

export class WorkflowViewer extends React.Component<
  WorkflowViewerProps,
  {
    selectedWorkflowId: string | null;
    workflowHierarchy: Array<{ id: string; name: string }>;
    nodes: Node[];
    edges: Edge[];
  }
> {
  constructor(props: WorkflowViewerProps) {
    super(props);
    this.state = {
      selectedWorkflowId: null,
      workflowHierarchy: [],
      nodes: [],
      edges: [],
    };
  }

  componentDidMount() {
    // Find all workflows in the bundle
    const workflows = this.getWorkflows();
    if (workflows.length > 0) {
      this.setState({ selectedWorkflowId: workflows[0].id });
    }
  }

  componentDidUpdate(
    _prevProps: WorkflowViewerProps,
    prevState: { selectedWorkflowId: string | null }
  ) {
    // Process the template when selectedWorkflowId changes
    if (
      prevState.selectedWorkflowId !== this.state.selectedWorkflowId &&
      this.state.selectedWorkflowId
    ) {
      this.processTemplate();
    }
  }

  getWorkflows = () => {
    const { template } = this.props;
    if (!template?.objects) return [];

    return Object.entries(template.objects)
      .filter(([, obj]) => obj.type === "workflow")
      .map(([id, obj]) => ({
        id,
        name: obj.nonfunctional_fields?.name || "Unnamed Workflow",
        taskCount: obj.fields?.tasks?.length || 0,
      }))
      .sort((a, b) => b.taskCount - a.taskCount); // Sort by task count (largest first)
  };

  handleSubWorkflowClick = (subWorkflowId: string) => {
    if (!subWorkflowId) return;

    // Find the workflow name
    const subWorkflow = this.getWorkflows().find(
      (wf) => wf.id === subWorkflowId
    );

    if (!subWorkflow) {
      console.warn(`Sub-workflow with ID ${subWorkflowId} not found`);
      return;
    }

    // Add current workflow to hierarchy before switching
    if (this.state.selectedWorkflowId) {
      const currentWorkflow = this.getWorkflows().find(
        (wf) => wf.id === this.state.selectedWorkflowId
      );

      if (currentWorkflow) {
        console.log(
          `Navigating from ${currentWorkflow.name} to ${subWorkflow.name}`
        );

        this.setState((prev) => ({
          workflowHierarchy: [
            ...prev.workflowHierarchy,
            {
              id: prev.selectedWorkflowId!,
              name: currentWorkflow.name,
            },
          ],
          selectedWorkflowId: subWorkflowId,
        }));
      }
    } else {
      // If no current workflow (unlikely), just switch
      this.setState({
        selectedWorkflowId: subWorkflowId,
      });
    }
  };

  handleWorkflowSelect = (workflowId: string) => {
    this.setState({
      selectedWorkflowId: workflowId,
      workflowHierarchy: [], // Reset hierarchy when manually selecting a workflow
    });
  };

  handleBreadcrumbNavigate = (workflowId: string, index: number) => {
    this.setState((prev) => ({
      selectedWorkflowId: workflowId,
      workflowHierarchy: prev.workflowHierarchy.slice(0, index),
    }));
  };

  downloadSvg = () => {
    // Implementation of SVG download
    alert("SVG download functionality would be implemented here");
  };

  clearWorkflow = () => {
    if (
      window.confirm("Are you sure you want to clear the current workflow?")
    ) {
      this.setState({ nodes: [], edges: [] });
    }
  };

  processTemplate = () => {
    const { selectedWorkflowId } = this.state;
    const { template } = this.props;

    console.log(
      "Processing template with selectedWorkflowId:",
      selectedWorkflowId
    );
    console.log(
      "Template objects count:",
      Object.keys(template?.objects || {}).length
    );

    if (!template?.objects || !selectedWorkflowId) {
      console.error("Invalid template structure or no workflow selected");
      return;
    }

    const selectedWorkflow = template.objects[selectedWorkflowId];

    if (
      !selectedWorkflow ||
      selectedWorkflow.type !== "workflow" ||
      !Array.isArray(selectedWorkflow.fields?.tasks)
    ) {
      console.error("Selected workflow is invalid or has no tasks");
      return;
    }

    // Process the selected workflow
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const processedEdges = new Set<string>();

    // First, analyze all task positions to determine layout boundaries
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let hasPositionMetadata = false;

    // Map to store task positions for later use
    const taskPositions = new Map<number, { x: number; y: number }>();

    selectedWorkflow.fields.tasks?.forEach((_, index) => {
      const metadataKey = `tasks[${index}].metadata`;
      const metadata = selectedWorkflow.nonfunctional_fields?.[metadataKey] as
        | { x: number; y: number; clonedFromId?: string }
        | undefined;

      if (metadata) {
        hasPositionMetadata = true;
        minX = Math.min(minX, metadata.x);
        minY = Math.min(minY, metadata.y);
        maxX = Math.max(maxX, metadata.x);
        maxY = Math.max(maxY, metadata.y);
        taskPositions.set(index, { x: metadata.x, y: metadata.y });
      }
    });

    // Calculate offsets to ensure all nodes are in positive coordinates
    const offsetX = minX === Infinity ? 0 : minX < 0 ? Math.abs(minX) + 50 : 50;
    const offsetY =
      minY === Infinity ? 0 : minY < 0 ? Math.abs(minY) + 100 : 100;

    // Calculate workflow dimensions for trigger positioning
    const workflowWidth = hasPositionMetadata
      ? maxX - minX + 300
      : selectedWorkflow.fields.tasks?.length * 250 || 500;

    // Find and process triggers related to this workflow
    const triggerNodes: Node[] = [];

    // First, count how many triggers are related to this workflow
    const relatedTriggers = Object.values(template.objects).filter(
      (obj) =>
        obj.type === "trigger" && obj.fields?.workflowId === selectedWorkflowId
    );

    const triggerCount = relatedTriggers.length;

    // Process each trigger
    Object.entries(template.objects).forEach(([id, obj], index) => {
      if (
        obj.type === "trigger" &&
        obj.fields?.workflowId === selectedWorkflowId
      ) {
        // Find the trigger type
        let triggerType = "Unknown Trigger";

        if (obj.fields?.triggerTypeId) {
          const triggerTypeId = obj.fields.triggerTypeId as string;
          const reference = Object.entries(template.references || {}).find(
            ([, ref]) =>
              ref.locations?.some((loc) => loc.includes(triggerTypeId))
          );

          if (reference) {
            const triggerTypeObj = Object.values(template.objects).find(
              (o) => o.hash === reference[1].src_key_hash
            );

            if (triggerTypeObj && triggerTypeObj.fields?.ref) {
              triggerType = triggerTypeObj.fields.ref;
            }
          }
        }

        // Position triggers evenly across the top of the workflow
        const triggerSpacing = workflowWidth / (triggerCount + 1);
        const xPosition = offsetX + (index + 1) * triggerSpacing - 125; // Center the trigger

        // Create a trigger node
        triggerNodes.push({
          id: id,
          type: "task",
          position: { x: xPosition, y: offsetY - 250 }, // Position triggers further above the workflow
          data: {
            name: obj.nonfunctional_fields?.name || "Trigger",
            description: obj.nonfunctional_fields?.description,
            action: {
              ref: triggerType,
              name: obj.nonfunctional_fields?.name || "Trigger",
              description: `Trigger type: ${triggerType}`,
            },
            input: obj.fields?.parameters,
            type: "trigger",
            hasJinjaTemplates: false,
          },
        });

        console.log(
          "Created trigger node:",
          id,
          "at position",
          xPosition,
          offsetY - 250
        );
      }
    });

    // Add trigger nodes to the beginning of the nodes array
    newNodes.push(...triggerNodes);

    selectedWorkflow.fields.tasks?.forEach((task, index) => {
      if (!task?.id) return;

      // Find the referenced task object
      const reference = Object.entries(template.references || {}).find(
        ([, ref]) => ref.locations?.some((loc) => loc.includes(task.id))
      );

      const taskObj = reference
        ? Object.values(template.objects).find(
            (obj) => obj.hash === reference[1].src_key_hash
          )
        : null;

      // Get task metadata and description
      const metadataKey = `tasks[${index}].metadata`;
      const metadata = selectedWorkflow.nonfunctional_fields?.[metadataKey] as
        | { x: number; y: number; clonedFromId?: string }
        | undefined;

      const descKey = `tasks[${index}].description`;
      const description = selectedWorkflow.nonfunctional_fields?.[descKey] as
        | string
        | undefined;

      // Process action details
      let actionDetails;
      if (task.action?.id) {
        const actionReference = Object.entries(template.references || {}).find(
          ([, ref]) =>
            ref.locations?.some((loc) => loc.includes(task.action?.id || ""))
        );

        const actionObj = actionReference
          ? Object.values(template.objects).find(
              (obj) => obj.hash === actionReference[1].src_key_hash
            )
          : null;

        if (actionObj) {
          actionDetails = {
            ref: actionObj.fields?.ref,
            name: actionObj.nonfunctional_fields?.name || actionObj.fields?.ref,
            description: actionObj.nonfunctional_fields?.description,
          };
        }
      }

      // Calculate position
      let position;

      if (metadata) {
        // Use the stored metadata position with offset
        position = {
          x: metadata.x + offsetX,
          y: metadata.y + offsetY,
        };
      } else {
        // If no metadata position is available, use a grid layout
        // Calculate grid dimensions based on the number of tasks
        const tasksCount = selectedWorkflow.fields.tasks?.length || 1;
        const gridCols = Math.ceil(Math.sqrt(tasksCount));

        // Calculate grid position
        const col = index % gridCols;
        const row = Math.floor(index / gridCols);

        position = {
          x: offsetX + col * 300, // More spacing between columns
          y: offsetY + row * 200, // More spacing between rows
        };
      }

      // Detect Jinja templates
      const detectJinjaTemplates = (obj: unknown): boolean => {
        if (!obj) return false;
        if (typeof obj === "string") {
          return obj.includes("{{") && obj.includes("}}");
        }
        if (Array.isArray(obj)) {
          return obj.some((item) => detectJinjaTemplates(item));
        }
        if (typeof obj === "object") {
          return Object.values(obj).some((value) =>
            detectJinjaTemplates(value)
          );
        }
        return false;
      };

      const hasJinjaTemplates =
        detectJinjaTemplates(task.input) ||
        detectJinjaTemplates(task.action) ||
        detectJinjaTemplates(task.next);

      // Check if this is a sub-workflow task
      let isSubWorkflowTask = false;
      let subWorkflowId = undefined;

      // Method 1: Check if the task object itself is a workflow
      if (taskObj?.type === "workflow") {
        isSubWorkflowTask = true;
        subWorkflowId = task.id;
      }

      // Method 2: Check if the action reference contains "workflow"
      if (
        !isSubWorkflowTask &&
        task.action?.ref?.toLowerCase().includes("workflow")
      ) {
        isSubWorkflowTask = true;
      }

      // Method 3: Check if the task name contains "workflow"
      if (!isSubWorkflowTask && task.name?.toLowerCase().includes("workflow")) {
        isSubWorkflowTask = true;
      }

      // Method 4: Check for workflowId in input parameters
      if (task.input) {
        // Try to find workflow ID in the input parameters
        const inputStr = JSON.stringify(task.input);
        const workflowMatch = inputStr.match(/"workflowId"\s*:\s*"([^"]+)"/);
        if (workflowMatch && workflowMatch[1]) {
          isSubWorkflowTask = true;
          subWorkflowId = workflowMatch[1];
        }
      }

      // Method 5: Check if the task is referenced by other workflows
      if (!isSubWorkflowTask) {
        const isReferencedAsWorkflow = Object.values(template.objects).some(
          (obj) =>
            obj.type === "workflow" &&
            obj.fields?.tasks?.some((t) => t.action?.id === task.id)
        );

        if (isReferencedAsWorkflow) {
          isSubWorkflowTask = true;
          subWorkflowId = task.id;
        }
      }

      // Create node
      newNodes.push({
        id: task.id,
        type: "task",
        position,
        draggable: true,
        data: {
          name: task.name || taskObj?.nonfunctional_fields?.name || "Task",
          description:
            description ||
            task.description ||
            taskObj?.nonfunctional_fields?.description,
          action: actionDetails,
          input: task.input,
          output: taskObj?.fields?.output,
          timeout: task.timeout,
          transitionMode: task.transitionMode,
          humanSecondsSaved: task.humanSecondsSaved,
          publishResultAs: task.publishResultAs,
          type: taskObj?.type,
          isMocked: task.isMocked,
          retry: task.retry,
          runAsOrgId: task.runAsOrgId,
          securitySchema: task.securitySchema,
          packOverrides: task.packOverrides,
          hasJinjaTemplates,
          isSubWorkflowTask,
          subWorkflowId,
          next: task.next?.map((transition, idx) => {
            const labelKey = `tasks[${index}].next[${idx}].label`;
            const label = selectedWorkflow.nonfunctional_fields?.[labelKey] as
              | string
              | undefined;
            return {
              when: transition.when,
              label: label,
              followType:
                transition.do && transition.do.length > 1 ? "all" : "first",
            };
          }),
          onSubWorkflowClick: this.handleSubWorkflowClick,
        },
      });

      // Create edges
      if (Array.isArray(task.next)) {
        task.next.forEach((transition, transitionIndex) => {
          if (Array.isArray(transition?.do)) {
            const isFollowAll = transition.do && transition.do.length > 1;

            transition.do.forEach((targetId) => {
              if (!targetId) return;

              const edgeId = `${task.id}-${targetId}`;
              if (!processedEdges.has(edgeId)) {
                const labelKey = `tasks[${index}].next[${transitionIndex}].label`;
                const label = selectedWorkflow.nonfunctional_fields?.[
                  labelKey
                ] as string | undefined;

                console.log("CREATING EDGE:", {
                  source: task.id,
                  target: targetId,
                  sourceHandle: `transition-${transitionIndex}`,
                });

                newEdges.push({
                  id: edgeId,
                  source: task.id,
                  target: targetId,
                  sourceHandle: `transition-${transitionIndex}`,
                  animated: true,
                  label: label || transition.label,
                  style: {
                    stroke: `hsl(var(--workflow-${
                      isFollowAll ? "green" : "blue"
                    }))`,
                    strokeWidth: 3,
                  },
                  type: "smoothstep",
                  data: {
                    condition: transition.when,
                    followType: isFollowAll ? "all" : "first",
                  },
                });
                processedEdges.add(edgeId);
              }
            });
          }
        });
      }
    });

    // Add connections from triggers to their entry points in the workflow
    // First, find the first task in the workflow (usually the entry point)
    if (triggerNodes.length > 0 && selectedWorkflow.fields.tasks?.length > 0) {
      const firstTaskId = selectedWorkflow.fields.tasks[0]?.id;

      if (firstTaskId) {
        // Add edges from each trigger to the first task
        triggerNodes.forEach((triggerNode) => {
          const edgeId = `${triggerNode.id}-${firstTaskId}`;
          if (!processedEdges.has(edgeId)) {
            newEdges.push({
              id: edgeId,
              source: triggerNode.id,
              target: firstTaskId,
              animated: true,
              style: {
                stroke: "hsl(var(--workflow-orange))",
                strokeWidth: 3,
                strokeDasharray: "8, 4", // More visible dashed line for triggers
              },
              type: "smoothstep",
              data: {
                followType: "trigger",
              },
            });
            processedEdges.add(edgeId);
          }
        });
      }
    }

    // Set the processed nodes and edges
    this.setState({ nodes: newNodes, edges: newEdges });
  };

  handleNodesChange = (changes: NodeChange[]) => {
    this.setState((prev) => {
      const newNodes = [...prev.nodes];
      changes.forEach((change) => {
        if (
          change.type === "position" &&
          "position" in change &&
          change.position
        ) {
          const nodeIndex = newNodes.findIndex((n) => n.id === change.id);
          if (nodeIndex !== -1) {
            newNodes[nodeIndex] = {
              ...newNodes[nodeIndex],
              position: change.position,
            };
          }
        }
      });
      return { nodes: newNodes };
    });
  };

  render() {
    const { selectedWorkflowId, workflowHierarchy, nodes, edges } = this.state;
    const workflows = this.getWorkflows();
    const currentWorkflowName =
      workflows.find((wf) => wf.id === selectedWorkflowId)?.name || "Workflow";

    return (
      <div className="flex flex-col h-full min-h-[600px] w-full">
        {/* Workflow Navigation Bar */}
        <div className="bg-[hsl(var(--background))] p-4 border-b border-[hsl(var(--border))] flex items-center gap-4">
          {/* Breadcrumb Navigation */}
          <WorkflowBreadcrumb
            workflowHierarchy={workflowHierarchy}
            currentWorkflowName={currentWorkflowName}
            onNavigate={this.handleBreadcrumbNavigate}
          />

          {/* Workflow Selector */}
          <WorkflowSelector
            workflows={workflows}
            selectedWorkflowId={selectedWorkflowId}
            onSelect={this.handleWorkflowSelect}
          />
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={this.handleNodesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{
            type: "smoothstep",
          }}
          className="flex-1"
          style={{ height: "100%" }}
        >
          <Background />
          <Controls />

          {/* Control Panel */}
          <Panel
            position="top-right"
            className="bg-[hsl(var(--card))] p-4 rounded-lg shadow-lg space-y-4 border border-[hsl(var(--border))]"
          >
            <div className="flex flex-col gap-2">
              <button
                onClick={this.downloadSvg}
                className="flex items-center gap-1 px-3 py-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary))/90] text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Save as SVG
              </button>

              <button
                onClick={this.clearWorkflow}
                className="flex items-center gap-1 px-3 py-1.5 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] rounded-md hover:bg-[hsl(var(--destructive))/90] text-sm font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear Workflow
              </button>
            </div>
          </Panel>

          {/* Legend Panel */}
          <Panel
            position="top-left"
            className="bg-[hsl(var(--card))] p-4 rounded-lg shadow-lg border border-[hsl(var(--border))]"
          >
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2 text-[hsl(var(--foreground))]">
                  Task Types
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      API Call
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Email Task
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Webhook
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-pink-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Message/Chat
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Other Action
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2 text-[hsl(var(--foreground))]">
                  Indicators
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Jinja Templates
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Has Retry Config
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Mock Enabled
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Custom Organization
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Sub-workflow (clickable)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2 text-[hsl(var(--foreground))]">
                  Transitions
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-green-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Follow All
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-500" />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Follow First
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-0.5 bg-orange-500 border-t border-dashed"
                      style={{ borderTopStyle: "dashed" }}
                    />
                    <span className="text-sm text-[hsl(var(--foreground))]">
                      Trigger Connection
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    );
  }
}
