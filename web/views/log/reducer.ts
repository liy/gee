import { Reducer } from '../../vase';
import { ActionMapping } from './store';
import { State } from './store';

export const reducer: Reducer<ActionMapping, State> = {
  updateLog(action, state) {
    return {
      ...state,
      logs: action.logs,
    };
  },
  selectLog(action, state) {
    return {
      ...state,
      selectedLog: action.log,
    };
  },
  updateTag(action, state) {
    const map = new Map<string, Tag[]>();
    for (const tag of action.tags) {
      const tags = map.get(tag.hash) || [tag];
      map.set(tag.targetHash, tags);
    }
    return {
      ...state,
      tags: map,
    };
  },
  updateBranch(action, state) {
    const map = new Map<string, Branch[]>();
    for (const branch of action.branches) {
      const branches = map.get(branch.targetHash) || [branch];
      map.set(branch.targetHash, branches);
    }
    return {
      ...state,
      branches: map,
    };
  },
  update(action, state) {
    const branchMap = new Map<string, Branch[]>();
    for (const branch of action.branches) {
      const branches = branchMap.get(branch.targetHash) || [branch];
      branchMap.set(branch.targetHash, branches);
    }

    const tagMap = new Map<string, Tag[]>();
    for (const tag of action.tags) {
      const tags = tagMap.get(tag.hash) || [tag];
      tagMap.set(tag.targetHash, tags);
    }

    return {
      ...state,
      logs: action.logs,
      branches: branchMap,
      tags: tagMap,
    };
  },
};
