import { Store } from '../../vase';
import { SelectLog, Update, UpdateBranch, UpdateLog, UpdateTag } from './actions';
import { reducer } from './reducer';

export interface ActionMapping {
  update: Update;
  updateLog: UpdateLog;
  selectLog: SelectLog;
  updateTag: UpdateTag;
  updateBranch: UpdateBranch;
}

export type State = {
  logs: Log[];
  tags: Map<string, Tag[]>;
  branches: Map<string, Branch[]>;
  selectedLog: Log | null;
};

const initialState: State = {
  logs: new Array<Log>(),
  tags: new Map<string, Tag[]>(),
  branches: new Map<string, Branch[]>(),
  selectedLog: null,
};

export const store = new Store<ActionMapping, State>(initialState, reducer);
