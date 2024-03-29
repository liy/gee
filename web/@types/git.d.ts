type Signature = {
  name: string;
  email: string;
};

interface Log {
  hash: string;
  parents: string[];
  subject: string;
  author: Signature;
  authorDate: number;
  committer: Signature;
  commitDate: number;
  simulation: boolean;
}

interface Tag {
  hash: string;
  name: string;
  shorthand: string;
  targetHash: string;
}

interface Branch {
  targetHash: string;
  name: string;
  shorthand: string;
}
