export const numChanges = async (workingDirectory: string) => {
  const result = (await await window.command.invoke(['git', 'status', '-s', '-u'], workingDirectory)).trim();
  if (result === '') return 0;
  return result.split('\n').length;
};
