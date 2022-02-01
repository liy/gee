import { workspaceChanges, stagedChanges } from '../../commands/changes';
import { Diff } from '../../Diff';
import { Operate, Subroutine } from 'vasejs';
import { State } from './store';
import { Actions } from './actions';

export function status(workingDirectory: string) {
  return async (operate: Operate<Actions>) => {
    const [workspaceDiffText, stagedDiffText] = await Promise.all([
      workspaceChanges(workingDirectory),
      stagedChanges(workingDirectory),
    ]);

    operate({
      type: 'update',
      workspaceChanges: Diff.parse(workspaceDiffText),
      stagedChanges: Diff.parse(stagedDiffText),
    });
  };
}
