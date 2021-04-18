import Graph from '../graph/Graph';
import { isGit } from './others';
import Repository from '../git/Repository';
import minimist from 'minimist';

export function checkout(
  graph: Graph,
  repository: Repository,
  args: minimist.ParsedArgs
): [performed: boolean, undo?: () => void] {
  if (!isGit(args) || args._[1] !== 'checkout') return [false];

  const target = args._[2].toString().trim();

  if (target) {
    const refs = repository.referenceSearch.search(target);
    if (refs.length === 1) {
      // checkout to a ref
      console.log('ref', refs[0]);
    } else {
      const commits = repository.commitSearch.search(target);
      if (commits.length === 1) {
        // checkout to a sha, dangling
        console.log('sha', commits[0]);
      }
    }
  }

  return [
    true,
    () => {
      // Simulator.stop(id);
    },
  ];
}
