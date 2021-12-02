import { Hash } from '../@types/window';

export interface BranchData {
  name: string;
  shorthand: string;
  hash: string;
}

export const allBranches = () => {
  const args = ['git', 'branch', '--format', '%(refname) %(refname:short) %(objectname)'];
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

export const currentBranch = async (): Promise<[string | undefined, Hash | undefined]> => {
  // get branch name, pointed by HEAD
  const branchName = await new Promise<string | undefined>((resolve, reject) => {
    let branchName: string | undefined;
    window.command.submit(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], {
      onReadLine: (line: string) => {
        branchName = line.trim();
      },
      onClose: () => {
        resolve(branchName);
      },
      onError: () => {
        reject();
      },
    });
  });

  // Get hash
  const hash = await new Promise<string | undefined>((resolve, reject) => {
    let h: string | undefined;
    window.command.submit(['git', 'rev-parse', 'HEAD'], {
      onReadLine: (line: string) => {
        h = line.trim();
      },
      onClose: () => {
        resolve(h);
      },
      onError: () => {
        reject();
      },
    });
  });

  return Promise.resolve([branchName, hash]);
};
