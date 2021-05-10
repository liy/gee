import Repository from '../git/Repository';
import Graph from '../graph/Graph';
import AutoComplete from '../ui/AutoComplete';
import { checkout } from './checkout';
import { merge } from './merge';

import parse from 'ght';

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
