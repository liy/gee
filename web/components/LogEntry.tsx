import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../store';
import { Commit } from './Commit';
import { SimulatedCommit } from './SimulatedCommit';

export type Props = {
  log: Log;
};

export const LogEntry: FC<Props> = ({ log }) => {
  const gitState = useSelector((state: AppState) => state.gitState);

  return log.simulation ? <SimulatedCommit log={log}></SimulatedCommit> : <Commit log={log}></Commit>;
};
