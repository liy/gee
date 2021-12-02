import { CommitTag } from '../elements/Tag';
import { TagData } from '../commands/tag';
import { ViewBase } from './ViewBase';
import { Todo } from '../commands/rebase';

export class RebaseView extends ViewBase {
  testData!: TagData[];

  constructor() {
    super();

    this.title = 'rebase';
    this.heading.textContent = this.title;
    this.content.classList.add('content-flex');
  }

  update(todos: Array<Todo>) {
    for (const todo of todos) {
      console.log(todo);
      const row = document.createElement('div');
      row.textContent = JSON.stringify(todo);
      this.appendChild(row);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('rebase-view', RebaseView, { extends: 'div' });
