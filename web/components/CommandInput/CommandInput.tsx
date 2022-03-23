import React, { useContext, useEffect, useRef, useState } from 'react';
import { allBranches } from '../../commands/branch';
import { DispatchContext, StateContext } from '../../contexts';
import './command-input.scss';
import { nanoid } from 'nanoid';
import { BranchPrompt, TagPrompt } from '../../prompts';
import { PromptAction } from '../../prompts/actions';
import { getTags } from '../../commands/tag';

async function process(cmds: string[], dispatch: React.Dispatch<PromptAction>, workingDirectory: string) {
  if (cmds.length === 0) return;

  switch (cmds[0].toLowerCase()) {
    case 'branch':
      dispatch({
        type: 'command.branch',
        prompt: {
          component: BranchPrompt,
          props: {
            key: nanoid(),
            branches: await allBranches(workingDirectory),
          },
        },
      });
      break;
    case 'tag':
      dispatch({
        type: 'command.getTags',
        prompt: {
          component: TagPrompt,
          props: {
            key: nanoid(),
            tags: await getTags(workingDirectory),
          },
        },
      });
      break;
  }
}

export const CommandInput = () => {
  const ref = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);

  const dispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key == 'p' && e.ctrlKey) {
        setVisible((v) => !v);
        ref.current?.focus();
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, []);

  if (!visible) return null;

  return (
    <input
      ref={ref}
      className="command-input"
      onKeyDown={(e) => {
        if (e.key == 'Enter') {
          setVisible(false);
          // 1. Send and wait async command output completes
          // 2. Create and send action to update current prompts state, which includes all the prompt type and props
          process(e.currentTarget.value.split(' '), dispatch, appState.workingDirectory);
        }
      }}
    />
  );
};
