import { Subroutine } from '../../vase';
import { ActionMapping, State } from './store';
import { log as logCommand } from '../../commands/log';

export function log(): Subroutine<ActionMapping, State> {
  return async (operate) => {
    operate({
      type: 'update',
      logs: await logCommand(),
    });
  };
}