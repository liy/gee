import { Store } from 'vasejs';
import { Actions } from './actions';

export type State = {
  map: Map<string, number>;
  logs: Log[];
  simulations: Log[];
  tags: Map<string, Tag[]>;
  branches: Map<string, Branch[]>;
  selectedLog: Log | null;
  head: string;
};

const initialState: State = {
  map: new Map<string, number>(),
  logs: new Array<Log>(),
  simulations: [],
  tags: new Map<string, Tag[]>(),
  branches: new Map<string, Branch[]>(),
  selectedLog: null,
  head: '',
};

export const store = new Store<State, Actions>(initialState, {
  selectLog(action, state) {
    return {
      ...state,
      selectedLog: action.log,
    };
  },
  // Note that update will clear all simulations
  update(action, state) {
    const branchMap = new Map<string, Branch[]>();
    for (const branch of action.branches) {
      const branches = branchMap.get(branch.targetHash) || [];
      branches.push(branch);
      branchMap.set(branch.targetHash, branches);
    }

    const tagMap = new Map<string, Tag[]>();
    for (const tag of action.tags) {
      const tags = tagMap.get(tag.hash) || [];
      tags.push(tag);
      tagMap.set(tag.targetHash, tags);
    }

    // Update graph index map
    const map = new Map<string, number>();
    action.logs.forEach((log, index) => map.set(log.hash, index));

    return {
      ...state,
      map,
      logs: action.logs,
      branches: branchMap,
      tags: tagMap,
      head: action.head,
      simulations: [],
    };
  },
  simulate(action, state) {
    // Update graph index map for both simulation and normal logs
    const map = new Map<string, number>();
    action.simulations.forEach((log, index) => map.set(log.hash, index));
    state.logs.forEach((log, index) => map.set(log.hash, index));

    return {
      ...state,
      map,
      simulations: action.simulations,
    };
  },
});

// @ts-ignore
window.logStore = store;
