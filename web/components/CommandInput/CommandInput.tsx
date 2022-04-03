import { nanoid } from 'nanoid';
import React, { useEffect, useRef, useState } from 'react';
import { allBranches } from '../../commands/branch';
import { stagedChanges, workspaceChanges } from '../../commands/changes';
import { getTags } from '../../commands/tag';
import { Diff } from '../../Diff';
import { ReferencePrompt } from '../../prompts/Reference';
import { StatusPrompt } from '../../prompts/Status';
import { store } from '../../store';
import './command-input.scss';

async function process(cmds: string[], workingDirectory: string) {
  if (cmds.length === 0) return;

  const cmd = cmds[0].toLowerCase();
  switch (cmd) {
    case 'clear':
      store.dispatch({
        type: 'command.clear',
      });
      break;
    case 'branch':
    case 'tag':
      store.dispatch({
        type: 'prompt.references',
        prompt: {
          component: ReferencePrompt,
          props: {
            key: nanoid(),
            title: cmd === 'branch' ? 'branches' : 'tags',
            references: cmd === 'branch' ? await allBranches(workingDirectory) : await getTags(workingDirectory),
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

      store.dispatch({
        type: 'prompt.status',
        prompt: {
          component: StatusPrompt,
          props: {
            key: nanoid(),
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key == 'p' && e.ctrlKey) {
        setVisible((v) => !v);
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, []);

  // Focus when open
  useEffect(() => {
    if (visible) ref.current?.focus();
  }, [visible]);

  return (
    <input
      ref={ref}
      className="command-input"
      style={{ display: visible ? 'block' : 'none' }}
      onKeyDown={(e) => {
        if (e.key == 'Enter') {
          setVisible(false);
          // 1. Send and wait async command output completes
          // 2. Create and send action to update current prompts state, which includes all the prompt type and props
          process(e.currentTarget.value.split(' '), store.getState().workingDirectory);

          // Clear input
          if (ref.current) ref.current.value = '';
        }
      }}
    />
  );
};
