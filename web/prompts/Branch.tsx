import React, { FC } from 'react';
import { BranchData } from '../commands/branch';
import '../components-old/Commit.css';

export type Props = {
  branches: BranchData[];
};

export const BranchPrompt: FC<Props> = ({ branches }) => {
  console.log(branches);
  return (
    <div className="branch-prompt">
      {branches?.map((branch) => (
        <span key={branch.name}>{branch.shorthand}</span>
      ))}
    </div>
  );
};

export type BranchAction = {
  type: 'command.branch';
  // Prompt information
  prompt: {
    component: React.FC<Props>;
    props: {
      key: string;
      branches: BranchData[];
    };
  };
};
