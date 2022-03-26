import { BranchAction } from './Branch';
import { TagAction } from './Tag';
import { StatusAction } from './Status';

export type ClearAction = {
  type: 'command.clear';
};

export type PromptAction = BranchAction | TagAction | StatusAction;

export type PromptActionType = PromptAction['type'];
