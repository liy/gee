import { Diff } from '../../Diff';
import { Store } from 'vasejs';
import { Actions } from './actions';

export interface Patch {
  diffs: Diff[];
}

const initialState = {
  workspace: {
    changes: new Array<Diff>(),
  },
  stage: {
    changes: new Array<Diff>(),
  },
};

export type State = typeof initialState;

export const store = new Store<State, Actions>(initialState, {
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
});
