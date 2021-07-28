import { RepositoryData } from '../web/git/Repository';
import { Commit, Object, Repository, Revwalk } from 'nodegit';
import { Hash } from '../web/@types/gee';

const repositoryDataMap = new Map<string, RepositoryData>();

export default {
  open: async (path: string) => {
    const repo = await Repository.open(path);

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
      id: path,
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

    repositoryDataMap.set(path, repoData);

    return repoData;
  },
};
