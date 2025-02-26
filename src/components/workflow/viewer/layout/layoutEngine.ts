/**
 * Layout engine for workflow visualization
 *
 * This module provides a centralized layout engine for calculating node positions
 * based on the workflow structure. It implements various layout algorithms and
 * provides a consistent interface for applying layouts to workflow nodes.
 */
import { Node, Edge } from "reactflow";
import { DEFAULT_LAYOUT_CONFIG } from "../../shared/constants";
import { LayoutConfig, WorkflowTask } from "../../shared/types";

/**
 * Interface for layout algorithms
 */
export interface LayoutAlgorithm {
  /**
   * Calculate positions for nodes based on the workflow structure
   * @param nodes The nodes to position
   * @param edges The edges connecting the nodes
   * @param config The layout configuration
   * @returns The nodes with updated positions
   */
  calculateLayout(nodes: Node[], edges: Edge[], config: LayoutConfig): Node[];
}

/**
 * Layout engine class that orchestrates the layout calculation
 */
export class LayoutEngine {
  private algorithm: LayoutAlgorithm;
  private config: LayoutConfig;

  /**
   * Create a new layout engine
   * @param algorithm The layout algorithm to use
   * @param config The layout configuration
   */
  constructor(
    algorithm: LayoutAlgorithm,
    config: LayoutConfig = DEFAULT_LAYOUT_CONFIG as LayoutConfig
  ) {
    this.algorithm = algorithm;
    this.config = config;
  }

  /**
   * Set the layout algorithm
   * @param algorithm The layout algorithm to use
   */
  setAlgorithm(algorithm: LayoutAlgorithm): void {
    this.algorithm = algorithm;
  }

  /**
   * Set the layout configuration
   * @param config The layout configuration
   */
  setConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Apply the layout to the nodes
   * @param nodes The nodes to position
   * @param edges The edges connecting the nodes
   * @returns The nodes with updated positions
   */
  applyLayout(nodes: Node[], edges: Edge[]): Node[] {
    console.log("LayoutEngine: Applying layout with config:", this.config);
    return this.algorithm.calculateLayout(nodes, edges, this.config);
  }

  /**
   * Calculate the viewport dimensions to fit all nodes
   * @param nodes The nodes to fit
   * @returns The viewport dimensions
   */
  calculateViewport(nodes: Node[]): { x: number; y: number; zoom: number } {
    if (nodes.length === 0) {
      return { x: 0, y: 0, zoom: 1 };
    }

    // Calculate the bounding box of all nodes
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
      const width = node.width || this.config.nodeSize?.width || 250;
      const height = node.height || this.config.nodeSize?.minHeight || 100;

      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + width);
      maxY = Math.max(maxY, node.position.y + height);
    });

    // Calculate the center of the bounding box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate the zoom level to fit all nodes
    const width = maxX - minX + (this.config.padding || 50) * 2;
    const height = maxY - minY + (this.config.padding || 50) * 2;
    const zoom = Math.min(
      1,
      Math.min(
        this.config.viewport?.maxZoom || 1.2,
        Math.max(
          this.config.viewport?.minZoom || 0.4,
          Math.min(window.innerWidth / width, window.innerHeight / height)
        )
      )
    );

    return {
      x: centerX,
      y: centerY,
      zoom,
    };
  }

  /**
   * Create nodes from workflow tasks
   * @param tasks The workflow tasks
   * @returns The created nodes
   */
  static createNodesFromTasks(tasks: WorkflowTask[]): Node[] {
    return tasks.map((task) => ({
      id: task.id,
      type: "task",
      position: {
        x: task.metadata?.x || 0,
        y: task.metadata?.y || 0,
      },
      data: {
        id: task.id,
        name: task.name || "Task",
        description: task.description,
        // Add other task data as needed
      },
    }));
  }
}
