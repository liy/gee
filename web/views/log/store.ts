import { Store } from '../../vase';
import { Update } from './actions';
import { reducer } from './reducer';

export interface ActionMapping {
  update: Update;
}

export type Signature = {
  name: string;
  email: string;
};

export interface LogEntry {
  hash: string;
  parents: string[];
  subject: string;
  author: Signature;
  authorDate: Date;
  committer: Signature;
  commitDate: Date;
}

export interface Tag {
  hash: string;
  name: string;
  shorthand: string;
  targetHash: string;
}

export interface Branch {
  targetHash: string;
  name: string;
  shorthand: string;
}

const initialState = {
  logs: new Array<LogEntry>(),
  tags: new Array<Tag>(),
  branches: new Array<Branch>(),
};

export type State = typeof initialState;

export const store = new Store<ActionMapping, State>(initialState, reducer);
