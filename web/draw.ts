import { Hash } from './@types/git';
import Simulator, { SimType } from './Simulator';

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

  readonly simType: SimType;

  constructor(startVertex?: Vertex, simType = SimType.NORMAL) {
    this.vertices = [];
    this.simType = simType;

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

/**
 * Keep track of lines for branch drawing purpose
 */
export class LineArray extends Array<Line> {
  currentLine!: Line;

  /**
   * Force to start a new line section, and use it as current line
   * @param x vertex x
   * @param y vertex y
   * @param hash node hash
   */
  start(x: number, y: number, hash: Hash): void {
    this.currentLine = new Line(new Vertex(x, y), Simulator.getType(hash));
    this.push(this.currentLine);
  }
  /**
   * Track and create a new line section if node's fake attribute has changed.
   * current line will be updated if node is a fake node.
   * e.g., if the current line is fake line, but current node is now real. We need a separated line section in order to
   * represent the real line, so that we can draw real and fake separately with different styles
   * @param x node x
   * @param y node y
   * @param hash Node hash
   */
  node(x: number, y: number, hash: Hash): void {
    const simType = Simulator.getType(hash);
    // If fakeness changed compare to the current active line, then create a new line section
    // Note that the current line end properly and the new line start position also starts from same position.
    if (simType !== this.currentLine.simType) {
      this.currentLine.add(x, y);

      this.currentLine = new Line(new Vertex(x, y), simType);
      this.push(this.currentLine);
    }
  }

  /**
   * Force insert a vertex into current line
   * @param x vertex x
   * @param y vertex y
   */
  vertex(x: number, y: number): void {
    this.currentLine.add(x, y);
  }
}
