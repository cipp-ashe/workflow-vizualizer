/**
 * DAG (Directed Acyclic Graph) layout algorithm
 *
 * This algorithm positions nodes in a hierarchical layout based on their dependencies.
 * It assigns nodes to ranks (levels) and then positions them within each rank to
 * minimize edge crossings.
 */
import { Node, Edge } from "reactflow";
import { LayoutAlgorithm } from "./layoutEngine";
import { LayoutConfig } from "../../shared/types";

/**
 * Node with rank information
 */
interface RankedNode extends Node {
  rank?: number;
  order?: number;
}

/**
 * Edge with additional information for layout
 */
interface WeightedEdge {
  weight?: number;
  source: string;
  target: string;
}
/**
 * DAG layout algorithm implementation
 */
export class DagLayout implements LayoutAlgorithm {
  /**
   * Calculate positions for nodes based on the workflow structure
   * @param nodes The nodes to position
   * @param edges The edges connecting the nodes
   * @param config The layout configuration
   * @returns The nodes with updated positions
   */
  calculateLayout(nodes: Node[], edges: Edge[], config: LayoutConfig): Node[] {
    if (nodes.length === 0) {
      return [];
    }

    console.log("DagLayout: Calculating layout with config:", config);

    // Convert nodes to ranked nodes
    const rankedNodes = nodes.map((node) => ({
      ...node,
      rank: undefined,
      order: undefined,
    })) as RankedNode[];

    // Add weights to edges for better layout
    const weightedEdges = this.addEdgeWeights(edges);

    // Build the graph structure
    const graph = this.buildGraph(rankedNodes, edges);

    // Assign ranks to nodes
    this.assignRanks(rankedNodes, graph);

    // Order nodes within ranks to minimize edge crossings
    this.orderNodesWithinRanks(rankedNodes, graph, weightedEdges, edges);

    // Assign coordinates based on rank and order
    this.assignCoordinates(rankedNodes, config);

    // Compact the layout if needed
    if (config.compact) {
      this.compactLayout(rankedNodes, config);
    }

    // Return nodes with updated positions
    return rankedNodes.map((node) => ({
      ...node,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
    }));
  }

  /**
   * Add weights to edges based on their properties
   * @param edges The edges to add weights to
   * @returns The edges with weights
   */
  private addEdgeWeights(edges: Edge[]): WeightedEdge[] {
    return edges.map((edge) => {
      // Create a new WeightedEdge with required properties
      const weightedEdge: WeightedEdge = {
        source: edge.source,
        target: edge.target,
        weight: 1,
      };

      // Assign higher weights to edges with conditions or special properties
      if (edge.data) {
        if (edge.data.condition) {
          weightedEdge.weight = 3; // Conditional edges are more important
        }
        if (edge.data.followType === "first") {
          weightedEdge.weight = 4; // Follow-first edges are most important
        }
        if (edge.data.triggerType) {
          weightedEdge.weight = 5; // Trigger edges are the most important
        }
      }
      return weightedEdge;
    });
  }

  /**
   * Build a graph structure from nodes and edges
   * @param nodes The nodes to build the graph from
   * @param edges The edges connecting the nodes
   * @returns The graph structure
   */
  private buildGraph(
    nodes: RankedNode[],
    edges: Edge[]
  ): Map<string, { incoming: string[]; outgoing: string[] }> {
    const graph = new Map<string, { incoming: string[]; outgoing: string[] }>();

    // Initialize graph with empty arrays for each node
    nodes.forEach((node) => {
      graph.set(node.id, { incoming: [], outgoing: [] });
    });

    // Add edges to the graph
    edges.forEach((edge) => {
      const source = edge.source;
      const target = edge.target;

      const sourceNode = graph.get(source);
      const targetNode = graph.get(target);

      if (sourceNode && targetNode) {
        sourceNode.outgoing.push(target);
        targetNode.incoming.push(source);
      }
    });

    return graph;
  }

  /**
   * Assign ranks to nodes based on their dependencies
   * @param nodes The nodes to assign ranks to
   * @param graph The graph structure
   */
  private assignRanks(
    nodes: RankedNode[],
    graph: Map<string, { incoming: string[]; outgoing: string[] }>
  ): void {
    // Find source nodes (nodes with no incoming edges)
    const sourceNodes = nodes.filter(
      (node) => graph.get(node.id)?.incoming.length === 0
    );

    // If no source nodes, find nodes with minimal incoming edges
    if (sourceNodes.length === 0 && nodes.length > 0) {
      let minIncoming = Infinity;
      nodes.forEach((node) => {
        const incomingCount = graph.get(node.id)?.incoming.length || 0;
        minIncoming = Math.min(minIncoming, incomingCount);
      });

      sourceNodes.push(
        ...nodes.filter(
          (node) => graph.get(node.id)?.incoming.length === minIncoming
        )
      );
    }

    // Assign rank 0 to source nodes
    sourceNodes.forEach((node) => {
      node.rank = 0;
    });

    // Use network simplex algorithm for optimal rank assignment
    this.optimizeRanks(nodes, graph);

    // Breadth-first traversal to assign ranks
    const queue = [...sourceNodes];
    while (queue.length > 0) {
      const node = queue.shift()!;
      const nodeRank = node.rank!;
      const outgoing = graph.get(node.id)?.outgoing || [];

      outgoing.forEach((targetId) => {
        const targetNode = nodes.find((n) => n.id === targetId);
        if (targetNode) {
          // Assign rank to target node if not already assigned or if new rank is higher
          if (targetNode.rank === undefined || targetNode.rank < nodeRank + 1) {
            targetNode.rank = nodeRank + 1;
            queue.push(targetNode);
          }
        }
      });
    }

    // Handle nodes that weren't assigned a rank (disconnected nodes)
    nodes.forEach((node) => {
      if (node.rank === undefined) {
        node.rank = 0;
      }
    });
  }

  /**
   * Optimize ranks using a network simplex-inspired approach
   * This helps minimize the total edge length while respecting dependencies
   * @param nodes The nodes to optimize ranks for
   * @param graph The graph structure
   */
  private optimizeRanks(
    nodes: RankedNode[],
    graph: Map<string, { incoming: string[]; outgoing: string[] }>
  ): void {
    // Maximum number of iterations to prevent infinite loops
    const MAX_ITERATIONS = 10;

    // Perform multiple iterations of rank optimization
    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      let improved = false;

      // For each node, try to optimize its rank
      for (const node of nodes) {
        if (node.rank === undefined) continue;

        const nodeInfo = graph.get(node.id);
        if (!nodeInfo) continue;

        // Get incoming and outgoing nodes
        const incomingNodes = nodeInfo.incoming
          .map((id) => nodes.find((n) => n.id === id))
          .filter(
            (n) => n !== undefined && n.rank !== undefined
          ) as RankedNode[];

        const outgoingNodes = nodeInfo.outgoing
          .map((id) => nodes.find((n) => n.id === id))
          .filter(
            (n) => n !== undefined && n.rank !== undefined
          ) as RankedNode[];

        // Skip if no connections
        if (incomingNodes.length === 0 && outgoingNodes.length === 0) continue;

        // Calculate optimal rank based on neighbors
        let optimalRank = node.rank;

        if (incomingNodes.length > 0 && outgoingNodes.length > 0) {
          // If node has both incoming and outgoing edges, place it at the weighted average
          const incomingSum = incomingNodes.reduce(
            (sum, n) => sum + n.rank!,
            0
          );
          const outgoingSum = outgoingNodes.reduce(
            (sum, n) => sum + n.rank!,
            0
          );

          const incomingAvg = incomingSum / incomingNodes.length;
          const outgoingAvg = outgoingSum / outgoingNodes.length;

          // Calculate weighted average, ensuring we maintain the topological ordering
          const weightedAvg = (incomingAvg + outgoingAvg) / 2;

          // Ensure the rank is at least one more than the maximum incoming rank
          const maxIncomingRank = Math.max(
            ...incomingNodes.map((n) => n.rank!)
          );
          optimalRank = Math.max(Math.round(weightedAvg), maxIncomingRank + 1);
        } else if (incomingNodes.length > 0) {
          // If node only has incoming edges, place it just after the maximum incoming rank
          const maxIncomingRank = Math.max(
            ...incomingNodes.map((n) => n.rank!)
          );
          optimalRank = maxIncomingRank + 1;
        } else if (outgoingNodes.length > 0) {
          // If node only has outgoing edges, place it just before the minimum outgoing rank
          const minOutgoingRank = Math.min(
            ...outgoingNodes.map((n) => n.rank!)
          );
          optimalRank = Math.max(minOutgoingRank - 1, 0);
        }

        // Update rank if it's different
        if (optimalRank !== node.rank) {
          node.rank = optimalRank;
          improved = true;
        }
      }

      // If no improvements were made, we're done
      if (!improved) break;
    }
  }

  /**
   * Order nodes within ranks to minimize edge crossings
   * @param nodes The nodes to order
   * @param graph The graph structure
   * @param edges The edges with weights
   */
  private orderNodesWithinRanks(
    nodes: RankedNode[],
    graph: Map<string, { incoming: string[]; outgoing: string[] }>,
    weightedEdges: WeightedEdge[],
    originalEdges: Edge[]
  ): void {
    // Group nodes by rank
    const rankGroups = new Map<number, RankedNode[]>();
    nodes.forEach((node) => {
      const rank = node.rank!;
      if (!rankGroups.has(rank)) {
        rankGroups.set(rank, []);
      }
      rankGroups.get(rank)!.push(node);
    });

    // Sort ranks
    const ranks = Array.from(rankGroups.keys()).sort((a, b) => a - b);

    // Apply crossing reduction algorithm
    this.reduceCrossings(
      rankGroups,
      graph,
      weightedEdges,
      originalEdges,
      ranks
    );

    // Keep track of node relationships
    const nodeRelationships = new Map<
      string,
      { sources: Set<string>; targets: Set<string> }
    >();

    // Initialize node relationships
    nodes.forEach((node) => {
      nodeRelationships.set(node.id, {
        sources: new Set<string>(),
        targets: new Set<string>(),
      });
    });

    // Populate direct connections
    nodes.forEach((node) => {
      const incoming = graph.get(node.id)?.incoming || [];
      const outgoing = graph.get(node.id)?.outgoing || [];

      const relationships = nodeRelationships.get(node.id)!;

      incoming.forEach((source) => {
        relationships.sources.add(source);
      });

      outgoing.forEach((target) => {
        relationships.targets.add(target);
      });
    });

    // Propagate indirect connections up to 2 levels
    for (let i = 0; i < 2; i++) {
      nodes.forEach((node) => {
        const relationships = nodeRelationships.get(node.id)!;

        // Add sources of sources as indirect sources
        [...relationships.sources].forEach((source) => {
          const sourceRelationships = nodeRelationships.get(source);
          if (sourceRelationships) {
            sourceRelationships.sources.forEach((indirectSource) => {
              relationships.sources.add(indirectSource);
            });
          }
        });

        // Add targets of targets as indirect targets
        [...relationships.targets].forEach((target) => {
          const targetRelationships = nodeRelationships.get(target);
          if (targetRelationships) {
            targetRelationships.targets.forEach((indirectTarget) => {
              relationships.targets.add(indirectTarget);
            });
          }
        });
      });
    }

    // Order nodes within each rank
    ranks.forEach((rank) => {
      const nodesInRank = rankGroups.get(rank)!;

      // For the first rank, just assign orders sequentially
      if (rank === ranks[0]) {
        nodesInRank.forEach((node, index) => {
          node.order = index;
        });
        return;
      }

      // For subsequent ranks
      nodesInRank.forEach((node) => {
        const incoming = graph.get(node.id)?.incoming || [];

        if (incoming.length === 0) {
          // If no incoming edges, use a more stable and semantic ordering for consistent positioning
          // Use the full node ID string for ordering, not just the first character
          // This maintains consistency and avoids unwanted swapping of similarly named nodes

          // Extract node name or label for semantic ordering
          const nodeName = (
            node.data?.name ||
            node.data?.label ||
            node.id ||
            ""
          ).toLowerCase();

          // Generate a consistent hash value from the node ID for stable positioning
          // This prevents nodes like "Authorized" and "Unauthorized" from being ordered just by first character
          let hashValue = 0;
          for (let i = 0; i < nodeName.length; i++) {
            hashValue = (hashValue << 5) - hashValue + nodeName.charCodeAt(i);
            hashValue |= 0; // Convert to 32bit integer
          }

          // Use absolute value and modulo to get a positive index within the rank length
          node.order = Math.abs(hashValue) % nodesInRank.length;
          return;
        }

        // Calculate the weighted position of connected nodes in the previous rank
        let sum = 0;
        let count = 0;
        let maxWeight = 0;

        // Get direct parents
        incoming.forEach((sourceId) => {
          const sourceNode = nodes.find((n) => n.id === sourceId);
          if (sourceNode && sourceNode.order !== undefined) {
            // Direct parents have higher weight
            const weight = 5;
            sum += sourceNode.order * weight;
            count += weight;
            maxWeight = Math.max(maxWeight, weight);
          }
        });

        // Consider indirect relationships - for more stable layouts
        const relationships = nodeRelationships.get(node.id)!;
        relationships.sources.forEach((sourceId) => {
          // Skip direct parents (already counted above)
          if (incoming.includes(sourceId)) return;

          const sourceNode = nodes.find((n) => n.id === sourceId);
          if (sourceNode && sourceNode.order !== undefined) {
            // Indirect sources have lower weight
            const weight = 2;
            sum += sourceNode.order * weight;
            count += weight;
          }
        });

        // If this node connects to the same parents as other nodes in this rank,
        // try to position them adjacent to each other
        const sharedParentWeight = 3;
        nodesInRank.forEach((otherNode) => {
          if (otherNode.id === node.id) return;

          const otherIncoming = graph.get(otherNode.id)?.incoming || [];
          const sharedParents = incoming.filter((id) =>
            otherIncoming.includes(id)
          );

          if (sharedParents.length > 0 && otherNode.order !== undefined) {
            sum += otherNode.order * sharedParentWeight;
            count += sharedParentWeight;
          }
        });

        node.order = count > 0 ? sum / count : nodesInRank.length;
      });

      // Sort nodes by their calculated order
      nodesInRank.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Reassign orders sequentially
      nodesInRank.forEach((node, index) => {
        node.order = index;
      });
    });
  }

  /**
   * Reduce edge crossings using a modified Sugiyama algorithm
   * @param rankGroups The nodes grouped by rank
   * @param graph The graph structure
   * @param edges The edges with weights
   * @param ranks The sorted ranks
   */
  private reduceCrossings(
    rankGroups: Map<number, RankedNode[]>,
    graph: Map<string, { incoming: string[]; outgoing: string[] }>,
    edges: WeightedEdge[],
    originalEdges: Edge[],
    ranks: number[]
  ): void {
    // Maximum number of iterations for crossing reduction
    const MAX_ITERATIONS = 30;

    // Create an edge lookup for faster access
    const edgeLookup = new Map<string, WeightedEdge>();
    edges.forEach((edge) => {
      const key = `${edge.source}-${edge.target}`;
      edgeLookup.set(key, edge);
    });

    // Create a map of edge types for better handling
    const edgeTypeMap = new Map<string, string>();
    originalEdges.forEach((edge) => {
      const key = `${edge.source}-${edge.target}`;
      if (edge.data?.triggerType) {
        edgeTypeMap.set(key, "trigger");
      } else if (edge.data?.condition) {
        edgeTypeMap.set(key, "condition");
      } else if (edge.data?.followType === "first") {
        edgeTypeMap.set(key, "primary");
      }
    });

    // Perform multiple iterations of crossing reduction
    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      let improved = false;

      // Process ranks from top to bottom (sweep down)
      if (iteration % 2 === 0) {
        for (let i = 0; i < ranks.length - 1; i++) {
          const currentRank = ranks[i];
          const nextRank = ranks[i + 1];

          improved =
            this.minimizeCrossings(
              rankGroups.get(currentRank)!,
              rankGroups.get(nextRank)!,
              graph,
              edgeLookup,
              true,
              edgeTypeMap
            ) || improved;
        }
      }
      // Process ranks from bottom to top (sweep up)
      else {
        for (let i = ranks.length - 1; i > 0; i--) {
          const currentRank = ranks[i];
          const prevRank = ranks[i - 1];

          improved =
            this.minimizeCrossings(
              rankGroups.get(currentRank)!,
              rankGroups.get(prevRank)!,
              graph,
              edgeLookup,
              false,
              edgeTypeMap
            ) || improved;
        }
      }

      // If no improvements were made, we're done
      if (!improved) break;
    }
  }

  /**
   * Minimize crossings between two adjacent ranks
   * @param fixedRankNodes The nodes in the fixed rank
   * @param movableRankNodes The nodes in the rank to reorder
   * @param graph The graph structure
   * @param edgeLookup The edge lookup map
   * @param isDownSweep Whether this is a down sweep (true) or up sweep (false)
   * @param edgeTypeMap Map of edge types for better handling
   * @returns Whether any improvements were made
   */
  private minimizeCrossings(
    fixedRankNodes: RankedNode[],
    movableRankNodes: RankedNode[],
    graph: Map<string, { incoming: string[]; outgoing: string[] }>,
    edgeLookup: Map<string, WeightedEdge>,
    isDownSweep: boolean,
    edgeTypeMap: Map<string, string>
  ): boolean {
    // Implementation of barycenter method
    movableRankNodes.forEach((node) => {
      const connections = isDownSweep
        ? graph.get(node.id)?.outgoing || []
        : graph.get(node.id)?.incoming || [];

      // Calculate barycenter value based on connected nodes' positions
      let sum = 0;
      let totalWeight = 0;

      connections.forEach((connectedId) => {
        const connectedNode = fixedRankNodes.find((n) => n.id === connectedId);
        if (connectedNode && connectedNode.order !== undefined) {
          // Get edge weight
          const edgeKey = isDownSweep
            ? `${node.id}-${connectedId}`
            : `${connectedId}-${node.id}`;
          const edge = edgeLookup.get(edgeKey);
          let weight = edge?.weight || 1;

          // Apply additional weight based on edge type
          const edgeType = edgeTypeMap.get(edgeKey);
          if (edgeType === "trigger") {
            weight *= 3; // Highest priority for trigger edges
          } else if (edgeType === "condition") {
            weight *= 2; // High priority for conditional edges
          } else if (edgeType === "primary") {
            weight *= 1.5; // Medium priority for primary flow edges
          }

          sum += connectedNode.order * weight;
          totalWeight += weight;
        }
      });

      // Assign barycenter value as order
      if (totalWeight > 0) {
        node.order = sum / totalWeight;
      }
    });

    // Sort nodes by their calculated order
    const originalOrder = [...movableRankNodes].map((n) => n.id);
    movableRankNodes.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Reassign orders sequentially
    movableRankNodes.forEach((node, index) => {
      node.order = index;
    });

    // Check if order changed
    return !movableRankNodes.every(
      (node, index) => node.id === originalOrder[index]
    );
  }

  /**
   * Assign coordinates to nodes based on their rank and order
   * @param nodes The nodes to assign coordinates to
   * @param config The layout configuration
   */
  private assignCoordinates(nodes: RankedNode[], config: LayoutConfig): void {
    // Group nodes by rank
    const rankGroups = new Map<number, RankedNode[]>();
    nodes.forEach((node) => {
      const rank = node.rank!;
      if (!rankGroups.has(rank)) {
        rankGroups.set(rank, []);
      }
      rankGroups.get(rank)!.push(node);
    });

    // Sort ranks
    const ranks = Array.from(rankGroups.keys()).sort((a, b) => a - b);

    // Calculate the maximum number of nodes in any rank
    let maxNodesInRank = 0;
    rankGroups.forEach((nodesInRank) => {
      maxNodesInRank = Math.max(maxNodesInRank, nodesInRank.length);
    });

    // Calculate the total width needed
    const totalWidth = maxNodesInRank * config.nodeSpacing;

    // Assign coordinates based on rank and order
    ranks.forEach((rank) => {
      const nodesInRank = rankGroups.get(rank)!;
      const rankWidth = nodesInRank.length * config.nodeSpacing;

      // Calculate the starting x position based on alignment
      let startX = 0;
      if (config.rankAlignment === "center") {
        startX = (totalWidth - rankWidth) / 2;
      } else if (config.rankAlignment === "right") {
        startX = totalWidth - rankWidth;
      }

      // Assign coordinates to each node in the rank based on direction
      nodesInRank.forEach((node, index) => {
        let x, y;

        if (config.direction === "LR") {
          // Left to Right layout - swap x and y
          x = rank * config.rankSpacing + config.padding;
          y = startX + index * config.nodeSpacing + config.padding;
        } else {
          // Top to Bottom layout (default)
          x = startX + index * config.nodeSpacing + config.padding;
          y = rank * config.rankSpacing + config.padding;
        }

        node.position = { x, y };
      });
    });
  }

  /**
   * Compact the layout to remove unnecessary space
   * @param nodes The nodes to compact
   * @param config The layout configuration
   */
  private compactLayout(nodes: RankedNode[], config: LayoutConfig): void {
    // Group nodes by rank
    const rankGroups = new Map<number, RankedNode[]>();
    nodes.forEach((node) => {
      const rank = node.rank!;
      if (!rankGroups.has(rank)) {
        rankGroups.set(rank, []);
      }
      rankGroups.get(rank)!.push(node);
    });

    // Sort ranks
    const ranks = Array.from(rankGroups.keys()).sort((a, b) => a - b);

    // Calculate spacing based on config
    // For compact layout, use smaller spacing values
    const nodeSpacingFactor = config.compact ? 0.5 : 1.0;
    const rankSpacingFactor = config.compact ? 0.6 : 1.0;

    // Ensure minimum spacing between nodes
    const minNodeSpacing =
      config.nodeSize.width + config.nodeSpacing * nodeSpacingFactor;
    const minRankSpacing =
      config.nodeSize.minHeight + config.rankSpacing * rankSpacingFactor;

    console.log("Compacting layout with spacing:", {
      minNodeSpacing,
      minRankSpacing,
      compact: config.compact,
      nodeSpacing: config.nodeSpacing,
      rankSpacing: config.rankSpacing,
    });

    // Compact each rank horizontally with proper spacing
    ranks.forEach((rank) => {
      const nodesInRank = rankGroups.get(rank)!;

      // Sort nodes by x position
      nodesInRank.sort((a, b) => a.position.x - b.position.x);

      // Compact nodes horizontally with adequate spacing
      let currentX = config.padding;
      nodesInRank.forEach((node) => {
        node.position.x = currentX;
        // Ensure nodes have enough space between them
        currentX += minNodeSpacing;
      });
    });

    // Ensure vertical spacing between ranks
    for (let i = 1; i < ranks.length; i++) {
      const prevRank = ranks[i - 1];
      const currRank = ranks[i];

      const prevNodes = rankGroups.get(prevRank)!;
      const currNodes = rankGroups.get(currRank)!;

      // Find the lowest node in previous rank
      const prevMaxY = Math.max(...prevNodes.map((node) => node.position.y));

      // Set y position for current rank
      const currY = prevMaxY + minRankSpacing;
      currNodes.forEach((node) => {
        node.position.y = currY;
      });
    }

    // Check if the layout exceeds the maximum width
    const maxX = Math.max(
      ...nodes.map((node) => node.position.x + config.nodeSize.width)
    );
    const maxWidth = config.maxWidth || 1200; // Default to 1200 if maxWidth is undefined
    if (maxX > maxWidth) {
      // Wrap the layout to fit within the maximum width
      this.wrapLayout(nodes, config);
    }
  }

  /**
   * Wrap the layout to fit within the maximum width
   * @param nodes The nodes to wrap
   * @param config The layout configuration
   */
  private wrapLayout(nodes: RankedNode[], config: LayoutConfig): void {
    // Group nodes by rank
    const rankGroups = new Map<number, RankedNode[]>();
    nodes.forEach((node) => {
      const rank = node.rank!;
      if (!rankGroups.has(rank)) {
        rankGroups.set(rank, []);
      }
      rankGroups.get(rank)!.push(node);
    });

    // Sort ranks
    const ranks = Array.from(rankGroups.keys()).sort((a, b) => a - b);

    // Calculate the number of columns needed
    const maxNodesInRank = Math.max(
      ...Array.from(rankGroups.values()).map((nodes) => nodes.length)
    );
    const nodeWidth = config.nodeSize.width + config.nodeSpacing;
    const maxWidth = config.maxWidth || 1200; // Default to 1200 if maxWidth is undefined
    const columnsNeeded = Math.ceil((maxNodesInRank * nodeWidth) / maxWidth);

    if (columnsNeeded <= 1) {
      return;
    }

    // Calculate the number of nodes per column
    const nodesPerColumn = Math.ceil(maxNodesInRank / columnsNeeded);

    // Wrap each rank
    ranks.forEach((rank) => {
      const nodesInRank = rankGroups.get(rank)!;

      // Sort nodes by x position
      nodesInRank.sort((a, b) => a.position.x - b.position.x);

      // Wrap nodes into columns
      nodesInRank.forEach((node, index) => {
        const column = Math.floor(index / nodesPerColumn);
        const rowInColumn = index % nodesPerColumn;

        node.position.x =
          column * maxWidth + rowInColumn * nodeWidth + config.padding;
        node.position.y = rank * config.rankSpacing + config.padding;
      });
    });
  }
}
