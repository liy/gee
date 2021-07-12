import Graph from '../graph/Graph';
import Repository from '../git/Repository';
import Search from '../Search';
import AutoComplete, { CandidateData } from '../ui/AutoComplete';
import CommandInput from '../ui/CommandInput';
import parse from 'ght';

export async function checkout(
  graph: Graph,
  repository: Repository,
  autoComplete: AutoComplete,
  text: string
): Promise<[performed: boolean, undo?: () => void]> {
  // console.log(args);
  const { context } = parse(text);
  if (context[0].toLowerCase() !== 'git' && context[1].toLowerCase() !== 'checkout') return [false];

  // TODO: get the word of the current input selection and try to auto complete it with command templates.
  // We need to know which command option or command param cursor is at. Extract the full word and try to
  // auto complete the command params or options.

  const target = context.slice(2).join(' ');

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
