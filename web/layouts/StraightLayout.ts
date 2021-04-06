/* eslint-disable no-constant-condition */
import { Line, Vertex } from '../draw';
import Graph, { Hash } from '../graph/Graph';
import Node, { NodePod } from '../graph/Node';

export interface LayoutResultPod {
  syncLines: Array<Vertex[]>;
  nodes: Array<NodePod>;
  branchLines: Array<Vertex[]>;
  maxLanes: number;
}

export class LayoutResult {
  syncLines: Array<Line>;
  nodes: Array<Node>;
  branchLines: Array<Line>;
  maxLanes: number;

  constructor(nodes: Array<Node>, branchLines: Array<Line>, syncLines: Array<Line>, maxLanes: number) {
    this.syncLines = syncLines;
    this.nodes = nodes;
    this.branchLines = branchLines;
    this.maxLanes = maxLanes;
  }

  pod(): LayoutResultPod {
    return {
      nodes: this.nodes.map((node) => node.pod()),
      branchLines: this.branchLines.map((line) => line.vertices),
      syncLines: this.syncLines.map((line) => line.vertices),
      maxLanes: this.maxLanes,
    };
  }
}

class LaneAllocator {
  // map slice index to lane indices. When slice index reaches, all the
  // lanes in the lane index array must be closed.
  activeBranchMap = new Map<number, Array<number>>();
  activeBranches = new Array<boolean>();
  graph: Graph;

  constructor(graph: Graph) {
    this.graph = graph;
  }

  recordBranch(laneIndex: number, whenToClose: number): void {
    const laneIndices = this.activeBranchMap.get(whenToClose) || [];
    laneIndices.push(laneIndex);
    this.activeBranchMap.set(whenToClose, laneIndices);

    this.activeBranches[laneIndex] = true;
  }

  closeBranches(sliceIndex: number): void {
    // Close any branches needs closing before performing free lane check.
    const laneIndices = this.activeBranchMap.get(sliceIndex);
    if (laneIndices) {
      for (const laneIndex of laneIndices) {
        this.activeBranches[laneIndex] = false;
      }
      this.activeBranchMap.delete(sliceIndex);
    }
  }

  getFreeLane(
    branchTip: Node,
    priorityBranchSections: Array<[number, number]>,
    nodes: Array<Node>,
    visited: Set<Node>
  ) {
    // const laneBlocked = new Array<boolean>();

    // Check whether current branch can use priority branch lane
    for (let i = 0; i < priorityBranchSections.length; ++i) {
      const [start, end] = priorityBranchSections[i];
      // Might be able to utilise priority lane, needs check further on branch base
      if (branchTip.y < start) {
        // If slice index is also smaller
        let branchBase = nodes[branchTip.y];
        while (!visited.has(branchBase) && branchBase) {
          branchBase = this.graph.getNode(branchBase.parents[0]);

          // Early break if branch base has gone pass branch start section.
          // Which means the branch cannot utilise the current priority lane
          if (branchBase.y >= start) {
            break;
          }
        }

        // The current branch is outside of the priority branch section.
        // The lane is available if there is no active branch on the lane.
        if (branchBase.y < start && !this.activeBranches[i]) {
          return i;
        }
      }
      // Definitely not blocked
      // The lane is available if there is no active branch on the lane.
      else if (branchTip.y >= end) {
        if (!this.activeBranches[i]) {
          return i;
        }
      }
    }

    // Check the rest of the active branches
    for (let i = priorityBranchSections.length; i < this.activeBranches.length; ++i) {
      if (this.activeBranches[i] === false) return i;
    }

    // Need add a new lane!
    return this.activeBranches.length;
  }
}

export default class StraightLayout {
  private graph: Graph;

  private priorityBranches: Array<Hash>;

  /**
   * User can choose certain branch to pin to a fixed column.
   * This array keeps track of the open and end of these branches.
   * Including the master (or main) branch
   */
  private priorityBranchSections: Array<[number, number]>;

  /**
   * Stores the up to date end node index of currently opening branch (usually those long running branches), e.g., [undefined, ]
   * It is for calculating node position internally.
   */
  // private activeBranches: Array<boolean | undefined>;

  /**
   * True if it is **blocked**, and cannot be allocated to a branch.
   * It is for calculating node position internally.
   */
  // private columnStatus: Array<boolean>;

  constructor(graph: Graph, priorityBranches: Array<Hash> = []) {
    this.graph = graph;
    // this.priorityBranches = ['33e1d8984e289d58e3939b705749e9f67388dd6f']; //priorityBranches;
    this.priorityBranches = priorityBranches;
    this.priorityBranchSections = new Array<[number, number]>();
  }

  process(): LayoutResult {
    /**
     * Sync line contains the begin and end information of the sync edge.
     * Sync line is the edge between 2 visited nodes. In git, it usually happens when people try to
     * keep a topic branch up to date with another branch. Also notice that, the sync merge does not end the topic branch.
     */
    const syncLines = new Array<Line>();

    /**
     * Branch line contains the main branch start and end information. Just the line drawing representation of the normal branch.
     */
    const branchLines = new Array<Line>();

    /**
     * Temp set to store visited nodes. Typical usage:
     * 1. To determine the branch base node when traversing topologically.
     * 2. Determine whether a branch is merged or not: dangling branch.
     *
     * Node is visited when node.x is set.
     */
    const visited = new Set<Node>();

    /**
     *
     */
    const laneAllocator = new LaneAllocator(this.graph);

    // Layout priority branches first, so dedicated lanes can be provided.
    for (let i = 0; i < this.priorityBranches.length; ++i) {
      const branchTip = this.priorityBranches[i];
      let node: Node | undefined = this.graph.getNode(branchTip);
      if (!node) throw new Error(`Node does not exist: ${branchTip}`);

      // If priority branches have shared nodes (usually means they are fast forward merged),
      // the first branch will take over and ignore the later branches.
      if (!visited.has(node)) {
        const startIndex = node.y;
        let endIndex = startIndex;
        const line = new Line();
        line.add(i, node.y);

        while (true) {
          node.x = i;
          endIndex = node.y;
          visited.add(node);

          if (node.parents[0] === undefined) break;

          node = this.graph.getNode(node.parents[0]);

          if (visited.has(node)) {
            line.add(i, node.y);
            break;
          }
        }
        this.priorityBranchSections[i] = [startIndex, endIndex];

        line.add(node.x, node.y);
        branchLines.push(line);
      }
    }

    // Layout nodes to their correct lane, and record branch drawing information (syncLines and branchLines).
    for (let y = 0; y < this.graph.size; ++y) {
      const node = this.graph.nodes[y];

      // Close any inactive branches at this point before perform free lane checking
      laneAllocator.closeBranches(y);

      // If node is not visited then it must be a dangling branch (not merged).
      // Therefore we have to traverse the trunk (node.parentNodes[0])
      if (!visited.has(node)) {
        const laneIndex = laneAllocator.getFreeLane(node, this.priorityBranchSections, this.graph.nodes, visited);
        node.x = laneIndex;
        visited.add(node);

        const line = new Line();
        line.add(node.x, node.y);

        // Firstly, traverse all the trunk parent nodes and set their lane index
        let branchBase = node;
        while (true) {
          // Rarely happens, the branch ends with no parent: either a root node of the entire graph is reached;
          // or reaching the end (has no parent node) of a isolated branch that is generated by certain tool.
          // if (branchBase.parentNodes[0] === undefined) break;
          if (branchBase.parents[0] === undefined) break;

          branchBase = this.graph.getNode(branchBase.parents[0]);

          if (visited.has(branchBase)) break;

          // Note, do not change the lane index of the visited branch base! It is set by previous layout pass.
          branchBase.x = laneIndex;
          visited.add(branchBase);
        }

        line.add(laneIndex, branchBase.y);
        line.add(branchBase.x, branchBase.y);
        branchLines.push(line);

        laneAllocator.recordBranch(laneIndex, branchBase.y);
      }

      // If node is visited or the tip of a dangling branch, lane index needs to be set for its other parents, if any.
      for (let i = 1; i < node.parents.length; ++i) {
        let branchBase = this.graph.getNode(node.parents[i]);

        // If the parent is visited and it is a sync merge node, which means its lane index has already been set.
        // Needs special taken care of!
        if (visited.has(branchBase)) {
          const syncLine = new Line();
          syncLine.add(node.x, node.y);

          // If no node is blocking branch base node and current node on the lane of the branch base (lane index must be set since branch base node is visited)
          //
          //     ---- o node
          //    |
          //    |
          //    o
          // branch base
          //
          //  We can simply have 3 vertices to represents the sync line
          let divert = false;
          for (let j = node.y + 1; j < branchBase.y; ++j) {
            // TODO: Since we are checking the nodes that might not be visited yet.
            // Instead of having initial x and y to be -1, we could add extra check to ignore not visited nodes?
            // It will be less performance but more readable code?
            if (this.graph.nodes[j].x === branchBase.x) {
              divert = true;
            }
          }
          if (!divert) {
            syncLine.add(branchBase.x, node.y);
            syncLine.add(branchBase.x, branchBase.y);
          }
          // Otherwise, we have to find an available lane to draw the line, it will need 4 vertices:
          //
          //            node o --
          //                     |
          //                     |
          // branch base  o -----
          //
          else {
            const laneIndex = laneAllocator.getFreeLane(
              this.graph.getNode(node.parents[i]),
              this.priorityBranchSections,
              this.graph.nodes,
              visited
            );

            syncLine.add(laneIndex, node.y);
            syncLine.add(laneIndex, branchBase.y);
            syncLine.add(branchBase.x, branchBase.y);

            // Don't forget to record the branch information in order to close it correctly
            laneAllocator.recordBranch(laneIndex, branchBase.y);
          }

          syncLines.push(syncLine);
        }
        // If parent node is not visited, it must be a normal branch and needs topological traversing
        // to set the lane index
        else {
          const laneIndex = laneAllocator.getFreeLane(
            this.graph.getNode(node.parents[i]),
            this.priorityBranchSections,
            this.graph.nodes,
            visited
          );

          const line = new Line();
          line.add(node.x, node.y);
          line.add(laneIndex, node.y);

          while (true) {
            branchBase.x = laneIndex;
            visited.add(branchBase);

            if (branchBase.parents[0] === undefined) break;

            branchBase = this.graph.getNode(branchBase.parents[0]);

            if (visited.has(branchBase)) break;
          }
          line.add(laneIndex, branchBase.y);
          line.add(branchBase.x, branchBase.y);
          branchLines.push(line);

          laneAllocator.recordBranch(laneIndex, branchBase.y);
        }
      }
    }

    return new LayoutResult(this.graph.nodes, branchLines, syncLines, laneAllocator.activeBranches.length);
  }
}
