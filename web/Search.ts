import Fuse from 'fuse.js';
import { gee, Hash } from './@types/git';

class Search {
  commitSearch!: Fuse<gee.Commit>;
  referenceSearch!: Fuse<gee.Reference>;

  init(commits: Array<gee.Commit>, references: Array<gee.Reference>) {
    this.commitSearch = new Fuse(commits, {
      keys: ['hash', 'summary', 'body', 'author.name', 'author.email', 'date'],
      threshold: 0,
      sortFn: (a, b) => {
        if (a.score === b.score) {
          return (b.item as any)[5] - (a.item as any)[5];
        }
        return 0;
      },
    });
    this.referenceSearch = new Fuse(references, { keys: ['name', 'shorthand'], threshold: 0 });
  }

  update(commits: Array<gee.Commit>, references: Array<gee.Reference>) {
    this.updateCommits(commits);
    this.updateReferences(references);
  }

  updateCommits(commits: Array<gee.Commit>) {
    this.commitSearch.setCollection(commits);
  }

  addCommit(commit: gee.Commit) {
    this.commitSearch.add(commit);
  }

  removeCommit(hash: Hash) {
    this.commitSearch.remove((commit) => commit.hash === hash);
  }

  updateReferences(references: Array<gee.Reference>) {
    this.referenceSearch.setCollection(references);
  }

  addReference(ref: gee.Reference) {
    this.referenceSearch.add(ref);
  }

  removeReference(hash: Hash) {
    this.referenceSearch.remove((commit) => commit.hash === hash);
  }

  perform(pattern: string): [Fuse.FuseResult<gee.Reference>[], Fuse.FuseResult<gee.Commit>[]] {
    return [this.references(pattern), this.commits(pattern)];
  }

  references(pattern: string): Fuse.FuseResult<gee.Reference>[] {
    return this.referenceSearch.search(pattern);
  }

  commits(pattern: string): Fuse.FuseResult<gee.Commit>[] {
    return this.commitSearch.search(pattern);
  }
}

export default new Search();
