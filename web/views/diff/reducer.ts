import { Reducer } from '../../vase';
import { ActionMapping, State } from './store';

export const reducer: Reducer<ActionMapping, State> = {
  update(action, state) {
    return {
      ...state,
      stage: {
        diffText: action.stagedDiffText,
        diffs: action.stagedDiffs,
      },
      workspace: {
        diffText: action.localDiffText,
        diffs: action.localDiffs,
      },
    };
  },
  toggleLine: (action, state) => {
    return state;
  },
};
