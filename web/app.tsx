import React, { FC, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { CommandInput } from './components/CommandInput/CommandInput';
import { Console } from './components/Console';
import { LogPane } from './components/LogPane';
import { DispatchContext, StateContext } from './contexts';
import './index.css';
import { PromptAction } from './prompts/actions';

// type Prompt = typeof Prompts[keyof typeof Prompts];

type Prompt = PromptAction['prompt'];

export const initialState = {
  prompts: [] as Prompt[],
  commandHistory: [],
  workingDirectory: '',
};

export type AppState = typeof initialState;

interface Props {
  workingDirectory: string;
}

const reducer = (state: AppState, action: PromptAction) => {
  switch (action.type) {
    case 'command.branch':
    case 'command.getTags':
    case 'command.status':
    case 'command.commit':
      state = {
        ...state,
        prompts: [action.prompt, ...state.prompts],
      };
      break;
  }
  return state;
};

const App: FC<Props> = ({ workingDirectory }) => {
  const [appState, dispatch] = useReducer(reducer, { ...initialState, workingDirectory });

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={appState}>
        <CommandInput></CommandInput>
        <LogPane workingDirectory={workingDirectory}></LogPane>
        <Console></Console>
      </StateContext.Provider>
    </DispatchContext.Provider>
  );
};

window.api.onNotification((notification) => {
  console.log(notification);
});

const wd = await window.api.getWorkingDirectory();
if (wd) {
  ReactDOM.render(<App workingDirectory={wd}></App>, document.getElementById('root'));
} else {
  // Display splash screen
}

window.api.appReady();
