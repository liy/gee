export const COMMIT_SELECTED = 'commit.selected';
export const REPOSITORY_OPEN = 'repository.open';
// Submit a command and receive git process events
export const COMMAND_SUBMIT = 'command.submit';
// Invoke a command and return a promise
export const COMMAND_INVOKE = 'command.invoke';
// Kill the command process from renderer process
export const COMMAND_KILL = 'command.kill';

/**
 * Events from git processwhich is spawned.
 */
export enum GitProcess {
  // When a line is read
  ReadLine = 'git.process.readline',
  // When git process errors out
  Error = 'git.process.error',
  // When git process closes
  Close = 'git.process.close',
  // When git process exits
  Exit = 'git.process.exit',
}

export type OutputRouteId = number;

export interface CommandCallback {
  onReadLine?: (line: string, id: OutputRouteId) => void;
  onError?: (err: Error, id: OutputRouteId) => void;
  // /**
  //  * If onExit returns true, command callback routing will be removed, so the onClose will not be called
  //  */
  // onExit?: (id: OutputRouteId) => boolean | void;
  onClose?: (id: OutputRouteId) => void;
}
