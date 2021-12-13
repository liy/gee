import { Diff } from '../../DiffParser';

export type Update = {
  type: 'update';
  localDiffText: string;
  localDiffs: Diff[];
  stagedDiffText: string;
  stagedDiffs: Diff[];
};

export type Apply = {
  type: 'apply';
};

export type ToggleLine = {
  type: 'toggleLine';
  diffIndex: number;
  lineNo: number;
  flag: boolean;
};
