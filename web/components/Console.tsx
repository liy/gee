import React, { FC, useContext } from 'react';
import '../components-old/Commit.css';
import { StateContext } from '../contexts';

export const Console = () => {
  // get all the prompts type and props from a state, and React.createElement them.
  const state = useContext(StateContext);

  return (
    <div id="console">
      {state.prompts.map(({ component, props }) => {
        // TODO: find a way to avoid unnecessary rendering of the previous prompts
        return React.createElement(component as FC, props);
      })}
    </div>
  );
};
