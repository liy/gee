import { DiffParser } from '../DiffParser';

export const localChanges = async () => {
  const args = ['git', 'diff', '--full-index'];
  const outputs = await window.command.invoke(args);

  const parser = new DiffParser(outputs);
  return parser.parse();
};

export const stagedChanges = async () => {
  const args = ['git', 'diff', '--cached', '--full-index'];
  const outputs = await window.command.invoke(args);

  const parser = new DiffParser(outputs);
  return parser.parse();
};
