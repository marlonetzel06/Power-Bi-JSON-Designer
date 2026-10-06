import type { ReactNode } from 'react';

/** Power BI marker shapes (lineStyles.markerShape, bubbles.markerShape, error.markerShape, anomalies). */
export type MarkerShape = 'circle' | 'square' | 'diamond' | 'triangle' | 'x' | 'plus' | 'shortDash' | 'longDash' | 'droplet' | 'none' | string;

export interface MarkerStyle {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  /** Degrees, clockwise. */
  rotation?: number;
  opacity?: number;
}

/** One marker centred at (cx, cy) with the given diameter in px. */
export function marker(shape: MarkerShape, cx: number, cy: number, size: number, style: MarkerStyle, key: string): ReactNode {
  const s = size;
  const h = s / 2;
  const common = { fill: style.fill, stroke: style.stroke, strokeWidth: style.strokeWidth, opacity: style.opacity };
  const line = { fill: 'none', stroke: style.stroke && style.strokeWidth ? style.stroke : style.fill, strokeWidth: Math.max(1.5, style.strokeWidth ?? 0) || 2, strokeLinecap: 'round' as const, opacity: style.opacity };
  const transform = style.rotation ? `rotate(${style.rotation} ${cx} ${cy})` : undefined;
  switch (shape) {
    case 'none':
      return null;
    case 'square':
      return <rect key={key} x={cx - h} y={cy - h} width={s} height={s} transform={transform} {...common} />;
    case 'diamond':
      return <polygon key={key} points={`${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}`} transform={transform} {...common} />;
    case 'triangle':
      return <polygon key={key} points={`${cx},${cy - h} ${cx + h},${cy + h} ${cx - h},${cy + h}`} transform={transform} {...common} />;
    case 'x':
      return <path key={key} d={`M${cx - h},${cy - h} L${cx + h},${cy + h} M${cx + h},${cy - h} L${cx - h},${cy + h}`} transform={transform} {...line} />;
    case 'plus':
      return <path key={key} d={`M${cx - h},${cy} H${cx + h} M${cx},${cy - h} V${cy + h}`} transform={transform} {...line} />;
    case 'shortDash':
      return <path key={key} d={`M${cx - h * 0.7},${cy} H${cx + h * 0.7}`} transform={transform} {...line} />;
    case 'longDash':
      return <path key={key} d={`M${cx - s},${cy} H${cx + s}`} transform={transform} {...line} />;
    case 'droplet':
      return <path key={key} d={`M${cx},${cy - s * 0.7} C${cx + h * 1.1},${cy - h * 0.2} ${cx + h},${cy + h * 0.6} ${cx},${cy + h * 0.7} C${cx - h},${cy + h * 0.6} ${cx - h * 1.1},${cy - h * 0.2} ${cx},${cy - s * 0.7} Z`} transform={transform} {...common} />;
    default:
      return <circle key={key} cx={cx} cy={cy} r={h} {...common} />;
  }
}
