import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { log } from './commands/log';
import { numChanges } from './commands/numChanges';
import { CommandInput } from './components/CommandInput/CommandInput';
import { Console } from './components/Console';
import { LogPaneContainer } from './components/LogPane';
import './index.css';
import { SimulationUpdate } from './prompts/actions';
import './prompts/index';
import { AppState, store } from './store';

const App = () => {
  return (
    <Provider store={store}>
      <CommandInput></CommandInput>
      <LogPaneContainer></LogPaneContainer>
      <Console></Console>
    </Provider>
  );
};

window.api.onNotification((notification) => {
  console.log(notification);
});

const updateSimulations = async (wd: string) => {
  console.log('file system changed');

  const hasChanges = await numChanges(wd);

  const state = store.getState();
  const head = state.head;
  if (hasChanges && head.hash) {
    store.dispatch<AppState, SimulationUpdate>({
      type: 'simulation.update',
      simulations: [
        {
          hash: '',
          parents: [head.hash],
          subject: 'Simulation',
          author: state.currentUser,
          authorDate: Date.now(),
          committer: state.currentUser,
          commitDate: Date.now(),
          simulation: true,
        },
      ],
    });
  } else {
    store.dispatch<AppState, SimulationUpdate>({
      type: 'simulation.update',
      simulations: [],
    });
  }
};

const wd = await window.api.getWorkingDirectory();
if (wd) {
  // @ts-ignore
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);

  const [logs, , , head] = await log(wd);
  store.dispatch({
    type: 'log.update',
    logs,
    head,
  });

  window.api.onFileSysChanged(() => updateSimulations(wd));
  updateSimulations(wd);
} else {
  // Display splash screen
}

window.api.appReady();
