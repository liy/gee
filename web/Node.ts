import { Hash } from './Graph';

export interface NodePod {
  x: number;
  y: number;
  hash: Hash;
  parents: Array<{
    x: number;
    y: number;
    hash: Hash;
  }>;
}

/**
 * Stores node layout inform
 */
export default class Node {
  /**
   * The identifier for the node, which is usually mapped to the git hash id.
   */
  hash: Hash;

  /**
   * Think of it as column lane of the graph.
   */
  x: number;

  /**
   * Think of it as the index of the nodes, or the y value for layout the node.
   */
  y: number;

  /**
   * Parents of the node
   */
  parentNodes: Array<Node>;

  /**
   *
   * @param hash The hash identifier for the node.
   */
  constructor(hash: Hash) {
    this.hash = hash;
    this.y = -1;
    this.x = -1;
    this.parentNodes = [];
  }

  pod(): NodePod {
    return {
      x: this.x,
      y: this.y,
      hash: this.hash,
      parents: this.parentNodes.map((node) => ({ x: node.x, y: node.y, hash: node.hash })),
    };
  }

  toString(): string {
    return `${this.hash.substr(0, 7)} colIndex: ${this.x} index: ${this.y} parents: ${this.parentNodes.map((node) =>
      node.hash.substr(0, 7)
    )}\n`;
  }
}
