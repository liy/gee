import { log as logCommand } from '../../commands/log';
import { Subroutine } from 'vasejs';
import { State } from './store';
import { Actions } from './actions';

export function log(workingDirectory: string): Subroutine<Actions, State, any> {
  return async (operate) => {
    const [logs, branches, tags] = await logCommand(workingDirectory);
    operate({
      type: 'update',
      logs,
      tags,
      branches,
    });
  };
}
