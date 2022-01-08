import { LogEntry } from './store';

export type Update = {
  type: 'update';
  logs: LogEntry[];
};
