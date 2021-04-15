import Node from '../graph/Node';
import Graph from '../graph/Graph';
import { isGit } from './others';
import { fakeHash } from '../utils';
import Repository from '../git/Repository';
import StraightLayout from '../layouts/StraightLayout';
import GraphView from '../ui/GraphView';
import CommitManager from '../ui/CommitManager';
import minimist from 'minimist';
import { Hash } from '../@types/git';

function isReachable(start: Hash, destination: Hash, graph: Graph): boolean {
  if (start === destination) return true;

  const startNode = graph.getNode(start);
  const destinationNode = graph.getNode(destination);
  if (startNode.y > destinationNode.y) return false;

  // Start node will be visited
  const visited = new Set<Hash>(start);
  // Initialize queue with start nodes other parents
  const queue = new Array<Hash>();
  const node = graph.getNode(start);
  for (let i = 1; i < node.parents.length; ++i) {
    queue.push(node.parents[i]);
  }

  let next = startNode.parents[0];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (visited.has(next) || next === undefined) {
      if (queue.length === 0) return false;
      next = queue.pop()!;
    }

    if (next === destination) return true;

    const node = graph.getNode(next);
    for (let i = 1; i < node.parents.length; ++i) {
      queue.push(node.parents[i]);
    }
    visited.add(next);

    next = node.parents[0];
  }
}

export function merge(
  graph: Graph,
  repository: Repository,
  args: minimist.ParsedArgs
): [performed: boolean, undo?: () => void] {
  if (!isGit(args) || args._[1] !== 'merge') return [false];

  const sourceBranchNames = args._.slice(2);
  let sourceHashes = repository.getReferencesByNames(sourceBranchNames).map((ref) => ref.hash);
  // Filter out any source branch that are reachable from current head, head is up to date with them.
  // Only need to merge non-reachable branches
  sourceHashes = sourceHashes.filter((destination) => {
    return !isReachable(repository.head.hash, destination, graph);
  });
  if (sourceHashes.length === 0) return [false];

  const parents = [repository.head.hash, ...sourceHashes];

  const hash = fakeHash();
  const node = new Node(hash);
  node.parents = parents;
  graph.prependNode(node);
  graph.updatePositions();
  const result = new StraightLayout(graph).process();

  const now = new Date().getTime();
  const commit = {
    hash,
    summary: 'Merge',
    date: now,
    time: now,
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

  // // Update reference
  // const ref = repository.getReference(repository.head.hash, )
  // repository.addReference({...}, true);

  // Refresh view
  GraphView.update(result);
  CommitManager.prepend(node, commit);

  return [
    true,
    () => {
      graph.removeNode(node);
      graph.updatePositions();
      repository.removeCommit(hash);
      repository.removeReference(hash, repository.head);

      const result = new StraightLayout(graph).process();
      GraphView.update(result);
      CommitManager.remove(hash);
    },
  ];
}
