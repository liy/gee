import { BranchAction } from './Branch';
import { TagAction } from './Tag';

export type PromptAction = BranchAction | TagAction;

export type PromptActionType = PromptAction['type'];
