import { CommandCallback, CallbackID } from '../constants';
import { CustomEventMap } from './event';

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
      appReady(): void;
      // Ask main to open a repository
      // openRepository: (path: string) => Promise<Repository__Output>;
      // Main send a notification message
      // Triggered when user open repository from command line
      // onOpenRepository: (callback: (data: Repository__Output) => void) => void;
      logDefaultRepository(callback: CommandCallback): boolean;

      getWorkingDirectory(): Promise<string | null>;

      setWorkingDirectory(path: string): Promise<unknown>;

      onWorkingDirectoryChanged(callback: (path: string) => void): void;

      onFileSysChanged(callback: () => void): void;

      onIndexChanged(callbck: () => void): void;

      onNotification: (callback: (data: Notification) => void) => void;

      readFileLine: (path: string, callback: CommandCallback, workingDirectory: string) => void;

      readFile: (path: string, workingDirectory: string) => Promise<ArrayBuffer>;

      saveFile: (path: string, text: string, workingDirectory: string) => Promise<string>;
    };
    command: {
      // Directly invoke a command and expect the whole output in a promise. Suitable for small output.
      invoke: (cmd: Array<string>, workingDirectory: string) => Promise<string>;
      // Submit a comand and listens on the command output line by line
      submit(args: Array<string>, workingDirectory: string, callback: CommandCallback): void;
      // Force kill a git command process
      kill: (routeId: CallbackID) => void;
      // launch gee from command line
      onCommand(callback: (cmd: string[]) => void): void;
    };
  }

  interface Document {
    //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEvent<CustomEventMap[K]>) => void
    ): void;

    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEvent<CustomEventMap[K]>) => void
    ): void;
  }

  interface HTMLDivElement {
    //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEvent<CustomEventMap[K]>) => void
    ): void;
  }
}
