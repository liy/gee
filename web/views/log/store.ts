import { Store } from '../../vase';
import { SelectLog, Update } from './actions';
import { reducer } from './reducer';

export interface ActionMapping {
  update: Update;
  selectLog: SelectLog;
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

export type State = {
  logs: LogEntry[];
  tags: Tag[];
  branches: Branch[];
  selectedLog: LogEntry | null;
};

const initialState: State = {
  logs: new Array<LogEntry>(),
  tags: new Array<Tag>(),
  branches: new Array<Branch>(),
  selectedLog: null,
};

export const store = new Store<ActionMapping, State>(initialState, reducer);
