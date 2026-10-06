import { estimateTextWidth } from '../fonts';
import type { FontStyle, Resolver } from '../resolver';

export interface AxisStyle {
  show: boolean;
  /** Fixed range (axis start/end), undefined = automatic. */
  start?: number;
  end?: number;
  /** Labels on the opposite side (valueAxis.switchAxisPosition). */
  switchPosition: boolean;
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
  /** undefined = automatic */
  precision: number | undefined;
  invert: boolean;
}

export function dashArray(style: string, width: number, custom?: string): string | undefined {
  if (style === 'custom' && custom && custom.trim()) return custom.trim().split(/[\s,]+/).map((n) => String(Number(n) * Math.max(1, width))).join(',');
  if (style === 'dashed') return `${width * 4},${width * 3}`;
  if (style === 'dotted') return `${width},${width * 2}`;
  return undefined;
}

/** Axis start/end may be stored as number or numeric string. */
function numberOrUndefined(v: string | number | boolean | undefined): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
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
  const gridCustom = grid && r.hasProp(card, 'gridlineDashArray') ? r.str(card, 'gridlineDashArray', '') : '';
  const gridStyle = grid ? r.str(card, 'gridlineStyle', 'solid') : 'solid';
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
    gridDash: grid ? (gridCustom ? dashArray('custom', gridWidth, gridCustom) : dashArray(gridStyle, gridWidth)) : undefined,
    start: r.hasProp(card, p('start')) && r.has(card, p('start')) ? numberOrUndefined(r.raw(card, p('start'))) : undefined,
    end: r.hasProp(card, p('end')) && r.has(card, p('end')) ? numberOrUndefined(r.raw(card, p('end'))) : undefined,
    switchPosition: !secondary && r.hasProp(card, 'switchAxisPosition') ? r.bool(card, 'switchAxisPosition', false) : false,
    gridWidth,
    gridOpacity: grid ? 1 - r.num(card, 'gridlineTransparency', 0) / 100 : 1,
    displayUnits: r.hasProp(card, p('labelDisplayUnits')) ? r.num(card, p('labelDisplayUnits'), 0) : 0,
    precision: r.hasProp(card, p('labelPrecision')) && r.has(card, p('labelPrecision')) ? r.num(card, p('labelPrecision'), 0) : undefined,
    invert: !secondary && r.hasProp(card, 'invertAxis') ? r.bool(card, 'invertAxis', false) : false,
  };
}

export function niceTicks(max: number, count = 5): number[] {
  return ticksBetween(0, max, count);
}

/** Nice tick values covering [min, max] (min may be negative or above 0 for fixed axis starts). */
export function ticksBetween(min: number, max: number, count = 5): number[] {
  if (!(max > min)) return [min];
  const rough = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const first = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = first; v <= max + step * 0.001; v += step) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

export function maxLabelWidth(labels: string[], font: FontStyle): number {
  return Math.max(0, ...labels.map((l) => estimateTextWidth(l, font.sizePx, font.weight >= 600)));
}
