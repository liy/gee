import { Repository__Output } from 'protobuf/pb/Repository';

export type Hash = string;

type Notification = { title: string; data: any };

declare global {
  interface Window {
    api: {
      // Ask main to open a repository
      openRepository: (path: string) => Promise<Repository__Output>;
      // Main send a notification message
      onNotification: (callback: (data: Notification) => void) => void;
    };
  }
}
