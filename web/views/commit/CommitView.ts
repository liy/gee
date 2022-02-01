import { DiffFile } from '../../components/DiffFile';
import { Diff } from '../../Diff';
import { ViewBase } from '../ViewBase';
import template from './CommitView.html';
import './CommitView.css';
import { commit } from '../../commands/commit';
import { appStore } from '../../appStore';
import { store as diffStore } from '../diff/store';
import { status } from '../diff/subroutines';
import { store as logStore } from '../log/store';
import { log } from '../log/subroutines';

export class CommitView extends ViewBase {
  private editorContainer: HTMLDivElement;

  private input: HTMLDivElement;

  constructor() {
    super();

    this.classList.add('committing');

    this.title = 'commit message';
    this.heading.textContent = this.title;
    this.content.innerHTML = template;

    this.editorContainer = this.content.querySelector('.editor-container')!;
    this.input = this.content.querySelector('.commit-message-input')!;
  }

  update(diffs: Diff[]) {
    const editors = Array.from(this.editorContainer.children) as Array<DiffFile>;
    let i = 0;
    for (; i < editors.length; ++i) {
      editors[i].update(diffs[i]);
    }
  }

  connectedCallback() {
    this.input.addEventListener('keydown', async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        if (this.input.innerText.trim()) {
          try {
            await commit(this.input.innerText, appStore.currentState.workingDirectory);
            diffStore.invoke(status(appStore.currentState.workingDirectory));
            // remove this view
            this.remove();

            // update log
            logStore.invoke(log(appStore.currentState.workingDirectory));
          } catch (err) {
            console.log(err);
          }
        }
      }
    });

    // avoid accidental new line
    setTimeout(() => this.input.focus());
  }

  disconnectedCallback() {}
}

customElements.define('commit-view', CommitView, { extends: 'div' });
