import { LogEntry } from './store';

export type Update = {
  type: 'update';
  logs: LogEntry[];
};

export type SelectLog = {
  type: 'selectLog';
  log: LogEntry;
};
