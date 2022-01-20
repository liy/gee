import { app } from 'electron';
import { EventMap } from './@types/event';
import { appStore } from './appStore';
import { allBranches } from './commands/branch';
import { rebase } from './commands/rebase';
import { show } from './commands/show';
import { tag } from './commands/tag';
import { Diff } from './Diff';
import EventEmitter from './EventEmitter';
import { BranchView } from './views/branch/BranchView';
import { StageView } from './views/diff/StageView';
import { store as diffStore } from './views/diff/store';
import { status } from './views/diff/subroutines';
import { WorkspaceView } from './views/diff/WorkspaceView';
import { LogView } from './views/log/LogView';
import { RebaseView } from './views/RebaseView';
import { ShowView } from './views/show/ShowView';
import { TagView } from './views/TagView';

class ConsoleManager {
  consoleElement: HTMLElement;

  constructor() {
    this.consoleElement = document.getElementById('console')!;

    const input = document.getElementsByClassName('command-input')[0] as HTMLInputElement;
    input.addEventListener('keydown', async (e: KeyboardEvent) => {
      if (e.key == 'Enter') {
        this.process(input.value.split(' '));
        input.value = '';
      }
    });

    appStore.subscribe({
      'wd.update': () => {
        this.process(['clear']);
      },
    });
  }

  async process(cmds: string[]) {
    switch (cmds[0].toLowerCase()) {
      case 'clear':
        this.consoleElement.innerHTML = '';
        break;
      case 'tag':
        const tagView = document.createElement('div', { is: 'tag-view' }) as TagView;
        tagView.update(await tag(appStore.currentState.workingDirectory));
        this.consoleElement.prepend(tagView);
        break;
      case 'branch':
        const branchView = document.createElement('div', { is: 'branch-view' }) as BranchView;
        branchView.update(await allBranches(appStore.currentState.workingDirectory));
        this.consoleElement.prepend(branchView);
        break;
      case 'rebase':
        const rebaseView = document.createElement('div', { is: 'rebase-view' }) as RebaseView;
        rebaseView.update(await rebase(appStore.currentState.workingDirectory));
        this.consoleElement.prepend(rebaseView);
        break;
      case 'status':
        const workspaceView = document.createElement('div', { is: 'workspace-view' }) as WorkspaceView;
        const stageView = document.createElement('div', { is: 'stage-view' }) as StageView;
        this.consoleElement.prepend(stageView);
        this.consoleElement.prepend(workspaceView);
        diffStore.invoke(status(appStore.currentState.workingDirectory));
        break;
      case 'show':
        const showView = document.createElement('div', { is: 'show-view' }) as ShowView;
        const diffs = Diff.parse(await show(cmds[1], appStore.currentState.workingDirectory));
        this.consoleElement.prepend(showView);
        showView.update(diffs, cmds[1]);
        break;
    }
  }
}

export default new ConsoleManager();
