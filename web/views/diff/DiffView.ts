import { EditorView } from '@codemirror/basic-setup';
import { doc } from 'prettier';
import { DiffFile } from '../../components/DiffFile';
import { ViewBase } from '../ViewBase';
import { State, store } from './store';

export class DiffView extends ViewBase {
  mapping: Array<[number, number]>;

  constructor() {
    super();

    this.mapping = new Array();

    this.title = 'diff';
    this.heading.textContent = this.title;
    this.content.classList.add('content-flex');
  }

  update(state: State) {
    const { workspace, stage } = state;
    for (const diff of workspace.diffs) {
      const doc = diff.hunks.map((hunk) => hunk.text).join('\n');

      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      elm.update(doc, diff);
      elm.addEventListener('line.mousedown', (e) => {
        // console.log(diff.header.from, e.detail);
      });
      this.appendChild(elm);
    }

    for (const diff of stage.diffs) {
      const doc = diff.hunks.map((hunk) => hunk.text).join('\n');

      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      elm.update(doc, diff);
      // elm.addEventListener('line.mousedown', this.onLineMouseDown);
      this.appendChild(elm);
    }
  }

  connectedCallback() {
    this.update(store.currentState);
    store.on({
      update: (_, state) => this.update(state),
    });
  }

  disconnectedCallback() {}
}

customElements.define('diff-view', DiffView, { extends: 'div' });
