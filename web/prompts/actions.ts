import { Head } from '../commands/log';
import { Diff } from '../Diff';
import { GitState } from '../store';
import { GetReferenceAction } from './Reference';
import { PromptShowAction } from './Show';
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
  head: Head;
  branches: Branch[];
  tags: Tag[];
};

/**
 * Update working directory
 */
export type WorkingDirectoryUpdate = {
  type: 'workingDirectory.update';
  workingDirectory: string;
};

export type SimulationUpdate = {
  type: 'simulation.update';
  simulations: Log[];
};

export type GitStateUpdate = {
  type: 'gitState.update';
  gitState: GitState;
};

export type LogSelection = {
  type: 'log.selection';
  hash: string;
};

export type UpdateStatus = {
  type: 'status.update';
  workspaceChanges: Diff[];
  stagedChanges: Diff[];
};

export type PromptAction = GetReferenceAction | StatusAction | PromptShowAction;

export type PromptActionType = PromptAction['type'];

export type Actions =
  | PromptAction
  | ClearAction
  | LogUpdate
  | WorkingDirectoryUpdate
  | SimulationUpdate
  | GitStateUpdate
  | LogSelection
  | UpdateStatus;
