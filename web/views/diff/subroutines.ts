import { workspaceChanges, stagedChanges } from '../../commands/changes';
import { DiffParser } from '../../DiffParser';
import { Subroutine } from '../../vase';
import { ActionMapping, State } from './store';

export function status(): Subroutine<ActionMapping, State> {
  return async (operate1) => {
    const [test, stagedDiffText] = await Promise.all([workspaceChanges(), stagedChanges()]);
    console.log(test);

    operate1({
      type: 'update',
      workspaceChanges: new DiffParser(test).parse(),
      stagedChanges: new DiffParser(stagedDiffText).parse(),
    });
  };
}
