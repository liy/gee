import { createDebounce } from './utils';
import minimist from 'minimist';
import Graph from './graph/Graph';
import Repository from './git/Repository';
import CommitManager from './ui/CommitManager';
import GraphStore from './graph/GraphStore';
import StraightLayout from './layouts/StraightLayout';
import { merge } from './commands';
import GraphView from './ui/GraphView';

class Commander {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  cmdInput = document.querySelector('.command-input')!;

  debounce = createDebounce(300);

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
    await this.debounce();

    const value = (e.target as HTMLInputElement).value;
    const args = minimist(value.split(' '));

    if (args._[0] === 'git' && args._[1] === 'merge') {
      const sourceBranchNames = args._.slice(2);

      const sourceHashes = this.repo.getReferences(sourceBranchNames).map((ref) => ref.hash);

      const draft = this.graph.clone();

      merge(draft, this.repo.head.hash, sourceHashes);
      const layout = new StraightLayout(draft);
      const result = layout.process();
      GraphView.update(result);
      CommitManager.init(result, this.repo);
    } else {
      const layout = new StraightLayout(this.graph);
      const result = layout.process();
      GraphView.update(result);
      CommitManager.init(result, this.repo);
    }
  }
}

export default new Commander();
