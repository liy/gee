import { EventMap } from './@types/event';
import { allBranches } from './commands/branch';
import { rebase } from './commands/rebase';
import { status, statusOneline } from './commands/status';
import { tag } from './commands/tag';
import EventEmitter from './EventEmitter';
import { BranchView } from './views/BranchView';
import { DiffView } from './views/DiffView';
import { RebaseView } from './views/RebaseView';
import { StatusView } from './views/StatusView';

import { TagView } from './views/TagView';

class ConsoleManager extends EventEmitter<EventMap> {
  consoleElement: HTMLElement;

  constructor() {
    super();

    this.consoleElement = document.getElementById('console')!;

    const input = document.getElementsByClassName('command-input')[0] as HTMLInputElement;
    input.addEventListener('keydown', async (e: KeyboardEvent) => {
      if (e.key == 'Enter') {
        this.process(input.value);
        input.value = '';
      }
    });

    const diffView = document.createElement('div', { is: 'diff-view' }) as DiffView;
    this.consoleElement.prepend(diffView);
  }

  async process(cmd: string) {
    switch (cmd.toLowerCase()) {
      case 'tag':
        const tagView = document.createElement('div', { is: 'tag-view' }) as TagView;
        tagView.update(await tag());
        this.consoleElement.prepend(tagView);
        break;
      case 'branch':
        const branchView = document.createElement('div', { is: 'branch-view' }) as BranchView;
        branchView.update(await allBranches());
        this.consoleElement.prepend(branchView);
        break;
      case 'rebase':
        const rebaseView = document.createElement('div', { is: 'rebase-view' }) as RebaseView;
        rebaseView.update(await rebase());
        this.consoleElement.prepend(rebaseView);
        break;
      case 'status':
        const statusView = document.createElement('div', { is: 'status-view' }) as StatusView;
        statusView.update(await statusOneline());
        this.consoleElement.prepend(statusView);
        break;
      case 'clear':
        this.consoleElement.innerHTML = '';
    }
  }
}

export default new ConsoleManager();
