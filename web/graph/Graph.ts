import { Hash } from '../@types/window';
import Node from './Node';

/**
 * Stores and manage all the nodes.
 */
export default class Graph {
  /**
   * For query node using git commit hash value
   */
  map: Map<Hash, Node>;

  /**
   * Contains all the nodes in topological and temporal order
   */
  nodes: Node[];

  constructor() {
    this.map = new Map<Hash, Node>();
    this.nodes = new Array<Node>();
  }

  createNode(hash: Hash, parents: Array<Hash>): Node {
    let node = this.map.get(hash);
    if (!node) {
      node = new Node(hash);
      this.map.set(hash, node);
    }
    node.y = this.nodes.length;
    this.nodes.push(node);

    node.parents = parents;

    return node;
  }

  prependNode(node: Node): void {
    this.map.set(node.hash, node);
    this.nodes.unshift(node);
  }

  appendNode(node: Node): void {
    this.map.set(node.hash, node);
    this.nodes.push(node);
  }

  removeNode(node: Node): void {
    this.map.delete(node.hash);
    const index = this.nodes.indexOf(node);
    if (index !== -1) {
      this.nodes.splice(index, 1);
    }
  }

  /**
   * Update Y position index of all nodes
   */
  updatePositions(): void {
    for (let i = 0; i < this.nodes.length; ++i) {
      this.nodes[i].y = i;
    }
  }

  containsNode(hash: Hash): boolean {
    return this.map.has(hash);
  }

  getNode(hash: Hash): Node {
    const node = this.map.get(hash);
    if (!node) {
      throw new Error(`Node does not exist in graph: ${hash}`);
    }

    return node;
  }

  hasNode(hash: Hash): boolean {
    return this.map.has(hash);
  }

  trunkNodes(trunkTip: Hash, foreach?: (node: Node) => void): Array<Node> {
    const nodes = [];
    let node = this.getNode(trunkTip);
    while (node) {
      if (foreach) foreach(node);
      nodes.push(node);
      node = this.getNode(node.parents[0]);
    }
    return nodes;
  }

  /**
   * Traverse a node graph to find all the nodes in a branch.
   * @param branchTip Tip of a branch, a Node hash.
   * @param trunk The set of hash of nodes act as trunk, if the branch reaches the trunk. Traversing stops.
   * @param foreach Callback for every branch node.
   * @returns A list of nodes in the branch
   */
  branchNodes(branchTip: Hash, trunk: Set<Hash>, foreach?: (node: Node) => void): Array<Node> {
    const nodes = [];
    let node = this.getNode(branchTip);
    while (node && !trunk.has(node.hash)) {
      if (foreach) foreach(node);
      nodes.push(node);
      node = this.getNode(node.parents[0]);
    }
    return nodes;
  }

  reset(): void {
    for (let i = 0; i < this.nodes.length; ++i) {
      const node = this.nodes[i];
      node.x = -1;
      node.y = i;
    }
  }

  clear(): void {
    this.map = new Map<Hash, Node>();
    this.nodes = new Array<Node>();
  }

  getParentNodes(node: Node): Array<Node> {
    return node.parents.map((hash) => this.getNode(hash));
  }

  /**
   * Traverse the ancestors of start nodes, and decide whether destination node can be reached.
   * Useful when deciding one branch is up to date with another branch.
   * @param start Start node hash
   * @param destination Destination node has
   * @returns True if destination node is reachable via ancestor traversing
   */
  canReach(start: Hash, destination: Hash): boolean {
    if (start === destination) return true;

    const startNode = this.getNode(start);
    const destinationNode = this.getNode(destination);
    if (startNode.y > destinationNode.y) return false;

    // Start node will be visited
    const visited = new Set<Hash>(start);
    // Initialize queue with start nodes other parents
    const queue = new Array<Hash>();
    const node = this.getNode(start);
    for (let i = 1; i < node.parents.length; ++i) {
      queue.push(node.parents[i]);
    }

    let next = startNode.parents[0];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (visited.has(next) || next === undefined) {
        if (queue.length === 0) return false;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        next = queue.pop()!;
      }

      if (next === destination) return true;

      const node = this.getNode(next);
      for (let i = 1; i < node.parents.length; ++i) {
        queue.push(node.parents[i]);
      }
      visited.add(next);

      next = node.parents[0];
    }
  }

  get size(): number {
    return this.nodes.length;
  }

  clone(): Graph {
    const graph = new Graph();
    for (const node of this.nodes) {
      graph.appendNode(node.clone());
    }
    return graph;
  }
}
