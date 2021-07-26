import { gee, Hash, Head } from '../@types/gee';

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

  getReference(hash: Hash, name: string): gee.Reference | undefined {
    const refs = this.referenceMap.get(hash);
    if (refs) {
      return refs.find((ref) => ref.name === name || ref.shorthand === name);
    }
    return undefined;
  }

  getCommit(hash: Hash): gee.Commit | undefined {
    return this.commitMap.get(hash);
  }

  getCommitAt(index: number): gee.Commit {
    return this.commits[index];
  }

  addReference(ref: gee.Reference): void {
    this.references.push(ref);
    const refs = this.referenceMap.get(ref.hash) || [];
    if (refs) {
      refs.push(ref);
    }
    this.referenceMap.set(ref.hash, refs);
  }

  // TODO: to be improved
  removeReference(hash: Hash, name: string): void {
    const refs = this.referenceMap.get(hash);
    if (refs) {
      const index = refs.findIndex((ref) => ref.name === name || ref.shorthand === name);
      if (index != -1) {
        const toRemove = refs[index];
        refs.splice(index);
        this.references.splice(this.references.indexOf(toRemove), 1);
      }
    }
  }

  revParse(value: string | Head): Hash | undefined {
    // Head
    if (value instanceof Object) return value.hash;

    // Is a hash
    if (this.commitMap.has(value)) return value;

    // Could be tag or branch
    const ref = this.references.find((ref) => ref.name === value || ref.shorthand === value);
    return ref?.hash;
  }
}
