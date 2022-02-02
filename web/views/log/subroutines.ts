import { log as logCommand } from '../../commands/log';
import { Subroutine } from 'vasejs';
import { State } from './store';
import { Actions } from './actions';

export function log(workingDirectory: string): Subroutine<Actions, State> {
  return async (operate) => {
    const [logs, branches, tags, head] = await logCommand(workingDirectory);
    operate({
      type: 'update',
      logs,
      tags,
      branches,
      head,
      simulations: [],
    });
  };
}
