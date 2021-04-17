import Node from './graph/Node';

export class Vertex {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Line {
  vertices: Vertex[];

  readonly fake: boolean;

  constructor(startVertex?: Vertex, fake = false) {
    this.vertices = [];
    this.fake = fake;

    if (startVertex) {
      this.vertices.push(startVertex);
    }
  }

  /**
   * Form a line by adding vertices. Note this method only add vertex if the line direction has changed.
   * This is to simplify line drawing.
   * @param x vertex x
   * @param y vertex y
   * @returns Whether the vertex is added into the line or not
   */
  add(x: number, y: number): void {
    this.vertices.push(new Vertex(x, y));
  }
}
