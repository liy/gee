import { ViewBase } from './ViewBase';
import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark';
import { gutter, GutterMarker, lineNumbers } from '@codemirror/gutter';
import { EditorSelection, SelectionRange } from '@codemirror/state';
import { DiffParser } from '../diff';
import { localChanges, stagedChanges } from '../commands/changes';

const customTheme = EditorView.theme({
  '&.cm-editor': {
    fontSize: '12px',
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

    localChanges().then((result) => {
      console.log(result);
    });
  }

  update(workspaceDiff: string, indexDiff: string) {
    const workspaceView = new EditorView({
      state: EditorState.create({
        doc: workspaceDiff,
        extensions: [
          gutter({
            class: 'diff-lineNo',
            lineMarker(view, line) {
              return new (class extends GutterMarker {
                toDOM() {
                  const l = view.state.doc.lineAt(line.from);
                  return document.createTextNode(line.bottom + '');
                }
              })();
            },
          }),
          basicSetup,
          javascript(),
          oneDarkTheme,
          oneDarkHighlightStyle,
          customTheme,
          EditorView.lineWrapping,
          EditorView.editable.of(false),
        ],
      }),
      parent: this,
    });
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('diff-view', DiffView, { extends: 'div' });
