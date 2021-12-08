import { ViewBase } from './ViewBase';
import { EditorState, EditorView } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark';
import { gutter, GutterMarker, highlightActiveLineGutter, lineNumbers } from '@codemirror/gutter';

import { Diff, DiffParser } from '../DiffParser';
import { stagedChanges } from '../commands/changes';
import { diffExtension } from '../defaultExtension';
import { DiffFile } from '../elements/DiffFile';

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

  update(localDiffText: string, stagedDiffText: string) {
    const localDiffs = new DiffParser(localDiffText).parse();
    for (const diff of localDiffs) {
      const doc = diff.hunks
        .map((hunk) => {
          return localDiffText.substring(hunk.range[0], hunk.range[1]);
        })
        .join('\n');

      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      elm.update(doc, diff);
      this.appendChild(elm);
    }

    const stagedDiffs = new DiffParser(stagedDiffText).parse();
    for (const diff of stagedDiffs) {
      const doc = diff.hunks
        .map((hunk) => {
          return stagedDiffText.substring(hunk.range[0], hunk.range[1]);
        })
        .join('\n');

      const elm = document.createElement('div', { is: 'diff-file' }) as DiffFile;
      elm.update(doc, diff);
      this.appendChild(elm);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('diff-view', DiffView, { extends: 'div' });
