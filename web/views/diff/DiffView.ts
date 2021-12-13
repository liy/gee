import { EditorView } from '@codemirror/basic-setup';
import { DiffFile } from '../../components/DiffFile';
import { ViewBase } from '../ViewBase';
import { State, store } from './store';

const customTheme = EditorView.theme({
  '&.cm-editor': {
    fontSize: '12px',
  },
  '.lineNo': {
    margin: '0 3px ',
    textAlign: 'right',
    minInlineSize: '3ch',
  },
});

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
      const doc = diff.hunks
        .map((hunk) => {
          return workspace.diffText.substring(hunk.range[0], hunk.range[1]);
        })
        .join('\n');

      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      elm.update(doc, diff);
      this.appendChild(elm);
    }

    for (const diff of stage.diffs) {
      const doc = diff.hunks
        .map((hunk) => {
          return workspace.diffText.substring(hunk.range[0], hunk.range[1]);
        })
        .join('\n');

      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      elm.update(doc, diff);
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
