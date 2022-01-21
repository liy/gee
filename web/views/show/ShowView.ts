import { DiffFile } from '../../components/DiffFile';
import { Diff } from '../../Diff';
import { ViewBase } from '../ViewBase';

export class ShowView extends ViewBase {
  private cleanup: (() => void) | undefined;

  constructor() {
    super();

    this.heading.textContent = this.title;
  }

  update(diffs: Diff[], hash: string) {
    this.updateHeadingText(`show ${hash}`);
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
      elm.update(diffs[i], true);
      this.content.appendChild(elm);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {
    this.cleanup?.();
  }
}

customElements.define('show-view', ShowView, { extends: 'div' });
