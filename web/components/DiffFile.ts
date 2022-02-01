import { EditorState, EditorView } from '@codemirror/basic-setup';
import { gutter, GutterMarker, lineNumbers } from '@codemirror/gutter';
import { javascript } from '@codemirror/lang-javascript';
import { RangeSetBuilder } from '@codemirror/rangeset';
import { Extension } from '@codemirror/state';
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark';
import { BlockInfo, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { diffExtension } from '../defaultExtension';
import { Diff } from '../Diff';
import './DiffFile.css';

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
  const builder = new RangeSetBuilder<Decoration>();
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      const line = view.state.doc.lineAt(pos);
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
};

class DiffLineGutter extends GutterMarker {
  constructor(private lineNo: number, private mapping: Array<string>) {
    super();
  }

  toDOM() {
    return document.createTextNode(this.mapping[this.lineNo - 1]);
  }
}

export class DiffFile extends HTMLDivElement {
  private heading: HTMLDivElement;

  private content: HTMLDivElement;

  private editor: EditorView;

  private oldLineNos: Array<string> = [];

  private newLineNos: Array<string> = [];

  private diff: Diff | undefined;

  constructor() {
    super();

    this.classList.add('diff-file');

    this.heading = document.createElement('div');
    this.heading.classList.add('heading');
    this.appendChild(this.heading);

    this.content = document.createElement('div');
    this.content.classList.add('content');
    this.appendChild(this.content);

    this.toggle = this.toggle.bind(this);

    this.editor = new EditorView({
      state: EditorState.create({
        extensions: [
          DiffLine(),
          gutter({
            class: 'before lineNo',
            lineMarker: (view, lineInfo) => {
              return new DiffLineGutter(view.state.doc.lineAt(lineInfo.from).number, this.oldLineNos);
            },
            domEventHandlers: {
              mousedown: (view, lineInfo) => {
                return this.onLineMouseDown(view, lineInfo);
              },
            },
          }),
          gutter({
            class: 'after lineNo',
            lineMarker: (view, lineInfo) => {
              return new DiffLineGutter(view.state.doc.lineAt(lineInfo.from).number, this.newLineNos);
            },
            domEventHandlers: {
              mousedown: (view, lineInfo) => {
                return this.onLineMouseDown(view, lineInfo);
              },
            },
          }),
          lineNumbers(),
          diffExtension,
          javascript(),
          oneDarkTheme,
          oneDarkHighlightStyle,
          customTheme,
          EditorView.lineWrapping,
          EditorView.editable.of(false),
        ],
      }),
      parent: this.content,
    });

    this.collapsed = true;
  }

  onLineMouseDown(view: EditorView, lineInfo: BlockInfo): boolean {
    if (!this.diff) return false;

    const editorLineNo = view.state.doc.lineAt(lineInfo.from).number;
    this.dispatchEvent(
      new CustomEvent<LineMouseDownData>('line.mousedown', {
        detail: {
          editorLineNo,
          diff: this.diff,
        },
      })
    );
    return true;
  }

  update(diff: Diff, collapse = false) {
    this.diff = diff;

    this.oldLineNos = diff.hunks.map((hunk) => hunk.oldLineNo).flat();
    this.newLineNos = diff.hunks.map((hunk) => hunk.newLineNo).flat();

    this.editor.dispatch({
      changes: {
        from: 0,
        to: this.editor.state.doc.length,
        insert: diff.content,
      },
    });

    this.heading.textContent = diff.heading.from + ' ' + diff.heading.to;

    this.collapsed = collapse;
  }

  set collapsed(collapse: boolean) {
    if (this.editor) {
      if (collapse) {
        this.content.style.display = 'none';
      } else {
        this.content.style.display = 'block';
      }
    }
  }

  get collapsed(): boolean {
    return this.content.style.display === 'none';
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  connectedCallback() {
    this.heading.addEventListener('click', this.toggle);
  }

  disconnectedCallback() {
    this.heading.removeEventListener('click', this.toggle);
  }
}

customElements.define('diff-file', DiffFile, { extends: 'div' });
