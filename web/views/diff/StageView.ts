import { applyPatch } from '../../commands/apply';
import { DiffFile } from '../../components/DiffFile';
import { Diff } from '../../Diff';
import { createPatch } from '../../Patch';
import { ViewBase } from '../ViewBase';
import { store } from './store';
import { status } from './subroutines';

export class StageView extends ViewBase {
  private cleanup: (() => void) | undefined;

  constructor() {
    super();

    this.title = 'stage';
    this.heading.textContent = this.title;
  }

  update(diffs: Diff[]) {
    const editors = Array.from(this.content.children) as Array<DiffFile>;
    let i = 0;
    for (; i < editors.length; ++i) {
      if (diffs[i]) {
        editors[i].update(diffs[i]);
      } else {
        editors[i].remove();
      }
    }

    for (; i < diffs.length; ++i) {
      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      elm.update(diffs[i]);
      elm.addEventListener('line.mousedown', async (e) => {
        const patchText = createPatch([e.detail.editorLineNo], e.detail.diff, true);
        if (patchText) {
          await applyPatch(patchText);
          store.invoke(status());
        }
      });
      this.content.appendChild(elm);
    }
  }

  connectedCallback() {
    this.cleanup = store.on({
      update: (_, state) => this.update(state.stage.changes),
    });
  }

  disconnectedCallback() {
    this.cleanup?.();
  }
}

customElements.define('stage-view', StageView, { extends: 'div' });
