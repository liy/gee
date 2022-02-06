export const workspaceChanges = async (workingDirectory: string) => {
  // Intent to add: https://stackoverflow.com/questions/855767/can-i-use-git-diff-on-untracked-files
  // Just in case there are new files
  await window.command.invoke(['git', 'add', '-N', '.'], workingDirectory);
  const args = ['git', 'diff', '--full-index'];
  return window.command.invoke(args, workingDirectory);
};

export const stagedChanges = (workingDirectory: string) => {
  const args = ['git', 'diff', '--cached', '--full-index'];
  return window.command.invoke(args, workingDirectory);
};
