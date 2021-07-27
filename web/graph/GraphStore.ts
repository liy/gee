import Graph from './Graph';

class GraphStore {
  map: Map<string, Graph>;
  constructor() {
    this.map = new Map<string, Graph>();
  }

  createGraph(id: string): Graph {
    const graph = new Graph();
    this.map.set(id, graph);
    return graph;
  }

  getGraph(id: string): Graph | undefined {
    return this.map.get(id);
  }

  removeGraph(id: string): boolean {
    return this.map.delete(id);
  }
}

export default new GraphStore();
