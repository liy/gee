import { stagePatch, unstagePatch } from '../../commands/apply';
import { DiffFile } from '../../components/DiffFile';
import { createPatch } from '../../patch';
import { ViewBase } from '../ViewBase';
import { State, store } from './store';

export class DiffView extends ViewBase {
  mapping: Array<[number, number]>;

  private cleanup: (() => void) | undefined;

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
      elm.addEventListener('line.mousedown', async (e) => {
        const patchText = createPatch([e.detail.editorLineNo], e.detail.diff);
        if (patchText) {
          const result = await stagePatch(patchText);
          console.log(result);
        }
      });
      this.appendChild(elm);
    }

    for (const diff of stage.changes) {
      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      elm.update(diff);
      elm.addEventListener('line.mousedown', async (e) => {
        const patchText = createPatch([e.detail.editorLineNo], e.detail.diff);
        if (patchText) {
          const result = await unstagePatch(patchText);
          console.log(result);
        }
      });
      this.appendChild(elm);
    }
  }

  connectedCallback() {
    this.cleanup = store.on({
      update: (_, state) => this.update(state),
    });
  }

  disconnectedCallback() {
    this.cleanup?.();
  }
}

customElements.define('diff-view', DiffView, { extends: 'div' });
