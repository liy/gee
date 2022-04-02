import { configureStore } from '@reduxjs/toolkit';
import { numChanges } from './commands/numChanges';
import { Diff } from './Diff';
import { Actions, PromptAction } from './prompts/actions';

export type Prompt = PromptAction['prompt'];

export type AppState = {
  prompts: Prompt[];
  commandHistory: string[];
  workingDirectory: string;
  workspaceChanges: Diff[];
  stagedChanges: Diff[];
  logs: Log[];
  // Simulation stores the index of the simulated logs in store.logs
  simulations: number[];
  currentUser: Signature;
};

export const initialState: AppState = {
  prompts: [],
  commandHistory: [],
  workingDirectory: './',
  workspaceChanges: [],
  stagedChanges: [],
  logs: [],
  simulations: [],
  currentUser: {
    name: 'liy',
    email: 'liy@test.com',
  },
};

export const rootReducer = (state = initialState, action: Actions) => {
  if (action.type === 'command.clear') {
    return {
      ...state,
      prompts: [],
    };
  }

  switch (action.type) {
    case 'command.getReferences':
    case 'command.status':
      state = {
        ...state,
        prompts: [action.prompt, ...state.prompts],
      };
      break;
    // case 'log.changes':
    //   const simulatedCommitLog: Log = {
    //     hash: '',
    //     parents: [state.logs.length === 0 ? '' : state.logs[0].hash],
    //     subject: 'local changes',
    //     author: { ...state.currentUser },
    //     authorDate: new Date(),
    //     committer: { ...state.currentUser },
    //     commitDate: new Date(),
    //   };

    //   state = {
    //     ...state,
    //     workspaceChanges: action.workspaceChanges,
    //     stagedChanges: action.stagedChanges,
    //     logs: [simulatedCommitLog, ...state.logs],
    //     simulations: [0],
    //   };
    //   break;
    // case
    case 'log.update':
      return {
        ...state,
        logs: action.logs,
      };
    case 'workingDirectory.update':
      return {
        ...state,
        workingDirectory: action.workingDirectory,
      };
  }
  return state;
};

export const store = configureStore<AppState>({
  reducer: rootReducer,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
