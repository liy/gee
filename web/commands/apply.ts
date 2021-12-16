export const applyPatch = async (patch: string) => {
  console.log(patch);
  const path = await window.api.saveFile('.git/ADD_EDIT.patch', patch);
  // const args = ['git', 'apply', '--cached', path];
  // return window.command.invoke(args);
};
