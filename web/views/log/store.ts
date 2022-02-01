import { Store } from 'vasejs';
import { SelectLog, Update } from './actions';

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

export const store = new Store<State, Update | SelectLog>(initialState, {
  // updateLog(action, state) {
  //   return {
  //     ...state,
  //     logs: action.logs,
  //   };
  // },
  selectLog(action, state) {
    return {
      ...state,
      selectedLog: action.log,
    };
  },
  // updateTag(action, state) {
  //   const map = new Map<string, Tag[]>();
  //   for (const tag of action.tags) {
  //     const tags = map.get(tag.hash) || [tag];
  //     map.set(tag.targetHash, tags);
  //   }
  //   return {
  //     ...state,
  //     tags: map,
  //   };
  // },
  // updateBranch(action, state) {
  //   const map = new Map<string, Branch[]>();
  //   for (const branch of action.branches) {
  //     const branches = map.get(branch.targetHash) || [branch];
  //     map.set(branch.targetHash, branches);
  //   }
  //   return {
  //     ...state,
  //     branches: map,
  //   };
  // },
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

    const map = new Map<string, number>();
    action.logs.forEach((log, index) => map.set(log.hash, index));

    return {
      ...state,
      map,
      logs: action.logs,
      branches: branchMap,
      tags: tagMap,
    };
  },
});
