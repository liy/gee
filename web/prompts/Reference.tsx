import React, { FC } from 'react';
import { TagData } from '../commands/tag';
import { BranchData } from '../commands/branch';
import './Reference.scss';
import { store } from '../store';
import { transition } from '../transition';

export type Props = {
  title: string;
  references: TagData[] | BranchData[];
};

export const ReferencePrompt: FC<Props> = ({ references, title }) => {
  return (
    <div className="prompt">
      <h3>{title}</h3>
      <div className="section">
        {references?.map((ref) => (
          <span
            className="reference"
            key={ref.name}
            onClick={() => {
              const hash = 'targetHash' in ref ? ref.targetHash : ref.hash;

              store.dispatch({
                type: 'log.selection',
                hash,
              });
              
              // transitional event
              transition.emit('log.focus', hash);
            }}
          >
            {ref.shorthand}
          </span>
        ))}
      </div>
    </div>
  );
};

export type GetReferenceAction = {
  type: 'prompt.references';
  prompt: {
    component: React.FC<Props>;
    props: {
      key: string;
      title: string;
      references: TagData[] | BranchData[];
    };
  };
};
