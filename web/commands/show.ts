import { parseReference } from './log';

export const show = async (hash: string, workingDirectory: string) => {
  const [showText, diffText] = await Promise.all([
    window.command.invoke(['git', 'show', '--quiet', '--pretty=%D%n%b', hash], workingDirectory),
    window.command.invoke(['git', 'diff-tree', '--cc', hash], workingDirectory),
  ]);
  const firstNewLineIndex = showText.indexOf('\n');
  const refLine = showText.substring(0, firstNewLineIndex);

  const bodyText = showText.substring(firstNewLineIndex);
  const [branches, tags] = parseReference(refLine);
  // return Promise.all([
  //   ,
  //   ,
  // ]);

  return {
    branches,
    tags,
    bodyText,
    diffText,
  };
};
