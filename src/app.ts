import { BrowserWindow, ipcMain } from 'electron';
import { RepositoryData } from '../web/git/Repository';
import { Commit, Object, Reference, Repository, Revwalk } from 'nodegit';
import { Hash } from '../web/@types/git';
import os from 'os';
import pty from 'node-pty';

Reference.TYPE.INVALID;

export default async function init(mainWindow: BrowserWindow): Promise<void> {
  // Open the repository directory.
  const repo = await Repository.open('./repo');

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

  const references = await repo.getReferences();
  const headReference = await repo.head();

  const repoData: RepositoryData = {
    id: './repo',
    commits: commits.map(([c, parents]) => {
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
    references: await Promise.all(
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
    ),
    head: {
      hash: (await headReference.peel(Object.TYPE.COMMIT)).id().tostrS(),
      name: headReference.name(),
      shorthand: headReference.shorthand(),
    },
  };

  mainWindow.webContents.send('fromMain', repoData);

  ipcMain.on('toMain', (event, args) => {
    console.log('!! received from web ', args);
  });

  ipcMain.on('git', async (event, args: { command: string; data: any }) => {
    console.log('run git !');
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

  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  ptyProcess.onData((data) => {
    mainWindow.webContents.send('terminal.incomingData', data);
  });

  ptyProcess.write('ls\r');
  ptyProcess.resize(100, 40);
  ptyProcess.write('ls\r');

  ipcMain.on('terminal.keystroke', (event, key) => {
    ptyProcess.write(key);
  });
}
