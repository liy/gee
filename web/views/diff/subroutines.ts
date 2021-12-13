import { localChanges, stagedChanges } from '../../commands/changes';
import { DiffParser } from '../../DiffParser';
import { Subroutine } from '../../vase';
import { ActionMapping, State } from './store';

export function status(): Subroutine<ActionMapping, State> {
  return async (operate) => {
    const [localDiffText, stagedDiffText] = await Promise.all([localChanges(), stagedChanges()]);

    operate({
      type: 'update',
      localDiffText,
      localDiffs: new DiffParser(localDiffText).parse(),
      stagedDiffText,
      stagedDiffs: new DiffParser(stagedDiffText).parse(),
    });
  };
}
