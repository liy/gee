import { gee, Hash, Head } from '../@types/git';

export interface RepositoryData {
  id: string;
  commits: Array<gee.Commit>;
  references: Array<gee.Reference>;
  head: Head;
}

export default class Repository {
  readonly id: string;
  readonly commits: Array<gee.Commit>;
  readonly references: Array<gee.Reference>;
  readonly head: Head;

  private commitMap = new Map<Hash, gee.Commit>();
  private referenceMap = new Map<Hash, Array<gee.Reference>>();

  constructor(id: string, commits: Array<gee.Commit>, references: Array<gee.Reference>, head: Head) {
    this.id = id;
    this.commits = commits;
    this.references = references;
    this.head = head;

    for (const commit of commits) {
      this.commitMap.set(commit.hash, commit);
    }

    for (const ref of references) {
      const refs = this.referenceMap.get(ref.hash) || [];
      if (refs) {
        refs.push(ref);
      }
      this.referenceMap.set(ref.hash, refs);
    }
  }

  prependCommit(commit: gee.Commit): void {
    this.commits.unshift(commit);
    this.commitMap.set(commit.hash, commit);
  }

  insertCommitAt(commits: Array<gee.Commit>, before: Hash): boolean {
    const index = this.commits.findIndex((c) => c.hash === before);
    if (index !== -1) {
      this.commits.splice(index, 0, ...commits);
      for (const commit of commits) {
        this.commitMap.set(commit.hash, commit);
      }
      return false;
    }

    return false;
  }

  removeCommit(hash: Hash): void {
    if (this.commitMap.delete(hash)) {
      this.commits.splice(
        this.commits.findIndex((c) => c.hash === hash),
        1
      );
    }
  }

  getReferencesByNames(names: Array<string>): Array<gee.Reference> {
    return this.references.filter((ref) => names.some((name) => name === ref.shorthand || name === ref.name));
  }

  getReferences(hash: Hash): Array<gee.Reference> | undefined {
    return this.referenceMap.get(hash);
  }

  getCommit(hash: Hash): gee.Commit | undefined {
    return this.commitMap.get(hash);
  }

  getCommitAt(index: number): gee.Commit {
    return this.commits[index];
  }
}
