export type Hash = string;

export namespace gee {
  export enum ReferenceType {
    INVALID = 0,
    OID = 1,
    SYMBOLIC = 2,
    LISTALL = 3,
  }

  export interface Commit {
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

  export interface Reference {
    name: string;
    shorthand: string;
    hash: Hash;
    type: ReferenceType;
    isRemote: boolean;
    isBranch: boolean;
  }
}

export interface Head {
  hash: Hash;
  name: string;
  shorthand: string;
}
