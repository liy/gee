import { Diff } from '../../Diff';
import { Store } from 'vasejs';
import { Apply, ToggleLine, Update } from './actions';
import { reducer } from './reducer';

export interface ActionMapping {
  toggleLine: ToggleLine;
  apply: Apply;
  update: Update;
}

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

export const store = new Store<ActionMapping, State>(initialState, reducer);
