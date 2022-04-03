import React, { FC } from 'react';
import { TagData } from '../commands/tag';
import { BranchData } from '../commands/branch';
import './Reference.scss';

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
          <span className="reference" key={ref.name}>
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
