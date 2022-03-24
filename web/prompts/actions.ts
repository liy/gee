import { BranchAction } from './Branch';
import { CommitAction } from './Commit';
import { TagAction } from './Tag';
import { StatusAction } from './Status';

export type PromptAction = BranchAction | TagAction | CommitAction | StatusAction;

export type PromptActionType = PromptAction['type'];
