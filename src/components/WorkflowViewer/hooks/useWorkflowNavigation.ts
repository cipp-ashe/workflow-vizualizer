import { useState, useCallback } from "react";
import { getWorkflows } from "../utils/templateUtils";
import { WorkflowBundle } from "../../../types/workflow";

/**
 * Interface for workflow hierarchy item
 */
interface WorkflowHierarchyItem {
  id: string;
  name: string;
}

/**
 * Hook for managing workflow navigation
 * @param template The workflow bundle containing the objects
 * @returns Navigation state and handlers
 */
export function useWorkflowNavigation(template: WorkflowBundle) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null
  );
  const [workflowHierarchy, setWorkflowHierarchy] = useState<
    WorkflowHierarchyItem[]
  >([]);

  /**
   * Initialize the navigation with the first workflow
   */
  const initializeNavigation = useCallback(() => {
    const workflows = getWorkflows(template);
    if (workflows.length > 0) {
      setSelectedWorkflowId(workflows[0].id);
      setWorkflowHierarchy([]);
    }
  }, [template]);

  /**
   * Handle sub-workflow navigation
   * @param subWorkflowId The ID of the sub-workflow to navigate to
   */
  const handleSubWorkflowClick = useCallback(
    (subWorkflowId: string) => {
      if (!subWorkflowId) return;

      // Find the workflow name
      const subWorkflow = getWorkflows(template).find(
        (wf) => wf.id === subWorkflowId
      );

      if (!subWorkflow) {
        console.warn(`Sub-workflow with ID ${subWorkflowId} not found`);
        return;
      }

      // Add current workflow to hierarchy before switching
      if (selectedWorkflowId) {
        const currentWorkflow = getWorkflows(template).find(
          (wf) => wf.id === selectedWorkflowId
        );

        if (currentWorkflow) {
          console.log(
            `Navigating from ${currentWorkflow.name} to ${subWorkflow.name}`
          );

          setWorkflowHierarchy((prev) => [
            ...prev,
            {
              id: selectedWorkflowId,
              name: currentWorkflow.name,
            },
          ]);
          setSelectedWorkflowId(subWorkflowId);
        }
      } else {
        // If no current workflow (unlikely), just switch
        setSelectedWorkflowId(subWorkflowId);
      }
    },
    [selectedWorkflowId, template]
  );

  /**
   * Handle workflow selection from dropdown
   * @param workflowId The ID of the workflow to select
   */
  const handleWorkflowSelect = useCallback((workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setWorkflowHierarchy([]); // Reset hierarchy when manually selecting a workflow
  }, []);

  /**
   * Handle breadcrumb navigation
   * @param workflowId The ID of the workflow to navigate to
   * @param index The index in the hierarchy
   */
  const handleBreadcrumbNavigate = useCallback(
    (workflowId: string, index: number) => {
      setSelectedWorkflowId(workflowId);
      setWorkflowHierarchy((prev) => prev.slice(0, index));
    },
    []
  );

  return {
    selectedWorkflowId,
    workflowHierarchy,
    initializeNavigation,
    handleSubWorkflowClick,
    handleWorkflowSelect,
    handleBreadcrumbNavigate,
  };
}
