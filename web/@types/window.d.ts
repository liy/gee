import { Repository__Output } from 'protobuf/pb/Repository';
import { CommandCallback } from '../CommandRoute';
import { TagData } from '../commands/tag';

export type Hash = string;

type Notification = { title: string; data: any };

// Maps custom event data with event name
interface ListenerMap {
  'tag-click': CustomEvent<TagData>;
}

// Custom element that include data
interface DataElement<T> {
  set data(data: T);
  get data(): T;
}

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
      submitCommand: (args: Array<string>, callback: CommandCallback) => void;
    };
  }

  interface Document {
    //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof ListenerMap>(
      type: K,
      listener: (this: Document, ev: ListenerMap[K]) => void
    ): void;

    // For easy creating custom component
    createElement<T>(tagName: string): T;
  }
}
