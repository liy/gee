import { Hash } from './@types/git';

export enum SimType {
  NORMAL,
  ADD,
  REMOVE,
  MOVE,
}

let counter = 0;
const ids = new Map<string, SimType>();

export default {
  hash(): Hash {
    const hash = (counter++).toString();
    this.added(hash);
    return hash;
  },

  moved(id: string): void {
    ids.set(id, SimType.MOVE);
  },

  /**
   * Simulate an added item
   * @param id string
   */
  added(id: string): void {
    ids.set(id, SimType.ADD);
  },

  /**
   * Simulate a removed item
   * @param id string
   */
  removed(id: string): void {
    ids.set(id, SimType.REMOVE);
  },

  /**
   * Stop a simulated item.
   * @param id string
   */
  stop(id: string): void {
    ids.delete(id);
  },

  /**
   * Get the simulation type of an item.
   * @param id string
   * @returns Simulation type, if not simulated, SimType.NORMAL will be returned
   */
  getType(id: string): SimType {
    const type = ids.get(id);
    return type || SimType.NORMAL;
  },

  /**
   * Whether the item is simulated
   * @param id string
   * @returns True if the item is simulated
   */
  isSimulated(id: string | Hash): boolean {
    return ids.has(id);
  },
};
