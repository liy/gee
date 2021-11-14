import { ILineStyleOptions } from 'pixi.js';

const GraphStyle = {
  laneWidth: 12,
  sliceHeight: 24,
  maxLanes: 10,
  padding: {
    top: 0,
    bottom: 0,
    left: 2,
    right: 2,
  },
  thicknesses: [3, 1],
  alphas: [0.8, 1],
  node: {
    outline: {
      width: 2,
      color: 0,
      alpha: 0.6,
      alignment: 1,
      native: true,
    },
    radius: 2.5,
  },
  line: {
    colours: [
      0xf44336, 0x9c27b0, 0x2196f3, 0x00bcd4, 0x4caf50, 0xcddc39, 0xffc107, 0xff5722, 0x795548, 0x9e9e9e, 0x607d8b,
    ],
    outlineColour: 0x292a2d,
  },

  getLineColour(laneIndex: number, isOutline: boolean): number {
    if (isOutline) {
      return this.line.outlineColour;
    }
    laneIndex = laneIndex % this.line.colours.length;
    return this.line.colours[laneIndex];
  },

  getGraphWidth(totalLanes: number) {
    const n = Math.min(totalLanes, this.maxLanes);
    return this.padding.left + this.padding.right + this.laneWidth * n;
  },

  getArcRadius() {
    return Math.min(GraphStyle.laneWidth, GraphStyle.sliceHeight) * 0.6;
  },
};

export default GraphStyle;
