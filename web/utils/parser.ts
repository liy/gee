const parser = new DOMParser();
export function createNodeFactory(html: string): (deepClone: boolean) => Node {
  const node = parser.parseFromString(html, 'text/html').body;
  return (deepClone: boolean) => {
    return node.cloneNode(deepClone);
  };
}

export function createElement<T extends HTMLElement>(tagName: string, is: string): T {
  return document.createElement(tagName, { is }) as unknown as T;
}
