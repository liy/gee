import { gutter, GutterMarker } from '@codemirror/gutter';
import { javascript } from '@codemirror/lang-javascript';
import { RangeSetBuilder } from '@codemirror/rangeset';
import { EditorState, Extension } from '@codemirror/state';
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark';
import { BlockInfo, Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import React, { FC, useEffect, useRef } from 'react';
import { diffExtension } from '../defaultExtension';
import { Diff } from '../Diff';

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

export type Props = {
  diff: Diff;
};

export const DiffFile: FC<Props> = ({ diff }) => {
  const ref = useRef(null);
  const onLineMouseDown = (view: EditorView, lineInfo: BlockInfo): boolean => {
    if (!diff) return false;

    const editorLineNo = view.state.doc.lineAt(lineInfo.from).number;
    // this.dispatchEvent(
    //   new CustomEvent<LineMouseDownData>('line.mousedown', {
    //     detail: {
    //       editorLineNo,
    //       diff: this.diff,
    //     },
    //   })
    // );
    return true;
  };

  const oldLineNos = diff.hunks.map((hunk) => hunk.oldLineNo).flat();
  const newLineNos = diff.hunks.map((hunk) => hunk.newLineNo).flat();

  useEffect(() => {
    if (!ref.current) return;

    new EditorView({
      state: EditorState.create({
        doc: diff.content,
        extensions: [
          DiffLine(),
          gutter({
            class: 'before lineNo',
            lineMarker: (view, lineInfo) => {
              return new DiffLineGutter(view.state.doc.lineAt(lineInfo.from).number, oldLineNos);
            },
            domEventHandlers: {
              mousedown: (view, lineInfo) => {
                return onLineMouseDown(view, lineInfo);
              },
            },
          }),
          gutter({
            class: 'after lineNo',
            lineMarker: (view, lineInfo) => {
              return new DiffLineGutter(view.state.doc.lineAt(lineInfo.from).number, newLineNos);
            },
            domEventHandlers: {
              mousedown: (view, lineInfo) => {
                return onLineMouseDown(view, lineInfo);
              },
            },
          }),
          // lineNumbers(),
          diffExtension,
          javascript(),
          oneDarkTheme,
          oneDarkHighlightStyle,
          customTheme,
          EditorView.lineWrapping,
          EditorView.editable.of(false),
        ],
      }),
      parent: ref.current,
    });
  }, [ref.current]);

  return <div className="diff-file" ref={ref}></div>;
};
