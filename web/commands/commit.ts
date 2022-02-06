export const commit = async (message: string, workingDirectory: string) => {
  const args = ['git', 'commit', '-m', `"${message}"`];
  const result = await window.command.invoke(args, workingDirectory);
  return result;
};
