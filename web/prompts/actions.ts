import { GetReferenceAction } from './Reference';
import { StatusAction } from './Status';

export type ClearAction = {
  type: 'command.clear';
};

export type PromptAction = GetReferenceAction | StatusAction;

export type PromptActionType = PromptAction['type'];
