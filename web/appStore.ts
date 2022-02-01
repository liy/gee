import { Store } from 'vasejs';

type UpdateWorkingDirectory = {
  type: 'wd.update';
  path: string;
};

const initialState = {
  workingDirectory: '',
};

export const appStore = new Store<typeof initialState, UpdateWorkingDirectory>(initialState, {
  'wd.update': (action, state) => {
    return {
      ...state,
      workingDirectory: action.path,
    };
  },
});
