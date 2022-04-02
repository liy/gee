import React, { FC, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import '../components-old/Commit.css';
import { AppState, Prompt } from '../store';
import './Console.scss';

export const Console = () => {
  // get all the prompts type and props from a state, and React.createElement them.
  // const state = useContext(StateContext);
  const prompts = useSelector<AppState, Prompt[]>((state) => state.prompts);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = 0;
    }
  });

  return (
    <div id="console" ref={ref}>
      {prompts.map(({ component, props }) => {
        // TODO: find a way to avoid unnecessary rendering of the previous prompts
        return React.createElement(component as FC, props);
      })}
    </div>
  );
};
