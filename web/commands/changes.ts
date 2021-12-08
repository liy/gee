import { DiffParser } from '../DiffParser';

export const localChanges = () => {
  const args = ['git', 'diff', '--full-index'];
  return window.command.invoke(args);
};

export const stagedChanges = () => {
  const args = ['git', 'diff', '--cached', '--full-index'];
  return window.command.invoke(args);
};
