import React, { FC } from 'react';
import { commit } from '../commands/commit';
import { DiffFile } from '../components/DiffFile';
import { Diff } from '../Diff';

export type Props = {
  workingDirectory: string;
  workspaceChanges: Diff[];
  stagedChanges: Diff[];
};

export const StatusPrompt: FC<Props> = ({ workspaceChanges, stagedChanges }) => {
  return (
    <div className="status-prompt">
      <div>
        {stagedChanges.map((diff) => (
          <div>
            <div className="heading">{diff.heading.from + ' > ' + diff.heading.to}</div>
            <DiffFile diff={diff} key={diff.heading.from} />
          </div>
        ))}
      </div>
      <div>
        {workspaceChanges.map((diff) => (
          <div>
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
      workspaceChanges: Diff[];
      stagedChanges: Diff[];
    };
  };
};
