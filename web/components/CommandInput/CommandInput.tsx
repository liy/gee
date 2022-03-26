import { nanoid } from 'nanoid';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { allBranches } from '../../commands/branch';
import { stagedChanges, workspaceChanges } from '../../commands/changes';
import { getTags } from '../../commands/tag';
import { DispatchContext, StateContext } from '../../contexts';
import { Diff } from '../../Diff';
import { BranchPrompt, TagPrompt } from '../../prompts';
import { ClearAction, PromptAction } from '../../prompts/actions';
import { StatusPrompt } from '../../prompts/Status';
import './command-input.scss';

async function process(cmds: string[], dispatch: React.Dispatch<PromptAction | ClearAction>, workingDirectory: string) {
  if (cmds.length === 0) return;

  const cmd = cmds[0].toLowerCase();
  switch (cmd) {
    case 'clear':
      dispatch({
        type: 'command.clear',
      });
      break;
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
    case 'commit':
    case 'status':
      const [workspaceDiffText, stagedDiffText] = await Promise.all([
        workspaceChanges(workingDirectory),
        stagedChanges(workingDirectory),
      ]);
      dispatch({
        type: 'command.status',
        prompt: {
          component: StatusPrompt,
          props: {
            key: nanoid(),
            isCommit: cmd === 'commit',
            workspaceChanges: Diff.parse(workspaceDiffText),
            stagedChanges: Diff.parse(stagedDiffText),
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
