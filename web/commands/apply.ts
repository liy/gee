/**
 *
 * @param patch
 * @param gitReverse True to enable --reverse tag. If we are unstging a whole file we can use
 * the original diff without further process and delegate the process to git to directly use --reverse to unstage all changes.
 */
export const applyPatch = async (patch: string, gitReverse: Boolean = false) => {
  // TODO: use a proper temp patch to store the patch
  const path = await window.api.saveFile('.git/ADD_EDIT.patch', patch);
  const args = ['git', 'apply', '--cached'];
  if (gitReverse) args.push('--reverse');
  args.push(path);
  return window.command.invoke(args);
};
