import { gee } from './gee';

declare global {
  interface Window {
    api: {
      rendererReady: () => void;
      send: (event: gee.Event) => void;
      onReceive: (callback: (event: gee.Event) => void) => void;
    };
  }
}
