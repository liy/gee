import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { Head } from './commands/log';
import { Diff } from './Diff';
import { Actions, PromptAction } from './prompts/actions';

export type Prompt = PromptAction['prompt'];

export type GitState = 'default' | 'rebase' | 'merge' | 'cherry-pick' | 'timeline';

export type AppState = {
  prompts: Prompt[];
  commandHistory: string[];
  workingDirectory: string;
  workspaceChanges: Diff[];
  stagedChanges: Diff[];
  logs: Log[];
  simulations: Log[];
  currentUser: Signature;
  head: Head;
  gitState: GitState;
  selectedHash: string;
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
  head: {
    hash: null,
    ref: null,
  },
  gitState: 'default',
  selectedHash: '',
};

export const rootReducer = (state = initialState, action: Actions): AppState => {
  if (action.type === 'command.clear') {
    return {
      ...state,
      prompts: [],
    };
  }

  switch (action.type) {
    case 'prompt.references':
    case 'prompt.status':
    case 'prompt.show':
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
        head: action.head,
      };
    case 'log.selection':
      return {
        ...state,
        selectedHash: action.hash,
      };
    case 'workingDirectory.update':
      return {
        ...state,
        workingDirectory: action.workingDirectory,
      };
    case 'simulation.update':
      return {
        ...state,
        simulations: action.simulations,
      };
    case 'gitState.update':
      return {
        ...state,
        gitState: action.gitState,
      };
  }
  return state;
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['prompt', 'prompt.component'],
        ignoredPaths: ['prompts'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
