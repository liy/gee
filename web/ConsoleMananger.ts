import { appStore } from './appStore';
import { allBranches } from './commands/branch';
import { push } from './commands/push';
import { rebase } from './commands/rebase';
import { revParse } from './commands/revParse';
import { show } from './commands/show';
import { simple } from './commands/simple';
import { tag } from './commands/tag';
import { Diff } from './Diff';
import { BranchView } from './views/branch/BranchView';
import { CommitView } from './views/commit/CommitView';
import { store as diffStore } from './views/diff/store';
import { status } from './views/diff/subroutines';
import { IndexView } from './views/diff/IndexView';
import { store as logStore } from './views/log/store';
import { PushView } from './views/push/PushView';
import { RebaseView } from './views/RebaseView';
import { ShowView } from './views/show/ShowView';
import { SimpleView } from './views/simple/SimpleView';
import { TagView } from './views/TagView';

class ConsoleManager {
  consoleElement: HTMLElement;

  constructor() {
    this.consoleElement = document.getElementById('console')!;

    const input = document.getElementsByClassName('command-input')[0] as HTMLInputElement;
    input.addEventListener('keydown', async (e: KeyboardEvent) => {
      if (e.key == 'Enter') {
        const cmd = input.value.trim().toLowerCase();
        if (cmd) {
          if (!(await this.intercept(cmd))) {
            this.process(input.value.split(' '));
          }
        }
        input.value = '';
      }
    });

    appStore.subscribe({
      'wd.update': (action, state) => {
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

    window.command.onCommand((cmds) => {
      console.log('!??!');
      console.log(cmds);
      this.process(cmds);
    });
  }

  async intercept(cmd: string) {
    if (cmd.toLowerCase().startsWith('git')) {
      const simpleView = document.createElement('div', { is: 'simple-view' }) as SimpleView;
      simpleView.update(await simple(cmd, appStore.currentState.workingDirectory), cmd);
      this.consoleElement.prepend(simpleView);

      return true;
    }

    return false;
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

        const workspaceView = document.createElement('div', { is: 'index-view' }) as IndexView;
        workspaceView.update(diffStore.currentState.workspace.changes, 'workspace');
        const stageView = document.createElement('div', { is: 'index-view' }) as IndexView;
        stageView.update(diffStore.currentState.stage.changes, 'stage');
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
        const commitWorkspaceView = document.createElement('div', { is: 'index-view' }) as IndexView;
        commitWorkspaceView.update([], 'workspace');
        this.consoleElement.prepend(commitWorkspaceView);
        const commitStageView = document.createElement('div', { is: 'index-view' }) as IndexView;
        commitStageView.update([], 'stage');
        this.consoleElement.prepend(commitStageView);
        diffStore.invoke(status(appStore.currentState.workingDirectory));

        const commitView = document.createElement('div', { is: 'commit-view' }) as CommitView;
        this.consoleElement.prepend(commitView);
        break;
      case 'push':
        const pushView = document.createElement('div', { is: 'push-view' }) as PushView;
        pushView.update(await push(appStore.currentState.workingDirectory));
        this.consoleElement.prepend(pushView);
        break;
    }
  }
}

export default new ConsoleManager();
