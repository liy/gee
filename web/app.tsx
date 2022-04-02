import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { log } from './commands/log';
import { CommandInput } from './components/CommandInput/CommandInput';
import { Console } from './components/Console';
import { LogPaneContainer } from './components/LogPane';
import './index.css';
import './prompts/index';
import { store } from './store';

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

const wd = await window.api.getWorkingDirectory();
if (wd) {
  // @ts-ignore
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);

  const [logs] = await log(wd);
  store.dispatch({
    type: 'log.update',
    logs,
  });
} else {
  // Display splash screen
}

window.api.appReady();
