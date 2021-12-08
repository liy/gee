import { EditorState, EditorView } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark';
import { gutter, GutterMarker, highlightActiveLineGutter, lineNumbers } from '@codemirror/gutter';

import { Diff } from '../DiffParser';
import { diffExtension } from '../defaultExtension';

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

export class DiffFile extends HTMLDivElement {
  private heading: HTMLDivElement;

  private editor: EditorView | undefined;

  constructor() {
    super();
    this.collapsed = true;
    this.heading = document.createElement('div');
    this.appendChild(this.heading);

    this.toggle = this.toggle.bind(this);
  }

  update(doc: string, diff: Diff) {
    if (this.editor) {
      this.editor.dom.remove();
    }

    const lineNo = diff.hunks
      .map((hunk) => {
        return hunk.lineNo;
      })
      .flat();

    this.editor = new EditorView({
      state: EditorState.create({
        doc: doc,
        extensions: [
          gutter({
            class: 'before lineNo',
            lineMarker(view, lineInfo) {
              return new (class extends GutterMarker {
                toDOM() {
                  const line = view.state.doc.lineAt(lineInfo.from);
                  return document.createTextNode(lineNo[line.number - 1][0]);
                }
              })();
            },
          }),
          gutter({
            class: 'after lineNo',
            lineMarker(view, lineInfo) {
              return new (class extends GutterMarker {
                toDOM() {
                  const line = view.state.doc.lineAt(lineInfo.from);
                  return document.createTextNode(lineNo[line.number - 1][1]);
                }
              })();
            },
          }),
          diffExtension,
          javascript(),
          oneDarkTheme,
          oneDarkHighlightStyle,
          customTheme,
          EditorView.lineWrapping,
          EditorView.editable.of(false),
        ],
      }),
    });

    this.heading.textContent = diff.header.from + ' ' + diff.header.to;
    this.appendChild(this.editor.dom);
    this.collapsed = true;
  }

  set collapsed(collapse: boolean) {
    if (this.editor) {
      if (collapse) {
        this.editor.dom.remove();
      } else {
        this.appendChild(this.editor.dom);
      }
    }
  }

  get collapsed(): boolean {
    return this.editor?.dom.parentNode !== this;
  }

  toggle() {
    this.collapsed = !this.collapsed;
    console.log(this.collapsed);
  }

  connectedCallback() {
    this.heading.addEventListener('click', this.toggle);
  }

  disconnectedCallback() {
    this.heading.removeEventListener('click', this.toggle);
  }
}

customElements.define('diff-file', DiffFile, { extends: 'div' });
