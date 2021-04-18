import minimist from 'minimist';
import Repository from '../git/Repository';
import Graph from '../graph/Graph';
import { checkout } from './checkout';
import { merge } from './merge';

const commands = [merge, checkout];
class CommandProcessor {
  undo: (() => void) | undefined;

  process(graph: Graph, repo: Repository, args: minimist.ParsedArgs) {
    for (const command of commands) {
      const [performed, undo] = command(graph, repo, args);
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
