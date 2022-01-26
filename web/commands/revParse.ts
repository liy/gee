/**
 * Rev-parse returns a full hash from a shorthand hash
 * @param hash short hash
 * @param workingDirectory current working directory
 * @returns full hash of a git object
 */
export const revParse = async (hash: string, workingDirectory: string) => {
  const args = ['git', 'rev-parse', hash];
  return window.command.invoke(args, workingDirectory);
};
