/* eslint-disable no-constant-condition */
import { install } from '@pixi/unsafe-eval';
import * as PIXI from 'pixi.js';
import { Container, Graphics, ParticleContainer, Renderer, Sprite, Texture, Ticker } from 'pixi.js';
import { LayoutResult } from '../../layouts/StraightLayout';
import { SimType } from '../../Simulator';
import './graph.css';
import GraphStyle from './GraphStyle';
// Apply the patch to PIXI
install(PIXI);
import Stats from 'stats.js';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;
PIXI.settings.RESOLUTION = window.devicePixelRatio;

class GraphView {
  private layoutResult!: LayoutResult;

  private lineGraphics!: Graphics;

  private nodeContainer!: ParticleContainer;

  private arcRadius!: number;
  private canvasWidth!: number;

  private nodeTexture!: Texture;

  container!: Container;

  private strap: Graphics;

  initialized: boolean;

  private renderer!: Renderer;

  constructor() {
    this.strap = new Graphics();
    this.initialized = false;
  }

  display(layoutResult: LayoutResult) {
    this.layoutResult = layoutResult;

    const scrollbar = document.querySelector<HTMLElement>('.scrollbar-y')!;
    const canvas = document.querySelector<HTMLCanvasElement>('.graph')!;

    const smoothScroll = false;

    this.arcRadius = GraphStyle.getArcRadius();
    this.canvasWidth = GraphStyle.getGraphWidth(layoutResult.totalLanes);

    if (!this.initialized) {
      this.lineGraphics = new Graphics();

      const stats = new Stats();
      stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(stats.dom);
      stats.dom.style.left = 'unset';
      stats.dom.style.right = '80px';

      this.strap.beginFill(0x3875af, 0.2);
      this.strap.drawRect(0, -GraphStyle.sliceHeight / 2, this.canvasWidth, GraphStyle.sliceHeight);
      this.strap.endFill();
      this.strap.visible = false;

      this.renderer = new Renderer({
        view: canvas,
        width: this.canvasWidth,
        height: window.innerHeight,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
      });

      const stage = new Container();
      this.container = new Container();
      stage.addChild(this.container);

      this.container.addChild(this.strap);
      this.container.addChild(this.lineGraphics);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      scrollbar.addEventListener('scroll', (e) => {
        this.container.y = -scrollbar.scrollTop;
      });

      if (!smoothScroll) {
        scrollbar.addEventListener(
          'wheel',
          (e) => {
            e.preventDefault();

            // snap to the row
            scrollbar.scrollTop -= scrollbar.scrollTop % GraphStyle.sliceHeight;
            // scroll 3 rows per delta
            scrollbar.scrollTop += Math.sign(e.deltaY) * 3 * GraphStyle.sliceHeight;
            this.container.y = -scrollbar.scrollTop;
          },
          { passive: false }
        );
      }

      canvas.style.height = window.innerHeight + 'px';
      scrollbar.style.height = window.innerHeight + 'px';
      window.addEventListener('resize', (e) => {
        canvas.style.height = window.innerHeight + 'px';
        this.renderer.resize(this.canvasWidth, window.innerHeight);
        scrollbar.style.height = window.innerHeight + 'px';
      });

      const ticker = new Ticker();
      ticker.add(() => {
        stats.begin();
        this.renderer.render(stage);
        stats.end();
      });
      ticker.start();

      const nodeGraphics = new Graphics();
      nodeGraphics.lineStyle(GraphStyle.node.outline);
      nodeGraphics.beginFill(0xffffff, 1);
      // nodeGraphics.drawCircle(0, 0, GraphStyle.node.radius);
      nodeGraphics.drawRect(
        -GraphStyle.node.radius,
        -GraphStyle.node.radius,
        GraphStyle.node.radius * 2,
        GraphStyle.node.radius * 2
      );
      nodeGraphics.endFill();
      this.nodeTexture = this.renderer.generateTexture(nodeGraphics);

      this.initialized = true;
    } else {
      this.renderer.resize(this.canvasWidth, window.innerHeight);
    }

    this.update(layoutResult);
  }

  update(layoutResult: LayoutResult): void {
    this.layoutResult = layoutResult;
    const { syncLines, nodes, branchLines } = layoutResult;

    this.lineGraphics.clear();

    // Draw outline of the lines
    const thickness = GraphStyle.thicknesses;
    const alphas = GraphStyle.alphas;
    for (const { vertices, simType } of branchLines) {
      for (let i = 0; i < 2; ++i) {
        let lineColour = GraphStyle.getLineColour(vertices[1].x, i === 0);

        this.lineGraphics.lineStyle(thickness[i], lineColour, simType === SimType.ADD ? 0.3 : alphas[i], 0.5, i !== 0);
        if (vertices.length === 2) {
          this.lineGraphics.moveTo(
            this.canvasWidth -
              (vertices[0].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[0].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
          );
          this.lineGraphics.lineTo(
            this.canvasWidth -
              (vertices[1].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[1].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
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
              this.canvasWidth -
                (vertices[0].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
              vertices[0].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
            );
            this.lineGraphics.arcTo(
              this.canvasWidth -
                (vertices[1].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
              vertices[1].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5,

              this.canvasWidth -
                (vertices[1].x * GraphStyle.laneWidth +
                  GraphStyle.laneWidth * 0.5 +
                  GraphStyle.padding.right +
                  this.arcRadius * Math.sign(vertices[2].x - vertices[1].x - 0.5)),
              vertices[1].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5,
              this.arcRadius
            );
            this.lineGraphics.lineTo(
              this.canvasWidth -
                (vertices[2].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
              vertices[2].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
            );
          }
          // __   __
          //   | |
          else {
            this.lineGraphics.moveTo(
              this.canvasWidth -
                (vertices[0].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
              vertices[0].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
            );
            this.lineGraphics.arcTo(
              this.canvasWidth -
                (vertices[1].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
              vertices[1].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5,

              this.canvasWidth -
                (vertices[1].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
              vertices[1].y * GraphStyle.sliceHeight +
                GraphStyle.sliceHeight * 0.5 +
                GraphStyle.padding.top +
                this.arcRadius -
                0.5,
              this.arcRadius
            );
            this.lineGraphics.lineTo(
              this.canvasWidth -
                (vertices[2].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
              vertices[2].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
            );
          }
        } else if (vertices.length == 4) {
          this.lineGraphics.moveTo(
            this.canvasWidth -
              (vertices[0].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[0].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
          );
          this.lineGraphics.arcTo(
            this.canvasWidth -
              (vertices[1].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[1].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5,

            this.canvasWidth -
              (vertices[1].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[1].y * GraphStyle.sliceHeight +
              GraphStyle.sliceHeight * 0.5 +
              GraphStyle.padding.top +
              this.arcRadius -
              0.5,
            this.arcRadius
          );
          this.lineGraphics.arcTo(
            this.canvasWidth -
              (vertices[2].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[2].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5,

            this.canvasWidth -
              (vertices[2].x * GraphStyle.laneWidth +
                GraphStyle.laneWidth * 0.5 +
                GraphStyle.padding.right +
                this.arcRadius * Math.sign(vertices[3].x - vertices[2].x - 0.5)),
            vertices[2].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5,
            this.arcRadius
          );
          this.lineGraphics.lineTo(
            this.canvasWidth -
              (vertices[3].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[3].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
          );
        }
      }
    }

    for (const { vertices, simType } of syncLines) {
      for (let i = 0; i < 2; ++i) {
        // let laneColour = 0x292a2d;
        // if (i === 0) {
        //   const index = vertices[vertices.length - 1].x % GraphStyle.laneColours.length;
        //   laneColour = GraphStyle.laneColours[index];
        // }

        let lineColour = GraphStyle.getLineColour(vertices[vertices.length - 1].x, i === 0);

        this.lineGraphics.lineStyle(thickness[i], lineColour, simType === SimType.ADD ? 0.3 : alphas[i], 0.5, i !== 0);
        if (vertices.length === 3) {
          this.lineGraphics.moveTo(
            this.canvasWidth -
              (vertices[0].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[0].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
          );
          this.lineGraphics.arcTo(
            this.canvasWidth -
              (vertices[1].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[1].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5,

            this.canvasWidth -
              (vertices[1].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[1].y * GraphStyle.sliceHeight +
              GraphStyle.sliceHeight * 0.5 +
              GraphStyle.padding.top +
              this.arcRadius -
              0.5,
            this.arcRadius
          );
          this.lineGraphics.lineTo(
            this.canvasWidth -
              (vertices[2].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[2].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
          );
        } else if (vertices.length == 4) {
          this.lineGraphics.moveTo(
            this.canvasWidth -
              (vertices[0].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[0].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
          );
          this.lineGraphics.arcTo(
            this.canvasWidth -
              (vertices[1].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[1].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5,

            this.canvasWidth -
              (vertices[1].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[1].y * GraphStyle.sliceHeight +
              GraphStyle.sliceHeight * 0.5 +
              GraphStyle.padding.top +
              this.arcRadius -
              0.5,
            this.arcRadius
          );
          this.lineGraphics.arcTo(
            this.canvasWidth -
              (vertices[2].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[2].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5,

            this.canvasWidth -
              (vertices[2].x * GraphStyle.laneWidth +
                GraphStyle.laneWidth * 0.5 +
                GraphStyle.padding.right +
                this.arcRadius * Math.sign(vertices[3].x - vertices[2].x) -
                0.5),
            vertices[2].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5,
            this.arcRadius
          );
          this.lineGraphics.lineTo(
            this.canvasWidth -
              (vertices[3].x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5),
            vertices[3].y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top - 0.5
          );
        }
      }
    }

    if (this.nodeContainer) {
      this.container.removeChild(this.nodeContainer);
      this.nodeContainer.destroy({ children: true });
    }
    this.nodeContainer = new ParticleContainer(
      layoutResult.nodes.length,
      { tint: true },
      layoutResult.nodes.length,
      false
    );
    this.container.addChild(this.nodeContainer);

    for (const node of nodes) {
      const sprite = new Sprite(this.nodeTexture);
      this.nodeContainer.addChild(sprite);
      sprite.x =
        this.canvasWidth -
        (node.x * GraphStyle.laneWidth + GraphStyle.laneWidth * 0.5 + GraphStyle.padding.right - 0.5);
      sprite.y = node.y * GraphStyle.sliceHeight + GraphStyle.sliceHeight * 0.5 + GraphStyle.padding.top;
      sprite.anchor.set(0.5, 0.5);
      sprite.tint = GraphStyle.getLineColour(node.x, false);
    }
  }

  updateNode(data: any) {
    const { previousIndex, index } = data;
    const { nodes } = this.layoutResult;
    const lastSprite = this.nodeContainer.getChildAt(previousIndex) as Sprite;
    if (lastSprite) {
      // lastSprite.tint = GraphStyle.laneColours[nodes[previousIndex].x % GraphStyle.laneColours.length];
      lastSprite.tint = GraphStyle.getLineColour(nodes[previousIndex].x, false);
    }

    const sprite = this.nodeContainer.getChildAt(index) as Sprite;
    sprite.tint = 0xffffff;

    this.strap.visible = true;
    this.strap.y = sprite.y;
  }
}

export default new GraphView();
