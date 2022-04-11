export const hasNewFiles = async (workingDirectory: string) => {
  const args = ['git', 'ls-files', '-o', '--exclude-standard'];
  return (await window.command.invoke(args, workingDirectory)) !== '';
};

export const workspaceChanges = async (workingDirectory: string, ignoreNewFile = false) => {
  // if there are new files, try to add it into index first
  // FIXME: Note that, this will trigger index file change because it updates .git/index file
  // and will trigger chokidar watcher results one extra call of this method call.
  if ((await hasNewFiles(workingDirectory)) && !ignoreNewFile) {
    // Intent to add: https://stackoverflow.com/questions/855767/can-i-use-git-diff-on-untracked-files
    await window.command.invoke(['git', 'add', '-N', '.'], workingDirectory);
  }

  const args = ['git', 'diff', '--full-index'];
  return window.command.invoke(args, workingDirectory);
};

export const stagedChanges = (workingDirectory: string) => {
  const args = ['git', 'diff', '--cached', '--full-index'];
  return window.command.invoke(args, workingDirectory);
};
