import { ViewBase } from './ViewBase';
import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { javascript } from '@codemirror/lang-javascript';
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark';
import { StatusData } from '../commands/status';
import template from './StatusView.html';
import './StatusView.css';
import { createElement } from '../utils';
import { EditorStateConfig } from '@codemirror/state';

const customTheme = EditorView.theme({
  '&.cm-editor': {
    fontSize: '12px',
  },
});

const decoder = new TextDecoder();

export class StatusElement extends HTMLDivElement {
  private statusCode: HTMLElement;
  private statusFile: HTMLElement;

  private data: StatusData | undefined;

  private editor: EditorView;

  private config: EditorStateConfig;

  constructor() {
    super();

    this.className = 'status';
    this.innerHTML = template;

    this.statusCode = this.querySelector('.status-code')!;
    this.statusFile = this.querySelector('.status-file')!;

    this.config = {
      extensions: [
        basicSetup,
        javascript(),
        oneDarkTheme,
        oneDarkHighlightStyle,
        customTheme,
        EditorView.lineWrapping,
        EditorView.editable.of(false),
      ],
    };
    this.editor = new EditorView({
      state: EditorState.create(this.config),
    });

    this.onClick = this.onClick.bind(this);
  }

  update(data: StatusData) {
    this.data = data;
    this.statusCode.textContent = data.code.toString();
    this.statusFile.textContent = data.file.toString();
  }

  async onClick(e: MouseEvent) {
    if (this.data) {
      const container = this.querySelector('.status-editor')!;
      if (container.childNodes.length === 1) {
        container.removeChild(container.childNodes[0]);
      } else {
        const buffer = await window.api.readFile(this.data.file);
        this.config.doc = decoder.decode(buffer);
        this.editor.setState(EditorState.create(this.config));
        container.appendChild(this.editor.dom);
      }
    }
  }

  connectedCallback() {
    const lineElm = this.querySelector('.status-line') as HTMLElement;
    if (lineElm) {
      lineElm.addEventListener('click', this.onClick);
    }
  }

  disconnectedCallback() {
    const lineElm = this.querySelector('.status-line') as HTMLElement;
    if (lineElm) {
      lineElm.removeEventListener('click', this.onClick);
    }
  }
}
customElements.define('status-line', StatusElement, { extends: 'div' });

export class StatusView extends ViewBase {
  constructor() {
    super();

    this.title = 'status';
    this.heading.textContent = this.title;
    this.content.classList.add('content-flex');
  }

  update(data: Array<StatusData>) {
    for (const entry of data) {
      const elm = createElement<StatusElement>('div', 'status-line');
      elm.update(entry);
      this.appendChild(elm);
    }
  }

  connectedCallback() {}

  disconnectedCallback() {}
}

customElements.define('status-view', StatusView, { extends: 'div' });
