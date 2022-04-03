import React, { FC, useState } from 'react';
import { DiffFile } from './DiffFile';
import { Diff } from '../Diff';

export type Props = {
  diff: Diff;
};

export const DiffBlock: FC<Props> = ({ diff }) => {
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
        {diff.heading.from + ' > ' + diff.heading.to}
      </h4>
      {collapsed && <DiffFile diff={diff} />}
    </div>
  );
};
