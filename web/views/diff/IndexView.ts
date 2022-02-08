import { appStore } from '../../appStore';
import { applyPatch } from '../../commands/apply';
import { DiffFile } from '../../components/DiffFile';
import { Diff } from '../../Diff';
import { createPatch } from '../../Patch';
import { ViewBase } from '../ViewBase';
import { store } from './store';
import { status } from './subroutines';

type IndexType = 'workspace' | 'stage';

export class IndexView extends ViewBase {
  private unsubscribe: (() => void) | undefined;

  private collapsedState: Map<string, boolean> = new Map();

  private indexType!: IndexType;

  constructor() {
    super();

    this.title = 'workspace';
    this.heading.textContent = this.title;
  }

  update(diffs: Diff[], indexType: IndexType) {
    this.indexType = indexType;
    if (this.indexType === 'workspace') {
      this.heading.textContent = diffs.length === 0 ? 'no changes in workspace' : 'workspace changes';
    } else {
      this.heading.textContent = diffs.length === 0 ? 'no changes in stage' : 'staged changes';
    }

    for (const diff of diffs) {
      const key = diff.heading.from;
      if (!this.collapsedState.has(key)) {
        this.collapsedState.set(key, true);
      }
    }

    const editors = Array.from(this.content.children) as Array<DiffFile>;
    let i = 0;
    for (; i < editors.length; ++i) {
      if (diffs[i]) {
        const collapsed = this.collapsedState.get(diffs[i].heading.from);
        editors[i].update(diffs[i], collapsed);
      } else {
        const key = editors[i].diff?.heading.from;
        if (key) this.collapsedState.delete(key);
        editors[i].remove();
      }
    }

    for (; i < diffs.length; ++i) {
      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      const collapsed = this.collapsedState.get(diffs[i].heading.from);
      elm.update(diffs[i], collapsed);
      elm.addEventListener('line.mousedown', async (e) => {
        const patchText = createPatch([e.detail.editorLineNo], e.detail.diff, this.indexType === 'stage');
        if (patchText) {
          await applyPatch(patchText, appStore.currentState.workingDirectory);
          store.invoke(status(appStore.currentState.workingDirectory));
        }
      });
      elm.addEventListener('diff.toggle', (e) => {
        this.collapsedState.set(e.detail.key, e.detail.collapsed);
      });
      this.content.appendChild(elm);
    }
  }

  connectedCallback() {
    this.unsubscribe = store.subscribe({
      update: (_, state) => {
        this.update(this.changes, this.indexType);
      },
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  get changes() {
    return store.currentState[this.indexType].changes;
  }
}

customElements.define('index-view', IndexView, { extends: 'div' });
