import React, { FC, useState } from 'react';
import { Diff } from '../Diff';
import { DiffFile } from './DiffFile';
import './DiffBlock.scss';


export type Props = {
  diff: Diff;
  onLineClick?: (editorLineNo: number, diff: Diff) => void;
  headingButton?: JSX.Element;
};

export const DiffBlock: FC<Props> = ({ diff, onLineClick, headingButton }) => {
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
        {headingButton}
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
