import { createDebounce } from '../utils';
import minimist from 'minimist';
import Graph from '../graph/Graph';
import Repository from '../git/Repository';
import GraphStore from '../graph/GraphStore';
import CommandProcessor from '../commands/CommandProcessor';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
class CommandInput {
  element: HTMLElement;
  suggestions: HTMLDivElement;
  input: HTMLInputElement;

  repository!: Repository;

  graph!: Graph;

  stateDebounce = createDebounce(300);

  constructor() {
    this.element = document.getElementById('command-aside')!;
    this.element.innerHTML = `
      <input id="command-input"></input>
      <div id="suggestions">
      </div>
    `;

    this.input = this.element.querySelector('#command-input')!;
    this.suggestions = this.element.querySelector('#suggestions')!;

    this.input.addEventListener('input', this.onInput.bind(this));
  }

  init(repo: Repository): void {
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
