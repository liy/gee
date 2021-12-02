import { ViewBase } from './ViewBase';
import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark';

export class StatusView extends ViewBase {
  view: any;
  constructor() {
    super();

    this.title = 'status';
    this.heading.textContent = this.title;
    this.content.classList.add('content-flex');

    const customTheme = EditorView.theme({
      '&.cm-editor': {
        fontSize: '12px',
      },
    });

    this.view = new EditorView({
      state: EditorState.create({
        extensions: [
          basicSetup,
          javascript(),
          oneDarkTheme,
          oneDarkHighlightStyle,
          customTheme,
          EditorView.lineWrapping,
        ],
      }),
      parent: this,
    });
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('status-view', StatusView, { extends: 'div' });
