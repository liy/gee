import { EditorState, EditorView } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark';
import { gutter, GutterMarker, highlightActiveLineGutter, lineNumbers } from '@codemirror/gutter';

import { Diff } from '../DiffParser';
import { diffExtension } from '../defaultExtension';
import './DiffFile.css';
import { Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { Extension, Facet } from '@codemirror/state';
import { RangeSetBuilder } from '@codemirror/rangeset';
import { gray, grey } from 'chalk';

const customTheme = EditorView.theme({
  '&.cm-editor': {
    fontSize: '12px',
  },
  '.lineNo': {
    margin: '0 3px ',
    textAlign: 'right',
    minInlineSize: '3ch',
  },
  '.cm-line.hunk-heading': {
    backgroundColor: '#333333',
    lineHeight: '3em',
    fontSize: '11px',
  },
});

const hunkHeadingHeight = Facet.define<number, string>({
  combine(values) {
    return values.length ? Math.min(...values) + 'px' : '32px';
  },
});

export function hunkHeading(options: { hunkHeight: number }): Extension {
  return [options.hunkHeight ? [] : hunkHeadingHeight.of(options.hunkHeight), showHunkHeading];
}

const hunkLine = Decoration.line({
  attributes: {
    class: 'hunk-heading',
  },
});

function decorate(view: EditorView) {
  const height = view.state.facet(hunkHeadingHeight);
  let builder = new RangeSetBuilder<Decoration>();
  for (let { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      let line = view.state.doc.lineAt(pos);
      if (line.text.startsWith('@@')) {
        builder.add(line.from, line.from, hunkLine);
      }
      pos = line.to + 1;
    }
  }

  return builder.finish();
}

const showHunkHeading = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = decorate(view);
    }

    update(update: ViewUpdate) {
      console.log('update');
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
);

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
          hunkHeading({ hunkHeight: 40 }),
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
