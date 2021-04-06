import Node from './graph/Node';
import Graph, { Hash } from './graph/Graph';
import { fakeHash } from './utils';

export function merge(graph: Graph, targetHash: Hash, sourceHashes: Array<Hash>): Node {
  const node = new Node(fakeHash());
  node.parents = [targetHash, ...sourceHashes];
  graph.prependNode(node);
  graph.refreshPosition();

  return node;
}
