/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Repository from '../git/Repository';
import Graph from '../graph/Graph';
import AutoComplete, { CandidateData } from '../ui/AutoComplete';
import { checkout } from './checkout';
import { merge } from './merge';

import parse from 'ght';
import CommandInput from '../ui/CommandInput';
import Search from '../Search';

const commands = [merge, checkout];
class CommandProcessor {
  undo: (() => void) | undefined;

  private autoComplete!: AutoComplete;

  init(autoComplete: AutoComplete) {
    this.autoComplete = autoComplete;
  }

  async process(graph: Graph, repo: Repository, text: string) {
    for (const command of commands) {
      const [performed, undo] = await command(graph, repo, this.autoComplete, text);
      if (performed) {
        this.undo = undo;
        break;
      } else {
        const str = CommandInput.input.value.substring(0, CommandInput.input.selectionStart!)!;

        const results = Search.perform(str);

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
        this.autoComplete.update(entries);

        const target = (await this.autoComplete.selection).value as string;
        this.autoComplete.clear();
      }
    }
  }

  tryUndo() {
    if (this.undo) {
      this.undo();
      this.undo = undefined;
    }
  }
}

export default new CommandProcessor();
