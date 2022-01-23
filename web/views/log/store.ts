import { Store } from '../../vase';
import { SelectLog, Update } from './actions';
import { reducer } from './reducer';

export interface ActionMapping {
  update: Update;
  // updateLog: UpdateLog;
  selectLog: SelectLog;
  // updateTag: UpdateTag;
  // updateBranch: UpdateBranch;
}

export type State = {
  map: Map<string, number>;
  logs: Log[];
  tags: Map<string, Tag[]>;
  branches: Map<string, Branch[]>;
  selectedLog: Log | null;
};

const initialState: State = {
  map: new Map<string, number>(),
  logs: new Array<Log>(),
  tags: new Map<string, Tag[]>(),
  branches: new Map<string, Branch[]>(),
  selectedLog: null,
};

export const store = new Store<ActionMapping, State>(initialState, reducer);
