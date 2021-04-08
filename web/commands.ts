import Node from './graph/Node';
import Graph from './graph/Graph';
import { fakeHash } from './utils';
import { Hash } from './@types/git';
import Repository from './git/Repository';
import StraightLayout from './layouts/StraightLayout';
import GraphView from './ui/GraphView';
import CommitManager from './ui/CommitManager';

export function merge(graph: Graph, repository: Repository, targetHash: Hash, sourceHashes: Array<Hash>): () => void {
  const parents = [targetHash, ...sourceHashes];

  const hash = fakeHash();
  const node = new Node(hash);
  node.parents = parents;
  graph.prependNode(node);
  graph.refreshPosition();

  const result = new StraightLayout(graph).process();
  GraphView.update(result);

  const now = new Date();
  const commit = {
    hash,
    summary: 'Merge',
    date: now.getTime(),
    time: now.getTime(),
    body: '',
    author: {
      name: 'test',
      email: 'test@test',
    },
    committer: {
      name: 'test',
      email: 'test@test',
    },
    parents,
  };
  repository.prependCommit(commit);
  CommitManager.prepend(node, commit);

  return () => {
    graph.removeNode(node);
    graph.refreshPosition();
    repository.removeCommit(hash);

    const result = new StraightLayout(graph).process();
    GraphView.update(result);
    CommitManager.remove(hash);
  };
}
