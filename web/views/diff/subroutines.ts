import { workspaceChanges, stagedChanges } from '../../commands/changes';
import { Diff } from '../../Diff';
import { Subroutine } from '../../vase';
import { ActionMapping, State } from './store';

export function status(): Subroutine<ActionMapping, State> {
  return async (operate) => {
    const [workspaceDiffText, stagedDiffText] = await Promise.all([workspaceChanges(), stagedChanges()]);

    operate({
      type: 'update',
      workspaceChanges: Diff.parse(workspaceDiffText),
      stagedChanges: Diff.parse(stagedDiffText),
    });
  };
}
