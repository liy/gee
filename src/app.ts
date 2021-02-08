import { BrowserWindow, ipcMain } from 'electron';
import StraightLayout from 'layouts/StraightLayout';
import { Commit, Repository, Revwalk } from 'nodegit';
import Graph from '../web/Graph';

export interface CommitPod {
  hash: string;
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
}

export default async function init(mainWindow: BrowserWindow) {
  const graph = new Graph();
  // Open the repository directory.
  const repo = await Repository.open('./repo');

  const revWalk = repo.createRevWalk();
  revWalk.sorting(Revwalk.SORT.TOPOLOGICAL, Revwalk.SORT.TIME);
  revWalk.pushGlob('refs/heads/*');

  const commits = new Array<Commit>();
  // eslint-disable-next-line no-constant-condition
  async function walk() {
    const oid = await revWalk.next().catch(() => null);
    if (!oid) return;

    const commit = await repo.getCommit(oid);
    const parents = commit.parents().map((oid) => oid.tostrS());
    graph.createNode(commit.sha(), parents);
    commits.push(commit);

    await walk();
  }
  await walk();

  // const masterBranch = await repo.getBranch('refs/heads/master');
  // const masterCommit = await repo.getBranchCommit(masterBranch);
  // const stableBranch = await repo.getBranch('refs/heads/stable');
  // const stableCommit = await repo.getBranchCommit(stableBranch);
  // const layout = new StraightLayout(graph, [masterCommit.sha(), stableCommit.sha()]);
  const layout = new StraightLayout(graph);
  const result = layout.process();

  mainWindow.webContents.send('fromMain', [
    result.pod(),
    commits.map((c) => {
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
      };
    }),
  ]);

  ipcMain.on('toMain', (event, args) => {
    console.log('!! received from web ', args);
  });
}
