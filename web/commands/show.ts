export const show = async (hash: string, workingDirectory: string) => {
  const logBodyArgs = ['git', 'show', '--quiet', '--pretty=%b', hash];
  const diffArgs = ['git', 'diff-tree', '--cc', hash];

  return Promise.all([
    window.command.invoke(logBodyArgs, workingDirectory),
    window.command.invoke(diffArgs, workingDirectory),
  ]);
};
