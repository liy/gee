import Node from '../graph/Node';
import Graph from '../graph/Graph';
import { isGit } from './others';
import Repository from '../git/Repository';
import StraightLayout from '../layouts/StraightLayout';
import GraphView from '../ui/GraphView';
import CommitManager from '../ui/CommitManager';
import minimist from 'minimist';
import Simulator from '../Simulator';

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
    return !graph.canReach(repository.head.hash, destination);
  });
  if (sourceHashes.length === 0) return [false];

  const parents = [repository.head.hash, ...sourceHashes];

  const simulatedHash = Simulator.hash();

  const node = new Node(simulatedHash);
  node.parents = parents;
  graph.prependNode(node);
  graph.updatePositions();
  const result = new StraightLayout(graph).process();

  const now = new Date().getTime();
  const commit = {
    hash: simulatedHash,
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

  // Update reference
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ref = repository.getReference(repository.head.hash, repository.head.name)!;
  repository.addReference({ ...ref, hash: simulatedHash });

  // Refresh view
  GraphView.update(result);
  CommitManager.prepend(node, commit);

  return [
    true,
    () => {
      graph.removeNode(node);
      graph.updatePositions();
      repository.removeCommit(simulatedHash);
      repository.removeReference(simulatedHash, repository.head.name);

      const result = new StraightLayout(graph).process();
      GraphView.update(result);
      CommitManager.remove(simulatedHash);

      Simulator.delete(simulatedHash);
    },
  ];
}
