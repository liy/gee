export function createDebounce(milliseconds: number) {
  {
    let id = 0;
    return (callback: (...args: any[]) => unknown) => {
      clearTimeout(id);

      // @ts-ignore
      id = setTimeout(callback, milliseconds);
    };
  }
}

export function createThrottle(milliseconds: number) {
  {
    let id = 0;
    let blocked = false;
    return (callback: () => unknown) => {
      clearTimeout(id);

      if (!blocked) {
        blocked = true;
        callback();
      }

      // @ts-ignore
      id = setTimeout(() => {
        blocked = false;
      }, milliseconds);
    };
  }
}

const parser = new DOMParser();
export function createNode(html: string): Node {
  return parser.parseFromString(html, 'text/html').body.firstChild!;
}
