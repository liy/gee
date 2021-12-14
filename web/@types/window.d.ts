import { Repository__Output } from '../../src/protobuf/pb/Repository';
import { CommandCallback, CallbackID } from '../constants';
import { EventMap } from './event';

export type Hash = string;

type Notification = { title: string; data: any };

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
      //
      readFileLine: (path: string, callback: CommandCallback) => void;

      readFile: (path: string) => Promise<ArrayBuffer>;
    };
    command: {
      // Directly invoke a command and expect the whole output in a promise. Suitable for small output.
      invoke: (cmd: Array<string>) => Promise<string>;
      // Submit a comand and listens on the command output line by line
      submit: (args: Array<string>, callback: CommandCallback) => void;
      // Force kill a git command process
      kill: (routeId: CallbackID) => void;
    };
  }

  interface Document {
    //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof EventMap>(
      type: K,
      listener: (this: Document, ev: CustomEvent<EventMap[K]>) => void
    ): void;
  }

  interface HTMLDivElement {
    //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof EventMap>(
      type: K,
      listener: (this: Document, ev: CustomEvent<EventMap[K]>) => void
    ): void;
  }
}
