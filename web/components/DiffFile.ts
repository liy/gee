import { EditorState, EditorView } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark';
import { gutter, GutterMarker, highlightActiveLineGutter, lineNumbers } from '@codemirror/gutter';

import { Diff, Hunk } from '../DiffParser';
import { diffExtension } from '../defaultExtension';
import './DiffFile.css';
import { BlockInfo, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { Compartment, Extension } from '@codemirror/state';
import { RangeSetBuilder } from '@codemirror/rangeset';

const customTheme = EditorView.theme({
  '&.cm-editor': {
    fontSize: '12px',
  },
  '.lineNo': {
    textAlign: 'right',
    // compensate 4px padding
    minInlineSize: 'calc(3ch + 4px)',
  },
  '.lineNo .cm-gutterElement': {
    paddingRight: '4px',
    cursor: 'pointer',
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

export type LineMouseDownData = {
  editorLineNo: number;
  diff: Diff;
  hunkIndex: number;
  beforeLineNo: string;
  afterLineNo: string;
  lineText: string;
};

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

  update(diff: Diff) {
    const doc = diff.hunks.map((hunk) => hunk.text).join('\n');

    if (this.editor) {
      this.editor.dom.remove();
    }

    const beforeLineNo = diff.hunks
      .map((hunk) => {
        return hunk.beforeLineNo;
      })
      .flat();

    const afterLineNo = diff.hunks
      .map((hunk) => {
        return hunk.afterLineNo;
      })
      .flat();

    const onLineMouseDown = (view: EditorView, lineInfo: BlockInfo): boolean => {
      const hunkIndex = diff.hunks.findIndex((hunk) => {
        const lineStart = lineInfo.from + diff.header.text.length + 1;
        console.log(hunk.range);
        return hunk.range[0] <= lineStart && lineStart <= hunk.range[1];
      });

      const editorLineNo = view.state.doc.lineAt(lineInfo.from).number;
      const lineText = view.state.doc.lineAt(lineInfo.from).text;
      this.dispatchEvent(
        new CustomEvent<LineMouseDownData>('line.mousedown', {
          detail: {
            editorLineNo,
            beforeLineNo: beforeLineNo[editorLineNo],
            afterLineNo: afterLineNo[editorLineNo],
            hunkIndex,
            diff,
            lineText,
          },
        })
      );
      return true;
    };

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
                  return document.createTextNode(beforeLineNo[line.number - 1]);
                }
              })();
            },
            domEventHandlers: {
              mousedown: onLineMouseDown,
            },
          }),
          gutter({
            class: 'after lineNo',
            lineMarker(view, lineInfo) {
              return new (class extends GutterMarker {
                toDOM() {
                  const line = view.state.doc.lineAt(lineInfo.from);
                  return document.createTextNode(afterLineNo[line.number - 1]);
                }
              })();
            },
            domEventHandlers: {
              mousedown: onLineMouseDown,
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
