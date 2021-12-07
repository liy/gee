import { ViewBase } from './ViewBase';
import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark';
import { gutter, GutterMarker, lineNumbers } from '@codemirror/gutter';
import { EditorSelection, SelectionRange } from '@codemirror/state';
import { DiffParser } from '../DiffParser';

const testDiff = `diff --git i/web/commands/status.ts w/web/commands/status.ts
index 027163b..2c44de0 100644
--- i/web/commands/status.ts
+++ w/web/commands/status.ts
@@ -21,10 +21,9 @@ export interface StatusData {
   file: string;
 }
 
-export const status = async () => {
+export const statusOneline = async () => {
   const args = ['git', 'status', '--porcelain'];
   const outputs = await window.command.invoke(args);
-  console.log(outputs);
   const lines = outputs.split('\\n');
   const statusResults = new Array<StatusData>();
   lines.forEach((line) => {
@@ -40,3 +39,7 @@ export const status = async () => {
 
   return statusResults;
 };
+
+export const status = async () => {
+  const args = ['git', 'status', '-vv'];
+};
diff --git i/web/views/index.ts w/web/views/index.ts
index a63a316..ec50a01 100644
--- i/web/views/index.ts
+++ w/web/views/index.ts
@@ -3,3 +3,4 @@ import './TagView';
 import './BranchView';
 import './RebaseView';
 import './StatusView';
+import './DiffView';`;

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

    const view = new EditorView({
      state: EditorState.create({
        doc: testDiff,
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

    view.dispatch(view.state.replaceSelection('?'));

    const parser = new DiffParser(testDiff);
    const r = parser.parse();
    console.log(r);
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('diff-view', DiffView, { extends: 'div' });
