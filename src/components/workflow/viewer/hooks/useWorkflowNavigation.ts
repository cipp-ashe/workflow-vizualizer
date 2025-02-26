/**
 * Hook for managing workflow navigation
 */
import { useCallback, useState, useEffect } from "react";
import { WorkflowBundle, Task } from "../../../../types/workflow";
import { WorkflowNavigationHookResult } from "../types";

/**
 * Hook for managing workflow navigation
 * @param template The workflow template
 * @returns Navigation state and handlers
 */
export function useWorkflowNavigation(
  template: WorkflowBundle
): WorkflowNavigationHookResult {
  // State for selected workflow and hierarchy
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null
  );
  const [workflowHierarchy, setWorkflowHierarchy] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // State for tracking parent-child relationships
  const [workflowRelationships, setWorkflowRelationships] = useState<
    Map<string, { parents: string[]; children: string[] }>
  >(new Map());

  /**
   * Build workflow relationships map
   */
  const buildWorkflowRelationships = useCallback(() => {
    const relationships = new Map<
      string,
      { parents: string[]; children: string[] }
    >();

    // Initialize relationships for all workflows
    Object.values(template.objects)
      .filter((obj) => obj.type === "workflow")
      .forEach((workflow) => {
        const workflowId = (workflow.fields.id as string) || workflow.hash;
        relationships.set(workflowId, { parents: [], children: [] });
      });

    // Analyze task transitions to identify parent-child relationships
    Object.values(template.objects)
      .filter((obj) => obj.type === "workflow")
      .forEach((workflow) => {
        const workflowId = (workflow.fields.id as string) || workflow.hash;
        const tasks = (workflow.fields.tasks as Task[]) || [];

        tasks.forEach((task) => {
          const transitions = task.next || [];
          transitions.forEach((transition) => {
            const targetIds = transition.do || [];
            targetIds.forEach((targetId) => {
              // Check if the target is another workflow
              if (relationships.has(targetId)) {
                // Add parent-child relationship
                const workflowRelationship = relationships.get(workflowId);
                const targetRelationship = relationships.get(targetId);

                if (workflowRelationship && targetRelationship) {
                  // Add child to parent
                  if (!workflowRelationship.children.includes(targetId)) {
                    workflowRelationship.children.push(targetId);
                  }

                  // Add parent to child
                  if (!targetRelationship.parents.includes(workflowId)) {
                    targetRelationship.parents.push(workflowId);
                  }
                }
              }
            });
          });
        });
      });

    setWorkflowRelationships(relationships);
    return relationships;
  }, [template]);

  /**
   * Get parent workflows for a given workflow ID
   * @param workflowId The workflow ID to get parents for
   * @returns Array of parent workflow IDs
   */
  const getParentWorkflows = useCallback(
    (workflowId: string): string[] => {
      return workflowRelationships.get(workflowId)?.parents || [];
    },
    [workflowRelationships]
  );

  /**
   * Initialize navigation with the first workflow
   */
  const initializeNavigation = useCallback(() => {
    console.log("Initializing navigation with template:", template);

    // Build workflow relationships
    buildWorkflowRelationships();

    // Find workflow objects in the template
    const workflowObjects = Object.values(template.objects).filter(
      (obj) => obj.type === "workflow"
    );

    console.log("Found workflow objects:", workflowObjects);

    if (workflowObjects.length > 0) {
      const firstWorkflow = workflowObjects[0];
      console.log("First workflow:", firstWorkflow);

      // Try to get the workflow ID from different possible locations
      let workflowId = "";
      if (firstWorkflow.fields?.id) {
        workflowId = firstWorkflow.fields.id as string;
      } else {
        // Use type assertion to access potential properties not in the type
        const workflowAny = firstWorkflow as unknown as Record<string, unknown>;
        if (workflowAny.id) {
          workflowId = workflowAny.id as string;
        } else {
          // Look for any key that might be an ID
          const possibleIdKeys = Object.keys(workflowAny).filter(
            (key) =>
              key.includes("id") || key.includes("Id") || key.includes("ID")
          );
          if (possibleIdKeys.length > 0) {
            workflowId = (workflowAny[possibleIdKeys[0]] as string) || "";
          } else {
            // Use the key from the objects map as a last resort
            const workflowKey = Object.keys(template.objects).find(
              (key) => template.objects[key] === firstWorkflow
            );
            workflowId = workflowKey || "";
          }
        }
      }

      console.log("Selected workflow ID:", workflowId);

      // Get the workflow name
      const workflowAny = firstWorkflow as unknown as Record<string, unknown>;
      const workflowName =
        firstWorkflow.nonfunctional_fields?.name ||
        (workflowAny.name as string) ||
        "Workflow";

      setSelectedWorkflowId(workflowId);
      setWorkflowHierarchy([{ id: workflowId, name: workflowName }]);
    } else {
      console.log("No workflow objects found in template");

      // Try a different approach - look for objects with workflow in their key
      const workflowKeys = Object.keys(template.objects).filter(
        (key) => key.includes("workflow") || key.includes("Workflow")
      );

      console.log("Found workflow keys:", workflowKeys);

      if (workflowKeys.length > 0) {
        const workflowId = workflowKeys[0].split(":")[1] || workflowKeys[0];
        console.log("Using workflow ID from key:", workflowId);

        setSelectedWorkflowId(workflowId);
        setWorkflowHierarchy([{ id: workflowId, name: "Workflow" }]);
      }
    }
  }, [template, buildWorkflowRelationships]);

  /**
   * Handle sub-workflow click
   * @param workflowId The workflow ID to navigate to
   */
  const handleSubWorkflowClick = useCallback(
    (workflowId: string) => {
      if (!workflowId) return;

      // Try different ways to find the workflow
      let workflow;

      // First try to find by fields.id
      workflow = Object.values(template.objects).find(
        (obj) => obj.type === "workflow" && obj.fields?.id === workflowId
      );

      // If not found, try to find by key in objects map
      if (!workflow) {
        // Try with workflow: prefix
        const fullKey = `workflow:${workflowId}`;
        workflow = template.objects[fullKey];

        // If still not found, try the ID directly
        if (!workflow) {
          workflow = template.objects[workflowId];
        }
      }

      // If still not found, try to find by reference
      if (!workflow) {
        // Look for objects with references to this workflow ID
        const referencingObjects = Object.values(template.objects).filter(
          (obj) => {
            const objAny = obj as unknown as Record<string, unknown>;
            if (objAny.references) {
              return Object.values(
                objAny.references as Record<string, unknown>
              ).some(
                (ref: unknown) =>
                  (ref as Record<string, string>).src_key_hash === workflowId
              );
            }
            return false;
          }
        );

        if (referencingObjects.length > 0) {
          workflow = referencingObjects[0];
        }
      }

      if (!workflow) {
        console.log("Could not find workflow with ID:", workflowId);
        return;
      }

      // Get the workflow name
      const workflowAny = workflow as unknown as Record<string, unknown>;
      const workflowName =
        workflow.nonfunctional_fields?.name ||
        (workflowAny.name as string) ||
        "Workflow";

      console.log("Navigating to workflow:", { workflowId, workflowName });

      setSelectedWorkflowId(workflowId);

      // Update hierarchy with proper parent-child relationship
      setWorkflowHierarchy((prev) => {
        // Check if this is a child of the current workflow
        const currentWorkflowId = prev[prev.length - 1]?.id;
        if (!currentWorkflowId) return [{ id: workflowId, name: workflowName }];

        const isChild = workflowRelationships
          .get(currentWorkflowId)
          ?.children.includes(workflowId);

        if (isChild) {
          // Add to the hierarchy
          return [...prev, { id: workflowId, name: workflowName }];
        } else {
          // Check if this is a sibling or unrelated workflow
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

  /**
   * Handle workflow selection
   * @param workflowId The workflow ID to select
   */
  const handleWorkflowSelect = useCallback(
    (workflowId: string) => {
      if (!workflowId) return;

      // Try different ways to find the workflow
      let workflow;

      // First try to find by fields.id
      workflow = Object.values(template.objects).find(
        (obj) => obj.type === "workflow" && obj.fields?.id === workflowId
      );

      // If not found, try to find by key in objects map
      if (!workflow) {
        // Try with workflow: prefix
        const fullKey = `workflow:${workflowId}`;
        workflow = template.objects[fullKey];

        // If still not found, try the ID directly
        if (!workflow) {
          workflow = template.objects[workflowId];
        }
      }

      // If still not found, try to find by reference
      if (!workflow) {
        // Look for objects with references to this workflow ID
        const referencingObjects = Object.values(template.objects).filter(
          (obj) => {
            const objAny = obj as unknown as Record<string, unknown>;
            if (objAny.references) {
              return Object.values(
                objAny.references as Record<string, unknown>
              ).some(
                (ref: unknown) =>
                  (ref as Record<string, string>).src_key_hash === workflowId
              );
            }
            return false;
          }
        );

        if (referencingObjects.length > 0) {
          workflow = referencingObjects[0];
        }
      }

      if (!workflow) {
        console.log("Could not find workflow with ID:", workflowId);
        return;
      }

      // Get the workflow name
      const workflowAny = workflow as unknown as Record<string, unknown>;
      const workflowName =
        workflow.nonfunctional_fields?.name ||
        (workflowAny.name as string) ||
        "Workflow";

      console.log("Selected workflow:", { workflowId, workflowName });

      setSelectedWorkflowId(workflowId);
      setWorkflowHierarchy([{ id: workflowId, name: workflowName }]);
    },
    [template]
  );

  /**
   * Handle breadcrumb navigation
   * @param workflowId The workflow ID to navigate to
   * @param index The index in the hierarchy
   */
  const handleBreadcrumbNavigate = useCallback(
    (workflowId: string, index: number) => {
      if (!workflowId) return;

      setSelectedWorkflowId(workflowId);
      setWorkflowHierarchy((prev) => prev.slice(0, index + 1));
    },
    []
  );

  // Initialize relationships when template changes
  useEffect(() => {
    buildWorkflowRelationships();
  }, [template, buildWorkflowRelationships]);

  return {
    selectedWorkflowId,
    workflowHierarchy,
    workflowRelationships,
    initializeNavigation,
    handleSubWorkflowClick,
    handleWorkflowSelect,
    handleBreadcrumbNavigate,
    getParentWorkflows,
  };
}
