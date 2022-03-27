import classNames from 'classnames';
import React, { FC, useEffect, useRef, useState } from 'react';
import { CommitInput } from '../components/CommitInput';
import { DiffFile } from '../components/DiffFile';
import { Diff } from '../Diff';
import './Status.scss';

export type Props = {
  isCommit: boolean;
  workspaceChanges: Diff[];
  stagedChanges: Diff[];
};

export const StatusPrompt: FC<Props> = ({ workspaceChanges, stagedChanges, isCommit = false }) => {
  const [inputHeight, setInputHeight] = useState(0);

  const stagedElements =
    stagedChanges.length != 0 ? (
      stagedChanges.map((diff) => (
        <div key={diff.heading.from + ' > ' + diff.heading.to}>
          <h4 className="heading" style={{ top: inputHeight + 24 + 'px' }}>
            {diff.heading.from + ' > ' + diff.heading.to}
          </h4>
          <DiffFile diff={diff} />
        </div>
      ))
    ) : (
      <h4>nothing to commit</h4>
    );

  const workspaceElements =
    workspaceChanges.length !== 0 ? (
      workspaceChanges.map((diff) => (
        <div key={diff.heading.from + ' > ' + diff.heading.to}>
          <h4 className="heading" style={{ top: inputHeight + 24 + 'px' }}>
            {diff.heading.from + ' > ' + diff.heading.to}
          </h4>
          <DiffFile diff={diff} />
        </div>
      ))
    ) : (
      <h4>working tree clean</h4>
    );

  return (
    <div className="prompt">
      <CommitInput show={isCommit} onHeightChange={(v) => setInputHeight(v)}></CommitInput>
      <div className="stage">
        <h3 style={{ top: inputHeight }}>staged</h3>
        {stagedElements}
      </div>
      <div className="workspace">
        <h3 style={{ top: inputHeight }}>workspace</h3>
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
