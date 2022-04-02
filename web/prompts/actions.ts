import { Diff } from '../Diff';
import { GetReferenceAction } from './Reference';
import { StatusAction } from './Status';

export type ClearAction = {
  type: 'command.clear';
};

/**
 * Manual update logs, e.g., when external git command changed commit logs it will trigger file changes
 * and fire this action; or fired when application first time load
 */
export type LogUpdate = {
  type: 'log.update';
  logs: Log[];
};

/**
 * Update working directory
 */
export type WorkingDirectoryUpdate = {
  type: 'workingDirectory.update';
  workingDirectory: string;
};

export type PromptAction = GetReferenceAction | StatusAction;

export type PromptActionType = PromptAction['type'];

export type Actions = PromptAction | ClearAction | LogUpdate | WorkingDirectoryUpdate;
