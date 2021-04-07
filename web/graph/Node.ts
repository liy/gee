import { Hash } from '../@types/git';

export interface NodePod {
  x: number;
  y: number;
  hash: Hash;
  parents: Array<Hash>;
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
   * Parent nodes hash
   */
  parents: Array<Hash>;

  /**
   *
   * @param hash The hash identifier for the node.
   */
  constructor(hash: Hash) {
    this.hash = hash;
    this.y = -1;
    this.x = -1;
    this.parents = [];
  }

  pod(): NodePod {
    return {
      x: this.x,
      y: this.y,
      hash: this.hash,
      parents: this.parents,
    };
  }

  toString(): string {
    return `${this.hash.substr(0, 7)} colIndex: ${this.x} index: ${this.y} parents: ${this.parents.map((hash) =>
      hash.substr(0, 7)
    )}\n`;
  }

  clone(): Node {
    const n = new Node(this.hash);
    n.x = this.x;
    n.y = this.y;
    n.parents = [...this.parents];
    return n;
  }
}
