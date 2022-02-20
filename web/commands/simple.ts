export const simple = async (command: string, workingDirectory: string) => {
  const idx = command.indexOf(' ');
  const cmds = [command.substring(0, idx), command.substring(idx + 1)];
  // FIXME: on large stdout, there is a limit so it will fail
  const result = await window.command.invoke(cmds as any, workingDirectory);
  return result;
};
