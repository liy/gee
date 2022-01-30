import { Reducer } from 'vasejs';
import { ActionMapping, State } from './store';

export const reducer: Reducer<ActionMapping, State> = {
  update(action, state) {
    return {
      ...state,
      stage: {
        changes: action.stagedChanges,
      },
      workspace: {
        changes: action.workspaceChanges,
      },
    };
  },
  toggleLine: (action, state) => {
    return state;
  },
};
