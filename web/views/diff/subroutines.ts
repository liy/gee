import { workspaceChanges, stagedChanges } from '../../commands/changes';
import { DiffParser } from '../../DiffParser';
import { Subroutine } from '../../vase';
import { ActionMapping, State } from './store';

export function status(): Subroutine<ActionMapping, State> {
  return async (operate) => {
    const [workspaceDiffText, stagedDiffText] = await Promise.all([workspaceChanges(), stagedChanges()]);

    operate({
      type: 'update',
      workspaceChanges: new DiffParser(workspaceDiffText).parse(),
      stagedChanges: new DiffParser(stagedDiffText).parse(),
    });
  };
}
