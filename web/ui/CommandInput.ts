import { createDebounce } from '../utils';
import Graph from '../graph/Graph';
import Repository from '../git/Repository';
import GraphStore from '../graph/GraphStore';
import CommandProcessor from '../commands/CommandProcessor';
import AutoComplete from './AutoComplete';
import EventEmitter from '../EventEmitter';
import CommandEvent from '../CommandEvent';

/* eslint-disable @typescript-eslint/no-non-null-assertion */
class CommandInput extends EventEmitter {
  element: HTMLElement;
  input: HTMLInputElement;
  autoComplete: AutoComplete;

  repository!: Repository;

  graph!: Graph;

  stateDebounce = createDebounce(300);

  constructor() {
    super();
    this.element = document.getElementById('command-aside')!;
    this.element.innerHTML = `<input id="command-input"></input>`;

    this.input = this.element.querySelector('#command-input')!;
    this.input.addEventListener('input', this.onInput.bind(this));

    this.autoComplete = new AutoComplete();
    this.element.appendChild(this.autoComplete.element);
  }

  init(repo: Repository): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.graph = GraphStore.getGraph(repo.id)!;
    this.repository = repo;

    CommandProcessor.init(this.autoComplete, this.graph, this.repository);
    this.autoComplete.init();
  }

  async onInput(): Promise<any> {
    await this.stateDebounce();
    this.emit(CommandEvent.UPDATE, this.input.value);
  }

  /**
   * Used by auto complete to insert text
   * @param text string
   */
  insertText(text: string) {
    const [start, end] = [this.input.selectionStart, this.input.selectionEnd];
    if (start && end) {
      this.input.setRangeText(text, start, end, 'select');
    }
    this.emit(CommandEvent.UPDATE, this.input.value);
  }
}

export default new CommandInput();
