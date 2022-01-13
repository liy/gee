import Graph from './Graph';

class GraphStore {
  map: Map<string, Graph>;
  constructor() {
    this.map = new Map<string, Graph>();
  }

  getGraph(id: string): Graph {
    let graph = this.map.get(id);
    if (!graph) {
      graph = new Graph();
      this.map.set(id, graph);
    }

    return graph;
  }

  removeGraph(id: string): boolean {
    return this.map.delete(id);
  }
}

export default new GraphStore();
