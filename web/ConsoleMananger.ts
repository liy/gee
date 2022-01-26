import { appStore } from './appStore';
import { allBranches } from './commands/branch';
import { rebase } from './commands/rebase';
import { show } from './commands/show';
import { tag } from './commands/tag';
import { Diff } from './Diff';
import { BranchView } from './views/branch/BranchView';
import { StageView } from './views/diff/StageView';
import { store as diffStore } from './views/diff/store';
import { store as logStore } from './views/log/store';
import { status } from './views/diff/subroutines';
import { WorkspaceView } from './views/diff/WorkspaceView';
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
      'wd.update': (action, state) => {
        this.process(['clear']);
      },
    });

    // When log commit is selected
    document.addEventListener('commit.clicked', async (e) => {
      const index = logStore.currentState.map.get(e.detail);
      if (index !== undefined) {
        const log = logStore.currentState.logs[index];
        const [logBody, diffText] = await show(e.detail, appStore.currentState.workingDirectory);
        const showView = document.createElement('div', { is: 'show-view' }) as ShowView;
        this.consoleElement.prepend(showView);
        const diffs = Diff.parse(diffText);
        showView.update(diffs, log, logBody);
      }
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
        const hash = cmds[1];
        const index = logStore.currentState.map.get(hash);
        if (index !== undefined) {
          const log = logStore.currentState.logs[index];
          const showView = document.createElement('div', { is: 'show-view' }) as ShowView;
          const [logBody, diffText] = await show(hash, appStore.currentState.workingDirectory);
          this.consoleElement.prepend(showView);
          const diffs = Diff.parse(diffText);
          showView.update(diffs, log, logBody);
        }

        break;
    }
  }
}

export default new ConsoleManager();
