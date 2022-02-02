import { appStore } from './appStore';
import { allBranches } from './commands/branch';
import { rebase } from './commands/rebase';
import { revParse } from './commands/revParse';
import { show } from './commands/show';
import { tag } from './commands/tag';
import { Diff } from './Diff';
import { BranchView } from './views/branch/BranchView';
import { CommitView } from './views/commit/CommitView';
import { StageView } from './views/diff/StageView';
import { store as diffStore } from './views/diff/store';
import { status } from './views/diff/subroutines';
import { WorkspaceView } from './views/diff/WorkspaceView';
import { store as logStore } from './views/log/store';
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

    logStore.subscribe({
      selectLog: async (action, newState, oldState) => {
        if (!newState.selectedLog) return;

        // Click same commit will not append view
        if (newState.selectedLog.hash === oldState.selectedLog?.hash) {
          return;
        }

        const { branches, tags, bodyText, diffText } = await show(
          newState.selectedLog.hash,
          appStore.currentState.workingDirectory
        );
        const showView = document.createElement('div', { is: 'show-view' }) as ShowView;
        this.consoleElement.prepend(showView);
        const diffs = Diff.parse(diffText);
        showView.update(diffs, newState.selectedLog, bodyText, branches, tags);
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
        diffStore.invoke(status(appStore.currentState.workingDirectory));
        if (
          diffStore.currentState.stage.changes.length === 0 &&
          diffStore.currentState.workspace.changes.length === 0
        ) {
          return;
        }
        const workspaceView = document.createElement('div', { is: 'workspace-view' }) as WorkspaceView;
        workspaceView.update(diffStore.currentState.workspace.changes);
        const stageView = document.createElement('div', { is: 'stage-view' }) as StageView;
        stageView.update(diffStore.currentState.stage.changes);
        this.consoleElement.prepend(workspaceView);
        this.consoleElement.prepend(stageView);

        break;
      case 'show':
        const hash = await revParse(cmds[1], appStore.currentState.workingDirectory);

        const index = logStore.currentState.map.get(hash);
        if (index !== undefined) {
          const log = logStore.currentState.logs[index];
          const showView = document.createElement('div', { is: 'show-view' }) as ShowView;
          const { branches, tags, bodyText, diffText } = await show(hash, appStore.currentState.workingDirectory);
          this.consoleElement.prepend(showView);
          const diffs = Diff.parse(diffText);
          showView.update(diffs, log, bodyText, branches, tags);
        }
        break;
      case 'commit':
        const workspaceView2 = document.createElement('div', { is: 'workspace-view' }) as WorkspaceView;
        const stageView2 = document.createElement('div', { is: 'stage-view' }) as StageView;
        this.consoleElement.prepend(workspaceView2);
        this.consoleElement.prepend(stageView2);
        diffStore.invoke(status(appStore.currentState.workingDirectory));

        const commitView = document.createElement('div', { is: 'commit-view' }) as CommitView;
        this.consoleElement.prepend(commitView);

        break;
      case 'push':
        break;
    }
  }
}

export default new ConsoleManager();
