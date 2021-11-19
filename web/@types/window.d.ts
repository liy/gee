import { Repository__Output } from 'protobuf/pb/Repository';

export type Hash = string;

type Notification = { title: string; data: any };

// type SubmitCommandContext = {};

declare global {
  interface Window {
    api: {
      // Ask main to open a repository
      openRepository: (path: string) => Promise<Repository__Output>;

      // Main send a notification message
      onNotification: (callback: (data: Notification) => void) => void;
      // Triggered when user open repository from command line
      onOpenRepository: (callback: (data: Repository__Output) => void) => void;

      // Directly invoke a command and expect the whole output in a promise. Suitable for small output.
      invokeCommand: (cmd: Array<string>) => Promise<string>;

      // Submit a comand and listens on the command output line by line
      submitCommand: (args: Array<string>, callback: (line: string) => void) => void;
    };
  }
}
