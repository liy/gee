import { appStore } from '../../appStore';
import { applyPatch } from '../../commands/apply';
import { DiffFile } from '../../components/DiffFile';
import { Diff } from '../../Diff';
import { createPatch } from '../../Patch';
import { ViewBase } from '../ViewBase';
import { store } from './store';
import { status } from './subroutines';

export class WorkspaceView extends ViewBase {
  private cleanup: (() => void) | undefined;

  constructor() {
    super();

    this.title = 'workspace';
    this.heading.textContent = this.title;
  }

  update(diffs: Diff[]) {
    this.heading.textContent = diffs.length === 0 ? 'no changes in workspace' : 'workspace changes';

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
        const patchText = createPatch([e.detail.editorLineNo], e.detail.diff);
        if (patchText) {
          await applyPatch(patchText, appStore.currentState.workingDirectory);
          store.invoke(status(appStore.currentState.workingDirectory));
        }
      });
      this.content.appendChild(elm);
    }
  }

  connectedCallback() {
    this.cleanup = store.subscribe({
      update: (_, state) => {
        this.update(state.workspace.changes);
      },
    });
  }

  disconnectedCallback() {
    this.cleanup?.();
  }
}

customElements.define('workspace-view', WorkspaceView, { extends: 'div' });
