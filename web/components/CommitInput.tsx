import React, { FC, useEffect, useRef } from 'react';
import './CommitInput.scss';

export type Props = {
  show: boolean;
  onHeightChange: (value: number) => void;
};

export const CommitInput: FC<Props> = ({ show, onHeightChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      onHeightChange(ref.current.getBoundingClientRect().height + 24);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="commit-input-container">
      <h3>commit message</h3>
      <div
        ref={ref}
        contentEditable
        className="commit-input"
        onInput={(e) => onHeightChange(e.currentTarget.getBoundingClientRect().height + 24)}
      ></div>
    </div>
  );
};
