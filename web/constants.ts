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
export enum CommandProcess {
  // When a line is read
  ReadLine = 'commandProcess.readline',
  // When git process errors out
  Error = 'commandProcess.error',
  // When git process closes
  Close = 'commandProcess.close',
}

export type CallbackID = number;

export interface CommandCallback {
  onReadLine?: (line: string, id: CallbackID) => void;
  onError?: (err: Error, id: CallbackID) => void;
  onClose?: (id: CallbackID) => void;
}
