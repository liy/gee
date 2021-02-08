/* eslint-disable no-constant-condition */
import { Commit, Repository, Revwalk } from 'nodegit';
import Graph from '../web/Graph';
import StraightLayout from '../web/layouts/StraightLayout';
import Node from '../web/Node';

const graph: Graph = new Graph();

export default {
  async getGraph(): Promise<Graph> {
    // Open the repository directory.
    const repo = await Repository.open('./repo-scratch');

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

    return graph;
  },
};
