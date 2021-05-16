import Graph from '../graph/Graph';
import Repository from '../git/Repository';
import Search from '../Search';
import AutoComplete, { CandidateData } from '../ui/AutoComplete';
import CommandInput from '../ui/CommandInput';
import templates, { CommandOption } from './templates';
import parse from 'ght';

function getOption(str: string): CommandOption | null {
  for (const option of templates.checkout.options) {
    if (option.name === str) {
      return option;
    }
  }

  return null;
}

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

  let target = context.slice(2).join(' ');

  if (target === '') autoComplete.clear();

  const results = Search.perform(target);

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

  target = (await autoComplete.selection).value as string;
  autoComplete.clear();

  const chunks = CommandInput.input.value.split(' ');
  chunks.pop();
  CommandInput.input.value = chunks.join(' ') + ' ' + target;

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
