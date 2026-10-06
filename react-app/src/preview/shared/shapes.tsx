import type { ReactNode } from 'react';
import type { Rect } from '../types';

export interface CornerRadii {
  lt: number;
  rt: number;
  lb: number;
  rb: number;
}

export interface TileOptions {
  /** Uniform corner radius (rectangleRounded / rectangleRoundedByPixel). */
  radius?: number;
  /** Per-corner radii when `rectangleRoundedCurveCustomStyle` is on. */
  radii?: CornerRadii;
  /** Snip size for the tab shapes (px). */
  snip?: number;
}

/** Path of a rectangle with individual corner radii. */
export function roundedRectPath(rc: Rect, radii: CornerRadii): string {
  const { x, y, width: w, height: h } = rc;
  const m = Math.min(w, h) / 2;
  const lt = Math.min(radii.lt, m), rt = Math.min(radii.rt, m), lb = Math.min(radii.lb, m), rb = Math.min(radii.rb, m);
  return `M${x + lt},${y} H${x + w - rt} ${rt ? `A${rt},${rt} 0 0 1 ${x + w},${y + rt}` : ''} V${y + h - rb} ${rb ? `A${rb},${rb} 0 0 1 ${x + w - rb},${y + h}` : ''} H${x + lb} ${lb ? `A${lb},${lb} 0 0 1 ${x},${y + h - lb}` : ''} V${y + lt} ${lt ? `A${lt},${lt} 0 0 1 ${x + lt},${y}` : ''} Z`;
}

/** SVG element for a Power BI tile shape (buttons, shapes, card visual, button slicer). */
export function tilePath(shape: string, rc: Rect, opts: TileOptions = {}): ReactNode {
  const { x, y, width: w, height: h } = rc;
  const r = Math.min(opts.radius ?? 0, w / 2, h / 2);
  const snip = Math.min(opts.snip ?? Math.min(w, h) * 0.2, w / 2, h / 2);
  switch (shape) {
    case 'oval':
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} />;
    case 'pill':
      return <rect x={x} y={y} width={w} height={h} rx={Math.min(w, h) / 2} />;
    case 'triangleIsoc':
      return <polygon points={`${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`} />;
    case 'triangleRight':
      return <polygon points={`${x},${y} ${x + w},${y + h} ${x},${y + h}`} />;
    case 'parallelogram':
      return <polygon points={`${x + w * 0.2},${y} ${x + w},${y} ${x + w * 0.8},${y + h} ${x},${y + h}`} />;
    case 'trapezoid':
      return <polygon points={`${x + w * 0.2},${y} ${x + w * 0.8},${y} ${x + w},${y + h} ${x},${y + h}`} />;
    case 'pentagon':
      return <polygon points={`${x + w / 2},${y} ${x + w},${y + h * 0.38} ${x + w * 0.82},${y + h} ${x + w * 0.18},${y + h} ${x},${y + h * 0.38}`} />;
    case 'hexagon':
      return <polygon points={`${x + w * 0.25},${y} ${x + w * 0.75},${y} ${x + w},${y + h / 2} ${x + w * 0.75},${y + h} ${x + w * 0.25},${y + h} ${x},${y + h / 2}`} />;
    case 'octagon':
      return <polygon points={`${x + w * 0.3},${y} ${x + w * 0.7},${y} ${x + w},${y + h * 0.3} ${x + w},${y + h * 0.7} ${x + w * 0.7},${y + h} ${x + w * 0.3},${y + h} ${x},${y + h * 0.7} ${x},${y + h * 0.3}`} />;
    case 'arrow':
      return <polygon points={`${x},${y + h * 0.3} ${x + w * 0.6},${y + h * 0.3} ${x + w * 0.6},${y} ${x + w},${y + h / 2} ${x + w * 0.6},${y + h} ${x + w * 0.6},${y + h * 0.7} ${x},${y + h * 0.7}`} />;
    case 'arrowChevron':
      return <polygon points={`${x},${y} ${x + w * 0.75},${y} ${x + w},${y + h / 2} ${x + w * 0.75},${y + h} ${x},${y + h} ${x + w * 0.25},${y + h / 2}`} />;
    case 'arrowPentagon':
      return <polygon points={`${x},${y} ${x + w * 0.75},${y} ${x + w},${y + h / 2} ${x + w * 0.75},${y + h} ${x},${y + h}`} />;
    case 'heart':
      return <path d={`M${x + w / 2},${y + h} C${x - w * 0.1},${y + h * 0.5} ${x + w * 0.1},${y - h * 0.05} ${x + w / 2},${y + h * 0.3} C${x + w * 0.9},${y - h * 0.05} ${x + w * 1.1},${y + h * 0.5} ${x + w / 2},${y + h} Z`} />;
    case 'line':
      return <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} />;
    case 'speechbubbleRectangle':
      return <path d={`M${x},${y} H${x + w} V${y + h * 0.78} H${x + w * 0.35} L${x + w * 0.2},${y + h} V${y + h * 0.78} H${x} Z`} />;
    case 'tabCutCorner':
      return <polygon points={`${x},${y} ${x + w - snip},${y} ${x + w},${y + snip} ${x + w},${y + h} ${x},${y + h}`} />;
    case 'tabCutTopCorners':
    case 'tabCutTopCornersByPixel':
      return <polygon points={`${x + snip},${y} ${x + w - snip},${y} ${x + w},${y + snip} ${x + w},${y + h} ${x},${y + h} ${x},${y + snip}`} />;
    case 'tabRoundCorner':
      return <path d={roundedRectPath(rc, { lt: 0, rt: Math.max(r, snip), lb: 0, rb: 0 })} />;
    case 'tabRoundTopCorners':
      return <path d={roundedRectPath(rc, { lt: Math.max(r, snip), rt: Math.max(r, snip), lb: 0, rb: 0 })} />;
    case 'rectangle':
      return <rect x={x} y={y} width={w} height={h} />;
    default:
      // rectangleRounded / rectangleRoundedByPixel / unknown
      if (opts.radii) return <path d={roundedRectPath(rc, opts.radii)} />;
      return <rect x={x} y={y} width={w} height={h} rx={r} ry={r} />;
  }
}

/** Simple glyphs for Power BI button icons (icon.shapeType). */
export function iconGlyph(shapeType: string, cx: number, cy: number, size: number, color: string, weight: number): ReactNode {
  const h = size / 2;
  const stroke = { stroke: color, strokeWidth: weight, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (shapeType) {
    case 'leftArrow':
    case 'back':
      return <path d={`M${cx + h},${cy} H${cx - h} M${cx - h * 0.2},${cy - h * 0.8} L${cx - h},${cy} L${cx - h * 0.2},${cy + h * 0.8}`} {...stroke} />;
    case 'rightArrow':
      return <path d={`M${cx - h},${cy} H${cx + h} M${cx + h * 0.2},${cy - h * 0.8} L${cx + h},${cy} L${cx + h * 0.2},${cy + h * 0.8}`} {...stroke} />;
    case 'reset':
      return <path d={`M${cx + h * 0.9},${cy - h * 0.3} A${h},${h} 0 1 1 ${cx + h * 0.2},${cy - h * 0.98} M${cx + h * 0.9},${cy - h} V${cy - h * 0.3} H${cx + h * 0.2}`} {...stroke} />;
    case 'help':
      return (
        <g>
          <circle cx={cx} cy={cy} r={h} {...stroke} />
          <path d={`M${cx - h * 0.35},${cy - h * 0.25} A${h * 0.35},${h * 0.35} 0 1 1 ${cx},${cy + h * 0.1} V${cy + h * 0.25} M${cx},${cy + h * 0.55} v${0.01}`} {...stroke} />
        </g>
      );
    case 'information':
      return (
        <g>
          <circle cx={cx} cy={cy} r={h} {...stroke} />
          <path d={`M${cx},${cy - h * 0.15} V${cy + h * 0.55} M${cx},${cy - h * 0.5} v${0.01}`} {...stroke} />
        </g>
      );
    case 'qna':
      return <path d={`M${cx - h},${cy - h * 0.7} h${size} v${size * 0.6} h${-size * 0.55} l${-h * 0.4},${h * 0.5} v${-h * 0.5} h${-h * 0.5} Z`} {...stroke} />;
    case 'bookmarks':
      return <path d={`M${cx - h * 0.6},${cy - h} h${size * 0.6} v${size} l${-h * 0.6},${-h * 0.5} l${-h * 0.6},${h * 0.5} Z`} {...stroke} />;
    case 'applyAllSlicers':
      return <path d={`M${cx - h * 0.8},${cy} l${h * 0.55},${h * 0.6} l${h * 1.05},${-h * 1.2}`} {...stroke} />;
    case 'clearAllSlicers':
      return <path d={`M${cx - h * 0.7},${cy - h * 0.7} L${cx + h * 0.7},${cy + h * 0.7} M${cx + h * 0.7},${cy - h * 0.7} L${cx - h * 0.7},${cy + h * 0.7}`} {...stroke} />;
    case 'spinner':
      return <path d={`M${cx},${cy - h} A${h},${h} 0 1 1 ${cx - h},${cy}`} {...stroke} />;
    case 'custom':
      return <rect x={cx - h} y={cy - h} width={size} height={size} rx={2} {...stroke} />;
    default:
      return null;
  }
}
