import React, { FC } from 'react';
import { Diff } from '../Diff';
import './Commit.scss';
import { StatusPrompt } from './Status';

export type Props = {
  workspaceChanges: Diff[];
  stagedChanges: Diff[];
};

export const CommitPrompt: FC<Props> = ({ workspaceChanges, stagedChanges }) => {
  return (
    <>
      <div contentEditable className="commit-message-input" placeholder="commit message"></div>
      <div className="commit-prompt">
        <div className="editor-container">
          <StatusPrompt workspaceChanges={workspaceChanges} stagedChanges={stagedChanges}></StatusPrompt>
        </div>
      </div>
    </>
  );
};

export type CommitAction = {
  type: 'command.commit';
  prompt: {
    component: React.FC<Props>;
    props: {
      key: string;
      workspaceChanges: Diff[];
      stagedChanges: Diff[];
    };
  };
};
