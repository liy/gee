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
