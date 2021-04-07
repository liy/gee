import { Hash } from '../@types/git';
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
      this.nodes = this.nodes.splice(index, 1);
    }
  }

  refreshPosition(): void {
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
