import React, { FC } from 'react';

export interface Props {
  title: string;
}

export const PromptBase: FC<Props> = ({ title, children }) => {
  return (
    <div>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
};
