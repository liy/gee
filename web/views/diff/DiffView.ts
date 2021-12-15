import { DiffFile } from '../../components/DiffFile';
import { createLinePatch } from '../../patch';
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
    for (const diff of workspace.changes) {
      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      elm.update(diff);
      elm.addEventListener('line.mousedown', (e) => {
        const patchText = createLinePatch(e.detail.editorLineNo, e.detail.hunkIndex, e.detail.diff);
        console.log(patchText);
      });
      this.appendChild(elm);
    }

    for (const diff of stage.changes) {
      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      elm.update(diff);
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
