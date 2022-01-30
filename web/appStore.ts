import { Store } from 'vasejs';

type UpdateWorkingDirectory = {
  type: 'wd.update';
  path: string;
};

export interface ActionMapping {
  'wd.update': UpdateWorkingDirectory;
}

const initialState = {
  workingDirectory: '',
};

export type State = typeof initialState;

export const appStore = new Store<ActionMapping, State>(initialState, {
  'wd.update': (action, state) => {
    return {
      ...state,
      workingDirectory: action.path,
    };
  },
});
