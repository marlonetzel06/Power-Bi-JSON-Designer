import { estimateTextWidth } from '../fonts';
import type { FontStyle, Resolver } from '../resolver';

export interface AxisStyle {
  show: boolean;
  font: FontStyle;
  showTitle: boolean;
  titleText: string;
  titleFont: FontStyle;
  gridShow: boolean;
  gridColor: string;
  gridDash: string | undefined;
  gridWidth: number;
  gridOpacity: number;
  displayUnits: number;
  precision: number;
  invert: boolean;
}

export function dashArray(style: string, width: number): string | undefined {
  if (style === 'dashed') return `${width * 4},${width * 3}`;
  if (style === 'dotted') return `${width},${width * 2}`;
  return undefined;
}

export function readAxis(r: Resolver, card: 'categoryAxis' | 'valueAxis' | 'y2Axis', defaultGrid: boolean, defaultTitle: string): AxisStyle {
  const pre = card === 'y2Axis' ? 'sec' : '';
  const p = (name: string) => (pre ? pre + name.charAt(0).toUpperCase() + name.slice(1) : name);
  const font = r.font(card, p('labelColor'), r.structural.second, 9, pre);
  const titleFont = r.font(card, p('titleColor'), r.structural.second, 9, pre ? 'secTitle' : 'title');
  const gridWidth = r.num(card, 'gridlineThickness', 1);
  return {
    show: r.bool(card, 'show', true),
    font,
    showTitle: r.bool(card, p('showAxisTitle'), false),
    titleText: r.str(card, p('titleText'), '') || defaultTitle,
    titleFont,
    gridShow: r.bool(card, 'gridlineShow', defaultGrid),
    gridColor: r.color(card, 'gridlineColor', '#E6E6E6'),
    gridDash: dashArray(r.str(card, 'gridlineStyle', 'solid'), gridWidth),
    gridWidth,
    gridOpacity: 1 - r.num(card, 'gridlineTransparency', 0) / 100,
    displayUnits: r.num(card, p('labelDisplayUnits'), 0),
    precision: r.num(card, p('labelPrecision'), 0),
    invert: r.bool(card, 'invertAxis', false),
  };
}

export function niceTicks(max: number, count = 5): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

export function maxLabelWidth(labels: string[], font: FontStyle): number {
  return Math.max(0, ...labels.map((l) => estimateTextWidth(l, font.sizePx, font.weight >= 600)));
}
