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

/**
 * Read an axis card. `secondary` reads the sec* properties: combo charts keep the secondary
 * Y axis inside `valueAxis` (no y2Axis card), line/area charts have a `y2Axis` card.
 */
export function readAxis(r: Resolver, card: 'categoryAxis' | 'valueAxis' | 'y2Axis', defaultGrid: boolean, defaultTitle: string, secondary = card === 'y2Axis'): AxisStyle {
  const pre = secondary ? 'sec' : '';
  const p = (name: string) => (pre ? pre + name.charAt(0).toUpperCase() + name.slice(1) : name);
  const font = r.font(card, p('labelColor'), r.structural.second, 9, { prefix: pre, textClass: 'label' });
  const titleFont = r.font(card, p('titleColor'), r.structural.second, 9, { prefix: pre ? 'secTitle' : 'title', textClass: 'label' });
  // Not every axis card has every property (the waterfall category axis has no gridlines, the
  // secondary axis none of its own): read only what the visual's card offers.
  const grid = !secondary && r.hasProp(card, 'gridlineShow');
  const gridWidth = grid ? r.num(card, 'gridlineThickness', 1) : 1;
  // combo: `secShow` toggles the secondary axis; y2Axis card: `show`
  const show = secondary && card === 'valueAxis' ? r.bool(card, 'secShow', true) : r.bool(card, 'show', true);
  return {
    show,
    font,
    showTitle: r.bool(card, p('showAxisTitle'), false),
    titleText: r.str(card, p('titleText'), '') || defaultTitle,
    titleFont,
    gridShow: grid ? r.bool(card, 'gridlineShow', defaultGrid) : false,
    gridColor: grid ? r.color(card, 'gridlineColor', '#E6E6E6') : '#E6E6E6',
    gridDash: grid ? dashArray(r.str(card, 'gridlineStyle', 'solid'), gridWidth) : undefined,
    gridWidth,
    gridOpacity: grid ? 1 - r.num(card, 'gridlineTransparency', 0) / 100 : 1,
    displayUnits: r.hasProp(card, p('labelDisplayUnits')) ? r.num(card, p('labelDisplayUnits'), 0) : 0,
    precision: r.hasProp(card, p('labelPrecision')) ? r.num(card, p('labelPrecision'), 0) : 0,
    invert: !secondary && r.hasProp(card, 'invertAxis') ? r.bool(card, 'invertAxis', false) : false,
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
