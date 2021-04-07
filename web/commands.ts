import Node from './graph/Node';
import Graph from './graph/Graph';
import { fakeHash } from './utils';
import { Hash } from './@types/git';

export function merge(graph: Graph, targetHash: Hash, sourceHashes: Array<Hash>): Node {
  const node = new Node(fakeHash());
  node.parents = [targetHash, ...sourceHashes];
  graph.prependNode(node);
  graph.refreshPosition();

  return node;
}
