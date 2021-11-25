import { EventMap } from './@types/event';
import { allBranches } from './commands/branch';
import { tag } from './commands/tag';
import EventEmitter from './EventEmitter';
import { BranchView } from './views/BranchView';

import { TagView } from './views/TagView';

class ConsoleManager extends EventEmitter<EventMap> {
  consoleElement: HTMLElement;

  constructor() {
    super();

    this.consoleElement = document.getElementById('console')!;

    const input = document.getElementById('command-input') as HTMLInputElement;
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
        const tagView = document.createElement('tag-view') as TagView;
        tagView.update(await tag());
        this.consoleElement.appendChild(tagView);
        break;
      case 'branch':
        const branchView = document.createElement('branch-view') as BranchView;
        branchView.update(await allBranches());
        this.consoleElement.appendChild(branchView);
        break;
    }
  }
}

export default new ConsoleManager();
