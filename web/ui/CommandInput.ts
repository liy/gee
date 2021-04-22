import { createDebounce } from '../utils';
import minimist from 'minimist';
import Graph from '../graph/Graph';
import Repository from '../git/Repository';
import GraphStore from '../graph/GraphStore';
import CommandProcessor from '../commands/CommandProcessor';
import AutoComplete from './AutoComplete';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
class CommandInput {
  element: HTMLElement;
  input: HTMLInputElement;
  autoComplete: AutoComplete;

  repository!: Repository;

  graph!: Graph;

  stateDebounce = createDebounce(300);

  constructor() {
    this.element = document.getElementById('command-aside')!;
    this.element.innerHTML = `<input id="command-input"></input>`;

    this.input = this.element.querySelector('#command-input')!;
    this.input.addEventListener('input', this.onInput.bind(this));

    this.autoComplete = new AutoComplete();
    this.element.appendChild(this.autoComplete.element);
  }

  init(repo: Repository): void {
    CommandProcessor.init(this.autoComplete);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.graph = GraphStore.getGraph(repo.id)!;
    this.repository = repo;
  }

  async onInput(e: Event): Promise<any> {
    await this.stateDebounce();

    // revert back to original graph and repository state
    CommandProcessor.tryUndo();

    const value = (e.target as HTMLInputElement).value;
    const args = minimist(value.split(' '));

    CommandProcessor.process(this.graph, this.repository, args);
  }
}

export default new CommandInput();
