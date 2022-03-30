import { Diff } from '../Diff';
import { GetReferenceAction } from './Reference';
import { StatusAction } from './Status';

export type ClearAction = {
  type: 'command.clear';
};

export type LogChangeAction = {
  type: 'log.changes';
  workspaceChanges: Diff[];
  stagedChanges: Diff[];
};

export type PromptAction = GetReferenceAction | StatusAction | LogChangeAction;

export type PromptActionType = PromptAction['type'];
