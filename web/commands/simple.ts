export const simple = async (command: string, workingDirectory: string) => {
  const idx = command.indexOf(' ');
  const cmds = [command.substring(0, idx), command.substring(idx + 1)];
  const result = await window.command.invoke(cmds as any, workingDirectory);
  return result;
};
