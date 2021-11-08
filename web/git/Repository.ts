import { Commit__Output } from 'protobuf/pb/Commit';
import { Head__Output } from 'protobuf/pb/Head';
import { Reference__Output } from 'protobuf/pb/Reference';
import { Hash } from '../@types/window';

export interface RepositoryData {
  id: string;
  commits: Array<Commit__Output>;
  references: Array<Reference__Output>;
  head: Head__Output;
}

export default class Repository {
  readonly id: string;
  readonly commits: Array<Commit__Output>;
  readonly references: Array<Reference__Output>;
  readonly head: Head__Output;

  private commitMap = new Map<Hash, Commit__Output>();
  private referenceMap = new Map<Hash, Array<Reference__Output>>();

  constructor(id: string, commits: Array<Commit__Output>, references: Array<Reference__Output>, head: Head__Output) {
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

  prependCommit(commit: Commit__Output): void {
    this.commits.unshift(commit);
    this.commitMap.set(commit.hash, commit);
  }

  insertCommitAt(commits: Array<Commit__Output>, before: Hash): boolean {
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

  getReferencesByNames(names: Array<string>): Array<Reference__Output> {
    return this.references.filter((ref) => names.some((name) => name === ref.shorthand || name === ref.name));
  }

  getReferences(hash: Hash): Array<Reference__Output> | undefined {
    return this.referenceMap.get(hash);
  }

  getReference(hash: Hash, name: string): Reference__Output | undefined {
    const refs = this.referenceMap.get(hash);
    if (refs) {
      return refs.find((ref) => ref.name === name || ref.shorthand === name);
    }
    return undefined;
  }

  getCommit(hash: Hash): Commit__Output | undefined {
    return this.commitMap.get(hash);
  }

  getCommitAt(index: number): Commit__Output {
    return this.commits[index];
  }

  addReference(ref: Reference__Output): void {
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

  revParse(value: string | Head__Output): Hash | undefined {
    // Head
    if (value instanceof Object) return value.hash;

    // Is a hash
    if (this.commitMap.has(value)) return value;

    // Could be tag or branch
    const ref = this.references.find((ref) => ref.name === value || ref.shorthand === value);
    return ref?.hash;
  }
}
