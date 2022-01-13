export const workspaceChanges = (workingDirectory: string) => {
  const args = ['git', 'diff', '--full-index'];
  return window.command.invoke(args, workingDirectory);
};

export const stagedChanges = (workingDirectory: string) => {
  const args = ['git', 'diff', '--cached', '--full-index'];
  return window.command.invoke(args, workingDirectory);
};
