import Node from './Node';

/**
 * Unique identifier for a node
 */
export type Hash = string;

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

  /**
   * Stores all merge nodes of a node in this graph
   */
  // mergeMap: Map<Hash, Array<Node>>;

  merges: Node[];

  constructor() {
    this.map = new Map<Hash, Node>();
    // this.mergeMap = new Map<Hash, Array<Node>>();
    this.nodes = new Array<Node>();
    this.merges = new Array<Node>();
  }

  createNode(hash: Hash, parents: Array<Hash>): Node {
    let node = this.map.get(hash);
    if (!node) {
      node = new Node(hash);
      this.map.set(hash, node);
    }
    node.y = this.nodes.length;
    this.nodes.push(node);

    // Create parent nodes of this node (this node's parents only) if not exist yet.
    node.parentNodes = parents.map((parentHash) => {
      let parentNode = this.map.get(parentHash);
      if (!parentNode) {
        parentNode = new Node(parentHash);
        this.map.set(parentHash, parentNode);
      }
      return parentNode;
    });

    if (node.parentNodes.length > 1) {
      this.merges.push(node);
    }

    // Note that, not every node is a merge node. Therefore it is better to have
    // a separated storage for these information than put it in Node class.
    // Node is a merge node when there are multiple parents.
    // Every parents of this node will have its merges information points back to this node.
    // if (node.parentNodes.length > 1) {
    //   for (const parent of parents) {
    //     // Add all merge nodes for a node.
    //     let mergeNodes = this.mergeMap.get(parent);
    //     if (!mergeNodes) {
    //       mergeNodes = new Array<Node>();
    //       this.mergeMap.set(parent, mergeNodes);
    //     }
    //     mergeNodes.push(node);
    //   }
    // }

    return node;
  }

  appendNode(node: Node, parents: Array<Hash>): void {
    this.map.set(node.hash, node);
    node.y = 0;
    this.nodes.unshift(node);

    // Create parent nodes of this node (this node's parents only) if not exist yet.
    node.parentNodes = parents.map((parentHash) => {
      let parentNode = this.map.get(parentHash);
      if (!parentNode) {
        parentNode = new Node(parentHash);
        this.map.set(parentHash, parentNode);
      }
      return parentNode;
    });

    if (node.parentNodes.length > 1) {
      this.merges.push(node);
    }
  }

  containsNode(hash: Hash): boolean {
    return this.map.has(hash);
  }

  getNode(hash: Hash): Node | undefined {
    return this.map.get(hash);
  }

  /**
   * Retrieve the merge node of its parent node
   * @param hash Parent node hash
   * @param index The index of the merge nodes
   * @returns
   */
  // getMergeNode(hash: Hash, index: number): Node | undefined {
  //   const merges = this.mergeMap.get(hash);
  //   if (merges) {
  //     return merges[index];
  //   }
  //   return undefined;
  // }

  // getMergeNodes(hash: Hash): Array<Node> | undefined {
  //   return this.mergeMap.get(hash);
  // }

  trunkNodes(trunkTip: Hash, foreach?: (node: Node) => void): Array<Node> {
    const nodes = [];
    let node = this.getNode(trunkTip);
    while (node) {
      if (foreach) foreach(node);
      nodes.push(node);
      node = node.parentNodes[0];
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
      node = node.parentNodes[0];
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
}
