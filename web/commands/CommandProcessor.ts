/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Repository from '../git/Repository';
import Graph from '../graph/Graph';
import AutoComplete, { CandidateData } from '../ui/AutoComplete';
import { checkout } from './checkout';
import { merge } from './merge';

import parse from 'ght';
import CommandInput from '../ui/CommandInput';
import Search from '../Search';
import CommandEvent from '../CommandEvent';

const commands = [merge, checkout];
class CommandProcessor {
  repository!: Repository;

  graph!: Graph;

  undo: (() => void) | undefined;

  private autoComplete!: AutoComplete;

  init(autoComplete: AutoComplete, graph: Graph, repo: Repository) {
    this.autoComplete = autoComplete;
    this.graph = graph;
    this.repository = repo;

    CommandInput.on(CommandEvent.UPDATE, this.process.bind(this));
  }

  async process(text: string) {
    this.tryUndo(); // revert back to original graph and repository state

    for (const command of commands) {
      const [performed, undo] = await command(this.graph, this.repository, this.autoComplete, text);
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
