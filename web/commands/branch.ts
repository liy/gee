export interface BranchData {
  name: string;
  shorthand: string;
  hash: string;
}

export const allBranches = () => {
  const args = ['branch', '--format', '%(refname) %(refname:short) %(objectname)'];
  return new Promise<Array<BranchData>>((resolve, reject) => {
    const entries = new Array<BranchData>();
    window.command.submit(args, {
      onReadLine: (line: string) => {
        const [name, shorthand, hash] = line.split(' ');
        entries.push({
          name,
          hash,
          shorthand,
        });
      },
      onClose: () => {
        resolve(entries);
      },
      onError: () => {
        reject();
      },
    });
  });
};
