import Graph from '../graph/Graph';
import { isGit } from './others';
import Repository from '../git/Repository';
import minimist from 'minimist';
import Search from '../Search';
import AutoComplete, { CandidateData } from '../ui/AutoComplete';

export function checkout(
  graph: Graph,
  repository: Repository,
  autoComplete: AutoComplete,
  args: minimist.ParsedArgs
): [performed: boolean, undo?: () => void] {
  console.log(args);
  if (!isGit(args) || args._[1] !== 'checkout') return [false];
  // if (!args._[2]) return [false];

  const target = args._.slice(2).join(' ');
  console.log(target);

  const results = Search.perform(target);
  console.log(results);

  const entries = new Array<CandidateData>();
  for (let i = 0; i < results[0].length; ++i) {
    const result = results[0][i];
    entries.push({
      name: result.item.shorthand,
      description: result.item.name,
      value: result.item.name,
    });

    if (entries.length > 10) {
      break;
    }
  }

  for (let i = 0; i < results[1].length; ++i) {
    if (entries.length > 10) {
      break;
    }

    const result = results[1][i];
    entries.push({
      name: result.item.summary,
      description: result.item.body,
      value: result.item.hash,
    });
  }
  autoComplete.update(entries);

  if (target) {
    // const refs = repository.referenceSearch.search(target);
    // if (refs.length === 1) {
    //   // checkout to a ref
    //   console.log('ref', refs[0]);
    // } else {
    //   const commits = repository.commitSearch.search(target);
    //   if (commits.length === 1) {
    //     // checkout to a sha, dangling
    //     console.log('sha', commits[0]);
    //   }
    // }

    return [
      true,
      () => {
        // Simulator.stop(id);
      },
    ];
  }
  return [false];
}
