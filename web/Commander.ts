import { createDebounce } from './utils';
import minimist from 'minimist';
import Graph from './graph/Graph';
import Repository from './git/Repository';
import GraphStore from './graph/GraphStore';
import CommandProcessor from './commands/CommandProcessor';

export type ViewRefresh = () => void;

class Commander {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  cmdInput = document.querySelector('#command-input')!;

  stateDebounce = createDebounce(300);

  graph!: Graph;

  repo!: Repository;

  constructor() {
    this.cmdInput.addEventListener('input', this.onInput.bind(this));
  }

  init(repo: Repository): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.graph = GraphStore.getGraph(repo.id)!;
    this.repo = repo;
  }

  async onInput(e: Event) {
    await this.stateDebounce();

    // revert back to original graph and repository state
    CommandProcessor.tryUndo();

    const value = (e.target as HTMLInputElement).value;
    const args = minimist(value.split(' '));

    CommandProcessor.process(this.graph, this.repo, args);
  }
}

export default new Commander();
