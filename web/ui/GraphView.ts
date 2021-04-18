/* eslint-disable no-constant-condition */
import { Container, Graphics, Ticker, Renderer, Texture, Sprite } from 'pixi.js';
import * as PIXI from '@pixi/core';
import { install } from '@pixi/unsafe-eval';
// Apply the patch to PIXI
install(PIXI);
import Stats from 'stats.js';
import '../styles.css';

import { LayoutResult } from '../layouts/StraightLayout';
import CommitManager from './CommitManager';
import Simulator, { SimType } from '../Simulator';

const laneColours = [
  0xf44336,
  0x9c27b0,
  0x2196f3,
  0x00bcd4,
  0x4caf50,
  0xcddc39,
  0xffc107,
  0xff5722,
  0x795548,
  0x9e9e9e,
  0x607d8b,
];

export function getColour(x: number): number {
  const index = x % laneColours.length;
  return laneColours[index];
}

class GraphView {
  private layoutResult!: LayoutResult;

  private lineGraphics!: Graphics;

  private nodeContainer!: Container;

  private laneWidth!: number;
  private sliceHeight!: number;
  private px!: number;
  private py!: number;
  private radius!: number;
  private canvasWidth!: number;

  private nodeTexture!: Texture;

  container!: Container;

  private strap: Graphics;

  initialized: boolean;

  constructor() {
    this.strap = new Graphics();
    this.initialized = false;
  }

  init(layoutResult: LayoutResult) {
    this.layoutResult = layoutResult;

    if (!this.initialized) {
      this.lineGraphics = new Graphics();
      this.nodeContainer = new Container();

      const stats = new Stats();
      stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(stats.dom);
      stats.dom.style.left = 'unset';
      stats.dom.style.right = '0';

      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      const graph = document.getElementById('graph') as HTMLCanvasElement;

      this.laneWidth = 14;
      this.sliceHeight = 24;
      this.px = 4;
      this.py = 0;
      this.radius = Math.min(this.laneWidth, this.sliceHeight) * 0.5;
      this.canvasWidth = this.px * 2 + this.laneWidth * layoutResult.maxLanes;

      this.strap.beginFill(0x3875af, 0.2);
      this.strap.drawRect(0, -this.sliceHeight / 2, this.canvasWidth, this.sliceHeight);
      this.strap.endFill();
      this.strap.visible = false;

      const renderer = new Renderer({
        view: canvas,
        width: this.canvasWidth,
        height: window.innerHeight,
        antialias: true,
      });

      const stage = new Container();
      this.container = new Container();
      stage.addChild(this.container);

      this.container.addChild(this.strap);
      this.container.addChild(this.lineGraphics);
      this.container.addChild(this.nodeContainer);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const rootElement = document.getElementById('root')!;
      rootElement.addEventListener('scroll', (e) => {
        this.container.y = -rootElement.scrollTop;
      });

      document.addEventListener(
        'wheel',
        (e) => {
          e.preventDefault();

          rootElement.scrollTop += Math.sign(e.deltaY) * 3 * this.sliceHeight;
          this.container.y = -rootElement.scrollTop;
        },
        { passive: false }
      );

      graph.style.height = window.innerHeight + 'px';
      window.addEventListener('resize', (e) => {
        graph.style.height = window.innerHeight + 'px';
        renderer.resize(this.canvasWidth, window.innerHeight);
        rootElement.style.height = window.innerHeight + 'px';
      });

      const ticker = new Ticker();
      ticker.add(() => {
        stats.begin();
        renderer.render(stage);
        stats.end();
      });
      ticker.start();

      const nodeGraphics = new Graphics();
      nodeGraphics.lineStyle(2, 0, 0.6, 1);
      nodeGraphics.beginFill(0xffffff, 1);
      nodeGraphics.drawCircle(0, 0, 4);
      nodeGraphics.endFill();
      this.nodeTexture = renderer.generateTexture(nodeGraphics);

      CommitManager.on('selected', this.updateNode, this);

      this.initialized = true;
    }

    this.update(layoutResult);
  }

  update(layoutResult: LayoutResult): void {
    this.layoutResult = layoutResult;
    const { syncLines, nodes, branchLines } = layoutResult;

    this.lineGraphics.clear();
    this.nodeContainer.removeChildren();

    // Draw outline of the lines
    const thickness = [6, 2];
    const alphas = [0.6, 1];
    for (const { vertices, simType } of branchLines) {
      for (let i = 0; i < 2; ++i) {
        let colour = 0;
        if (i === 1) {
          const index = vertices[1].x % laneColours.length;
          colour = laneColours[index];
        }
        this.lineGraphics.lineStyle(thickness[i], colour, simType === SimType.ADD ? 0.3 : alphas[i]);
        if (vertices.length === 2) {
          this.lineGraphics.moveTo(
            vertices[0].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[0].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
          );
          this.lineGraphics.lineTo(
            vertices[1].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[1].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
          );
        }
        // either be :
        // __| |__
        // or
        // __   __
        //   | |
        else if (vertices.length === 3) {
          // __| |__
          if (vertices[0].x === vertices[1].x) {
            this.lineGraphics.moveTo(
              vertices[0].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
              vertices[0].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
            );
            this.lineGraphics.arcTo(
              vertices[1].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
              vertices[1].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py,
              vertices[1].x * this.laneWidth +
                this.laneWidth * 0.5 +
                this.px +
                this.radius * Math.sign(vertices[2].x - vertices[1].x),
              vertices[1].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py,
              this.radius
            );
            this.lineGraphics.lineTo(
              vertices[2].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
              vertices[2].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
            );
          }
          // __   __
          //   | |
          else {
            this.lineGraphics.moveTo(
              vertices[0].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
              vertices[0].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
            );
            this.lineGraphics.arcTo(
              vertices[1].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
              vertices[1].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py,
              vertices[1].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
              vertices[1].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py + this.radius,
              this.radius
            );
            this.lineGraphics.lineTo(
              vertices[2].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
              vertices[2].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
            );
          }
        } else if (vertices.length == 4) {
          this.lineGraphics.moveTo(
            vertices[0].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[0].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
          );
          this.lineGraphics.arcTo(
            vertices[1].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[1].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py,
            vertices[1].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[1].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py + this.radius,
            this.radius
          );
          this.lineGraphics.arcTo(
            vertices[2].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[2].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py,
            vertices[2].x * this.laneWidth +
              this.laneWidth * 0.5 +
              this.px +
              this.radius * Math.sign(vertices[3].x - vertices[2].x),
            vertices[2].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py,
            this.radius
          );
          this.lineGraphics.lineTo(
            vertices[3].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[3].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
          );
        }
      }
    }

    for (const { vertices, simType } of syncLines) {
      for (let i = 0; i < 2; ++i) {
        let colour = 0;
        if (i === 1) {
          const index = vertices[vertices.length - 1].x % laneColours.length;
          colour = laneColours[index];
        }

        this.lineGraphics.lineStyle(thickness[i], colour, simType === SimType.ADD ? 0.3 : alphas[i]);
        if (vertices.length === 3) {
          this.lineGraphics.moveTo(
            vertices[0].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[0].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
          );
          this.lineGraphics.arcTo(
            vertices[1].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[1].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py,
            vertices[1].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[1].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py + this.radius,
            this.radius
          );
          this.lineGraphics.lineTo(
            vertices[2].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[2].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
          );
        } else if (vertices.length == 4) {
          this.lineGraphics.moveTo(
            vertices[0].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[0].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
          );
          this.lineGraphics.arcTo(
            vertices[1].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[1].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py,
            vertices[1].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[1].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py + this.radius,
            this.radius
          );
          this.lineGraphics.arcTo(
            vertices[2].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[2].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py,
            vertices[2].x * this.laneWidth +
              this.laneWidth * 0.5 +
              this.px +
              this.radius * Math.sign(vertices[3].x - vertices[2].x),
            vertices[2].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py,
            this.radius
          );
          this.lineGraphics.lineTo(
            vertices[3].x * this.laneWidth + this.laneWidth * 0.5 + this.px,
            vertices[3].y * this.sliceHeight + this.sliceHeight * 0.5 + this.py
          );
        }
      }
    }

    for (const node of nodes) {
      const sprite = new Sprite(this.nodeTexture);
      this.nodeContainer.addChild(sprite);
      sprite.x = node.x * this.laneWidth + this.laneWidth * 0.5 + this.px;
      sprite.y = node.y * this.sliceHeight + this.sliceHeight * 0.5 + this.py;
      sprite.anchor.set(0.5, 0.5);
      sprite.tint = laneColours[node.x % laneColours.length];

      if (Simulator.isSimulated(node.hash)) {
        sprite.alpha = 0.5;
      }
    }
  }

  updateNode(data: any) {
    const { previousIndex, index } = data;
    const { nodes } = this.layoutResult;
    const lastSprite = this.nodeContainer.getChildAt(previousIndex) as Sprite;
    if (lastSprite) {
      lastSprite.tint = laneColours[nodes[previousIndex].x % laneColours.length];
    }

    const sprite = this.nodeContainer.getChildAt(index) as Sprite;
    sprite.tint = 0xffffff;

    this.strap.visible = true;
    this.strap.y = sprite.y;
  }
}

export default new GraphView();
