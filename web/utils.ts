import { Hash } from './@types/git';

let counter = 0;
export function fakeHash(): Hash {
  return (counter++).toString();
}

export function createDebounce(milliseconds: number): (overrideMilliseconds?: number) => Promise<unknown> {
  {
    let id = 0;
    return (overrideMilliseconds?: number) => {
      clearTimeout(id);
      return new Promise((resolve) => {
        id = window.setTimeout(resolve, milliseconds || overrideMilliseconds);
      });
    };
  }
}
