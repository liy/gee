import { Hash } from './@types/git';

let counter = 0;
const ids = new Set<string>();

export default {
  hash(): Hash {
    const hash = (counter++).toString();
    this.add(hash);
    return hash;
  },

  add(id: string): void {
    ids.add(id);
  },

  remove(id: string): void {
    ids.delete(id);
  },

  isFake(id: string | Hash): boolean {
    return ids.has(id);
  },

  clear(): void {
    ids.clear();
  },
};
