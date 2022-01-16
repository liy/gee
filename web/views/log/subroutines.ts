import { log as logCommand } from '../../commands/log';
import { Subroutine } from '../../vase';
import { ActionMapping, State } from './store';

export function log(workingDirectory: string): Subroutine<ActionMapping, State> {
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
