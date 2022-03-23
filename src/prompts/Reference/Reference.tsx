import React, { FC } from 'react';
import { PromptBase } from 'prompts/PromptBase';

export interface Props {
  branches: string[];
  targetHash: string;
}

export const Reference: FC<Props> = ({ branches, targetHash }) => {
  return (
    <PromptBase title="branch">
      {branches.map((b) => (
        <span
          onClick={(e) => {
            console.log('navigate to', targetHash);
          }}
        >
          {b}
        </span>
      ))}
    </PromptBase>
  );
};
