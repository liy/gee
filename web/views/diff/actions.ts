import { Diff } from '../../DiffParser';

export type Update = {
  type: 'update';
  workspaceChanges: Diff[];
  stagedChanges: Diff[];
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
