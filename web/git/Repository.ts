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

  commitMap = new Map<Hash, gee.Commit>();
  referenceMap = new Map<Hash, Array<gee.Reference>>();

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

  getReferences(names: Array<string>): Array<gee.Reference> {
    return this.references.filter((ref) => names.some((name) => name === ref.shorthand || name === ref.name));
  }
}
