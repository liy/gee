import classNames from 'classnames';
import { nanoid } from 'nanoid';
import React, { FC, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { stagedChanges, workspaceChanges } from '../commands/changes';
import { commit } from '../commands/commit';
import { show } from '../commands/show';
import { Diff } from '../Diff';
import { StatusPrompt } from '../prompts';
import { ShowPrompt } from '../prompts/Show';
import { AppState, GitState, store } from '../store';
import GraphStyle from '../views/log/GraphStyle';
import './SimulatedCommit.scss';

export type Props = {
  log: Log;
};

const showStatusPrompt = async (workingDirectory: string) => {
  const [workspaceDiffText, stagedDiffText] = await Promise.all([
    workspaceChanges(workingDirectory),
    stagedChanges(workingDirectory),
  ]);

  store.dispatch({
    type: 'status.update',
    workspaceChanges: Diff.parse(workspaceDiffText),
    stagedChanges: Diff.parse(stagedDiffText),
  });

  store.dispatch({
    type: 'prompt.status',
    prompt: {
      component: StatusPrompt,
      props: {
        key: nanoid(),
      },
    },
  });
};

const processSubmit = async (msg: string, gitState: GitState, workingDirectory: string) => {
  // commit
  switch (gitState) {
    case 'default':
      // No need to run status command anymore. The current status prompt will be 
      // updated via chokidar
      commit(msg, workingDirectory);
      break;
    case 'merge':
      break;
    case 'rebase':
      break;
  }
};

const processSelection = async (log: Log, gitState: GitState, workingDirectory: string) => {
  // display status, workspace and staged changes
  if (gitState === 'default') {
    if (store.getState().selectedHash !== log.hash) {
      showStatusPrompt(workingDirectory);
    }

    store.dispatch({
      type: 'log.selection',
      hash: log.hash,
    });
  }
  // Get current commit diff information: git show <hash>
  else {
    const { branches, tags, bodyText, diffText } = await show(log.hash, workingDirectory);

    store.dispatch({
      type: 'prompt.show',
      prompt: {
        component: ShowPrompt,
        props: {
          key: nanoid(),
          diffs: Diff.parse(diffText),
          log: log,
          logBody: bodyText,
          branches,
          tags,
          title: `show ${log.hash.substring(0, 6)}`,
        },
      },
    });
  }
};

export const SimulatedCommit: FC<Props> = ({ log }) => {
  const [inputHeight, setInputHeight] = useState<string>('auto');
  const workingDirectory = useSelector((state: AppState) => state.workingDirectory);
  const gitState = useSelector((state: AppState) => state.gitState);
  const ref = useRef<HTMLDivElement>(null);

  const [placeholder, setPlaceholder] = useState('commit message');

  return (
    <div className={classNames('commit', 'simulated')} style={{ height: GraphStyle.sliceHeight + 'px' }}>
      <div
        ref={ref}
        contentEditable
        className="commit-input"
        style={{
          height: inputHeight,
        }}
        onClick={() => {
          setInputHeight('auto');
          processSelection(log, gitState, workingDirectory);
        }}
        onBlur={() => {
          setInputHeight(16 + 'px');
        }}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 'Enter') {
            processSubmit(e.currentTarget.innerText, gitState, workingDirectory);
            if (ref.current) ref.current.textContent = '';
          } else {
            // display placeholder or not
            setTimeout(() => {
              if (ref.current?.textContent === '') {
                setPlaceholder('commit message');
              } else {
                setPlaceholder('');
              }
            });
          }
        }}
      ></div>
      <div className="placeholder">{placeholder}</div>
    </div>
  );
};
