import { BrowserWindow, ipcMain } from 'electron';
import StraightLayout from '../web/layouts/StraightLayout';
import Node from '../web/graph/Node';
import { Commit, Object, Reference, Repository, Revwalk } from 'nodegit';
import { Hash } from '../web/graph/Graph';

export interface CommitPod {
  hash: Hash;
  summary: string;
  date: number;
  time: number;
  body: string;
  author: {
    name: string;
    email: string;
  };
  committer: {
    name: string;
    email: string;
  };
  parents: Array<Hash>;
}

export interface RefPod {
  name: string;
  shorthand: string;
  hash: Hash;
  type: Reference.TYPE;
  isRemote: boolean;
  isBranch: boolean;
}

export default async function init(mainWindow: BrowserWindow) {
  // Open the repository directory.
  const repo = await Repository.open('./repo');

  const references = await repo.getReferences();

  const refs: Array<RefPod> = await Promise.all(
    references.map(async (ref) => {
      return {
        name: ref.name(),
        shorthand: ref.shorthand(),
        hash: (await ref.peel(Object.TYPE.COMMIT)).id().tostrS(),
        type: ref.type(),
        isRemote: ref.isRemote() === 1,
        isBranch: ref.isBranch() === 1,
      };
    })
  );

  const revWalk = repo.createRevWalk();
  revWalk.sorting(Revwalk.SORT.TOPOLOGICAL, Revwalk.SORT.TIME);
  revWalk.pushGlob('refs/heads/*');

  const commits = new Array<[Commit, Array<Hash>]>();
  // eslint-disable-next-line no-constant-condition
  async function walk() {
    const oid = await revWalk.next().catch(() => null);
    if (!oid) return;

    const commit = await repo.getCommit(oid);
    const parents = commit.parents().map((oid) => oid.tostrS());
    commits.push([commit, parents]);

    await walk();
  }
  await walk();

  mainWindow.webContents.send('fromMain', [
    commits.map(([c, parents]) => {
      return {
        hash: c.sha(),
        summary: c.summary(),
        date: c.date().getTime(),
        time: c.time(),
        body: c.body(),
        author: {
          name: c.author().name(),
          email: c.author().email(),
        },
        committer: {
          name: c.committer().name(),
          email: c.committer().email(),
        },
        parents,
      };
    }),
    refs,
  ]);

  ipcMain.on('toMain', (event, args) => {
    console.log('!! received from web ', args);
  });

  ipcMain.on('git', async (event, args: { command: string; data: any }) => {
    // const branches = args.data as Array<string>;
    // const currentBranch = await repo.getBranchCommit(await repo.getCurrentBranch());
    // const branchHashes = await Promise.all(
    //   branches.map(async (branch) => {
    //     const ref = await repo.getBranch(`refs/heads/${branch}`);
    //     return (await repo.getBranchCommit(ref)).sha();
    //   })
    // );
    // const parents = [currentBranch.sha(), ...branchHashes];
    // graph.appendNode(new Node('0'), parents);
    // graph.reset();
    // const layout = new StraightLayout(graph);
    // const result = layout.process();
    // mainWindow.webContents.send('fromMain', [
    //   result.pod(),
    //   commits.map((c) => {
    //     return {
    //       hash: c.sha(),
    //       summary: c.summary(),
    //       date: c.date().getTime(),
    //       time: c.time(),
    //       body: c.body(),
    //       author: {
    //         name: c.author().name(),
    //         email: c.author().email(),
    //       },
    //       committer: {
    //         name: c.committer().name(),
    //         email: c.committer().email(),
    //       },
    //     };
    //   }),
    //   refs,
    // ]);
  });
}
