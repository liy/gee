import { Hash } from './graph/Graph';

let counter = 0;
export function fakeHash(): Hash {
  return (counter++).toString();
}

export function createDebounce(seconds: number): () => Promise<unknown> {
  {
    let id = 0;
    return () => {
      clearTimeout(id);
      return new Promise((resolve) => {
        id = window.setTimeout(resolve, seconds);
      });
    };
  }
}
