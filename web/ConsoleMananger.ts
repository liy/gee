import { EventMap } from './@types/event';
import { allBranches } from './commands/branch';
import { rebase } from './commands/rebase';
import { tag } from './commands/tag';
import EventEmitter from './EventEmitter';
import { BranchView } from './views/BranchView';
import { StageView } from './views/diff/StageView';
import { store } from './views/diff/store';
import { status } from './views/diff/subroutines';
import { WorkspaceView } from './views/diff/WorkspaceView';
import { RebaseView } from './views/RebaseView';
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
        const workspaceView = document.createElement('div', { is: 'workspace-view' }) as WorkspaceView;
        const stageView = document.createElement('div', { is: 'stage-view' }) as StageView;
        this.consoleElement.prepend(stageView);
        this.consoleElement.prepend(workspaceView);
        store.invoke(status());
        break;
      case 'clear':
        this.consoleElement.innerHTML = '';
    }
  }
}

export default new ConsoleManager();
