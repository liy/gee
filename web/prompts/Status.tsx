import React, { FC } from 'react';
import { DiffBlock } from '../components/DiffBlock';
import { Diff } from '../Diff';
import './Status.scss';

export type Props = {
  workspaceChanges: Diff[];
  stagedChanges: Diff[];
};

export const StatusPrompt: FC<Props> = ({ workspaceChanges, stagedChanges }) => {
  const stagedElements =
    stagedChanges.length != 0 ? (
      stagedChanges.map((diff) => <DiffBlock key={diff.heading.from + ' > ' + diff.heading.to} diff={diff}></DiffBlock>)
    ) : (
      <h4>nothing to commit</h4>
    );

  const workspaceElements =
    workspaceChanges.length !== 0 ? (
      workspaceChanges.map((diff) => (
        <DiffBlock key={diff.heading.from + ' > ' + diff.heading.to} diff={diff}></DiffBlock>
      ))
    ) : (
      <h4>working tree clean</h4>
    );

  return (
    <div className="prompt">
      <div className="stage">
        <h3 style={{ top: 0 }}>staged</h3>
        {stagedElements}
      </div>
      <div className="workspace">
        <h3 style={{ top: 0 }}>workspace</h3>
        {workspaceElements}
      </div>
    </div>
  );
};

export type StatusAction = {
  type: 'prompt.status';
  prompt: {
    component: React.FC<Props>;
    props: {
      key: string;
      workspaceChanges: Diff[];
      stagedChanges: Diff[];
    };
  };
};
