import { createDebounce } from './utils';
import minimist from 'minimist';
import Graph from './graph/Graph';
import Repository from './git/Repository';
import GraphStore from './graph/GraphStore';
import { merge } from './commands';

export type ViewRefresh = () => void;

class Commander {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  cmdInput = document.querySelector('#command-input')!;

  stateDebounce = createDebounce(300);

  graph!: Graph;

  repo!: Repository;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  undo: (() => void) | undefined;

  refresh: (() => void) | undefined;

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
    if (this.undo) {
      this.undo();
    }

    const value = (e.target as HTMLInputElement).value;
    const args = minimist(value.split(' '));

    if (args._[0] === 'git' && args._[1] === 'merge') {
      const sourceBranchNames = args._.slice(2);
      if (sourceBranchNames) {
        const sourceHashes = this.repo.getReferencesByNames(sourceBranchNames).map((ref) => ref.hash);
        this.undo = merge(this.graph, this.repo, this.repo.head.hash, sourceHashes);
      }
    }
  }
}

export default new Commander();
