import React, { FC } from 'react';
import { DiffFile } from '../components/DiffFile';
import { Diff } from '../Diff';
import './Status.scss';

export type Props = {
  isCommit: boolean;
  workspaceChanges: Diff[];
  stagedChanges: Diff[];
};

export const StatusPrompt: FC<Props> = ({ workspaceChanges, stagedChanges, isCommit = false }) => {
  const stagedElements =
    stagedChanges.length != 0 ? (
      stagedChanges.map((diff) => (
        <>
          <h4 className="heading">{diff.heading.from + ' > ' + diff.heading.to}</h4>
          <DiffFile diff={diff} key={diff.heading.from + ' > ' + diff.heading.to} />
        </>
      ))
    ) : (
      <div>Nothing to commit</div>
    );

  const workspaceElements =
    workspaceChanges.length !== 0 ? (
      workspaceChanges.map((diff) => (
        <>
          <h4 className="heading">{diff.heading.from + ' > ' + diff.heading.to}</h4>
          <DiffFile diff={diff} key={diff.heading.from} />
        </>
      ))
    ) : (
      <div>Working tree clean</div>
    );

  return (
    <div className="prompt">
      {isCommit && <div contentEditable className="commit-input" placeholder="commit message"></div>}
      <div className="stage">
        <h3>staged</h3>
        {stagedElements}
      </div>
      <div className="workspace">
        <h3>workspace</h3>
        {workspaceElements}
      </div>
    </div>
  );
};

export type StatusAction = {
  type: 'command.status';
  prompt: {
    component: React.FC<Props>;
    props: {
      key: string;
      isCommit: boolean;
      workspaceChanges: Diff[];
      stagedChanges: Diff[];
    };
  };
};
