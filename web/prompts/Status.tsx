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
  if (workspaceChanges.length == 0 && stagedChanges.length == 0) {
    return <div>Nothing to commit, working tree clean</div>;
  }

  return (
    <div className="status-prompt">
      {isCommit && <div contentEditable className="commit-input" placeholder="commit message"></div>}
      <div className="stage">
        {stagedChanges.map((diff) => (
          <div className="section" key={diff.heading.from + ' > ' + diff.heading.to}>
            <div className="heading">{diff.heading.from + ' > ' + diff.heading.to}</div>
            <DiffFile diff={diff} key={diff.heading.from} />
          </div>
        ))}
      </div>
      <div className="workspace">
        {workspaceChanges.map((diff) => (
          <div className="section" key={diff.heading.from + ' > ' + diff.heading.to}>
            <div className="heading">{diff.heading.from + ' > ' + diff.heading.to}</div>
            <DiffFile diff={diff} key={diff.heading.from} />
          </div>
        ))}
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
