export const stagePatch = async (patch: string) => {
  const path = await window.api.saveFile('.git/ADD_EDIT.patch', patch);
  const args = ['git', 'apply', '--cached', path];
  return window.command.invoke(args);
};

export const unstagePatch = async (patch: string) => {
  const path = await window.api.saveFile('.git/ADD_EDIT.patch', patch);
  const args = ['git', 'apply', '--cached', '--reverse', path];
  return window.command.invoke(args);
};
