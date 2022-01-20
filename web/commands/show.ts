export const show = (hash: string, workingDirectory: string) => {
  const args = ['git', 'diff-tree', '--cc', hash];
  return window.command.invoke(args, workingDirectory);
};
