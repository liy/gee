import React, { FC } from 'react';
import './LogCommit.scss';

export type Props = {
  onSubmit: (message: string) => void;
};

export const LogCommit: FC<Props> = ({ onSubmit }) => {
  return (
    <div className="log-commit">
      <div
        contentEditable
        className="commit-input"
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 'enter') {
            onSubmit(e.currentTarget.innerText);
          }
        }}
      ></div>
    </div>
  );
};
