import { EditorState, EditorView } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark';
import { gutter, GutterMarker, highlightActiveLineGutter, lineNumbers } from '@codemirror/gutter';

import { Diff } from '../DiffParser';
import { diffExtension } from '../defaultExtension';
import './DiffFile.css';
import { Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { RangeSetBuilder } from '@codemirror/rangeset';

const customTheme = EditorView.theme({
  '&.cm-editor': {
    fontSize: '12px',
  },
  '.lineNo': {
    margin: '0 3px ',
    textAlign: 'right',
    minInlineSize: '3ch',
  },
  '.hunk-heading': {
    fontSize: '11px',
    lineHeight: '2em',
    color: 'grey',
  },
  '.hunk-heading *': {
    color: 'grey',
  },
  '.diff-add': {
    backgroundColor: '#2d3838',
  },
  '.diff-delete': {
    backgroundColor: '#322130',
  },
});

const hunkLineDeco = Decoration.line({
  attributes: {
    class: 'hunk-heading',
  },
});

const addLineDeco = Decoration.line({
  attributes: {
    class: 'diff-add',
  },
});

const deleteLineDeco = Decoration.line({
  attributes: {
    class: 'diff-delete',
  },
});

function decorate(view: EditorView) {
  let builder = new RangeSetBuilder<Decoration>();
  for (let { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      let line = view.state.doc.lineAt(pos);
      if (line.text.startsWith('@@')) {
        builder.add(line.from, line.from, hunkLineDeco);
      } else if (line.text.startsWith('-')) {
        builder.add(line.from, line.from, deleteLineDeco);
      } else if (line.text.startsWith('+')) {
        builder.add(line.from, line.from, addLineDeco);
      }

      pos = line.to + 1;
    }
  }

  return builder.finish();
}

export function DiffLine(): Extension {
  return [
    ViewPlugin.fromClass(
      class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
          this.decorations = decorate(view);
        }

        update(update: ViewUpdate) {
          if (update.docChanged || update.viewportChanged) {
            this.decorations = decorate(update.view);
          }
        }
      },
      {
        decorations(v) {
          return v.decorations;
        },
      }
    ),
  ];
}

export class DiffFile extends HTMLDivElement {
  private heading: HTMLDivElement;

  private editor: EditorView | undefined;

  constructor() {
    super();
    this.collapsed = true;

    this.classList.add('diff-file');

    this.heading = document.createElement('div');
    this.heading.classList.add('heading');
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
          DiffLine(),
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
    this.collapsed = false;
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
