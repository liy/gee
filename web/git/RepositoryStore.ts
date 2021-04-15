import Repository from './Repository';

class RepositoryStore {
  private map = new Map<string, Repository>();

  private _current!: Repository;

  addRepository(repo: Repository): void {
    this.map.set(repo.id, repo);
  }

  getRepository(id: string): Repository | undefined {
    return this.map.get(id);
  }

  use(id: string): void {
    if (!this.map.has(id)) throw new Error(`Repository ${id} does not exist.`);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._current = this.map.get(id)!;
  }

  get current(): Repository {
    return this._current;
  }
}

export default new RepositoryStore();