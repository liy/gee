import { ViewBase } from '../ViewBase';
import { LogEntry, store } from './store';
import { log } from './subroutines';

export class LogView extends ViewBase {
  private cleanup: (() => void) | undefined;

  constructor() {
    super();

    this.title = 'log';
    this.heading.textContent = this.title;
  }

  private update(logs: LogEntry[]) {
    console.log(logs);
  }

  connectedCallback() {
    this.cleanup = store.on({
      update: (_, state) => this.update(state.logs),
    });
  }

  disconnectedCallback() {
    this.cleanup?.();
  }
}

customElements.define('log-view', LogView, { extends: 'div' });
