import { EventMap } from './@types/event';
import { stagePatch } from './commands/apply';
import { allBranches } from './commands/branch';
import { workspaceChanges } from './commands/changes';
import { rebase } from './commands/rebase';
import { tag } from './commands/tag';
import { Diff } from './Diff';
import EventEmitter from './EventEmitter';
import { createPatch } from './patch';
import { BranchView } from './views/BranchView';
import { DiffView } from './views/diff/DiffView';
import { store } from './views/diff/store';
import { status } from './views/diff/subroutines';
import { RebaseView } from './views/RebaseView';
import { TagView } from './views/TagView';

const t = `diff --git a/web/ConsoleMananger.ts b/web/ConsoleMananger.ts
index 02ec875..e3dc2b3 100644
--- a/web/ConsoleMananger.ts
+++ b/web/ConsoleMananger.ts
@@ -1,7 +1,9 @@
 import { EventMap } from './@types/event';
 import { allBranches } from './commands/branch';
+import { workspaceChanges } from './commands/changes';
 import { rebase } from './commands/rebase';
 import { tag } from './commands/tag';
+import { Diff } from './Diff';
 import EventEmitter from './EventEmitter';
 import { BranchView } from './views/BranchView';
 import { DiffView } from './views/diff/DiffView';`;
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
        const diffView = document.createElement('div', { is: 'diff-view' }) as DiffView;
        this.consoleElement.prepend(diffView);
        store.invoke(status());
        break;
      case 'clear':
        this.consoleElement.innerHTML = '';
    }
  }
}

export default new ConsoleManager();
