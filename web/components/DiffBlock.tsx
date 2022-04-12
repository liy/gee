import React, { FC, useState } from 'react';
import { DiffFile } from './DiffFile';
import { Diff } from '../Diff';
import { createPatch } from '../Patch';
import classNames from 'classnames';

export type IndexType =
  | 'workspace'
  | 'stage'
  // history commit
  | 'history';

export type Props = {
  diff: Diff;
  onLineClick?: (editorLineNo: number, diff: Diff) => void;
};

export const DiffBlock: FC<Props> = ({ diff, onLineClick }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <h4
        className="heading"
        style={{ top: 24 + 'px' }}
        onClick={() => {
          setCollapsed((c) => !c);
        }}
      >
        <span className={diff.changeType}>{diff.changeType.padEnd(6, ' ')} </span>
        {diff.heading.rename ? diff.heading.to + ' > ' + diff.heading.to : diff.heading.to}
      </h4>
      {collapsed && (
        <DiffFile
          diff={diff}
          onLineClick={(editorLineNo, diff) => {
            if (onLineClick) onLineClick(editorLineNo, diff);
          }}
        />
      )}
    </div>
  );
};
