import type { ReactNode } from 'react';
import { truncate } from '../fonts';
import { textProps, withAlpha, type Resolver } from '../resolver';
import { CATEGORIES, MONTHS, SERIES, SERIES_NAMES, TIME_SERIES, WATERFALL, SCATTER, formatWithUnit, precisionOf, resolveUnit } from '../sampleData';
import { marker } from '../shared/markers';
import type { BodyProps, Rect } from '../types';
import { layoutLegend, type LegendItem } from './Legend';
import { dashArray, maxLabelWidth, readAxis, ticksBetween, type AxisStyle } from './axis';
import { linePath, type LineShape, type Point } from './paths';

export type CartesianVariant = 'bar' | 'column' | 'line' | 'area' | 'scatter' | 'waterfall' | 'ribbon' | 'combo';
export type StackMode = 'none' | 'stacked' | 'percent';

export interface CartesianOptions {
  variant: CartesianVariant;
  stack?: StackMode;
  series?: number;
  /** Combo: line series on secondary axis. */
  comboLine?: boolean;
}

interface Scale {
  (v: number): number;
}

function linear(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (v) => r0 + ((v - d0) / span) * (r1 - r0);
}

function seriesColor(r: Resolver, i: number, count: number): string {
  if (count === 1) {
    const def = r.color('dataPoint', 'defaultColor', '');
    if (def) return def;
  }
  return r.dataColor(i);
}

const MARKER_SIZE_DEFAULT = 5;

/** Line style (solid/dashed/dotted/custom) + width → dash array; `custom` uses the card's dash pattern. */
function strokeDash(r: Resolver, card: string, styleProp: string, width: number, customProp = 'dashArray'): string | undefined {
  const style = r.str(card, styleProp, 'solid');
  return dashArray(style, width, style === 'custom' && r.hasProp(card, customProp) ? r.str(card, customProp, '') : undefined);
}

function lineCap(r: Resolver, card: string, prop: string): 'round' | 'butt' | 'square' {
  const v = r.hasProp(card, prop) ? r.str(card, prop, 'flat') : 'flat';
  return v === 'round' ? 'round' : v === 'square' ? 'square' : 'butt';
}

/**
 * Shared engine for bar/column/line/area/scatter/waterfall/ribbon/combo charts.
 */
export function CartesianChart({ r, rect, uid, options }: BodyProps & { options: CartesianOptions }) {
  const { variant } = options;
  const stack = options.stack ?? 'none';
  const horizontal = variant === 'bar';
  const isLine = variant === 'line' || variant === 'area';
  const isScatter = variant === 'scatter';
  const isWaterfall = variant === 'waterfall';
  const seriesCount = isScatter || isWaterfall ? 1 : Math.min(options.series ?? (stack === 'none' ? 2 : 3), 3);
  const categories = isLine ? MONTHS : isWaterfall ? [...WATERFALL.map((w) => w.label), 'Gesamt'] : CATEGORIES;
  const rawSeries = (isLine ? TIME_SERIES : SERIES).slice(0, seriesCount);

  // ---- line styling (lines, areas, combo line) ----
  const hasLines = isLine || (variant === 'combo' && options.comboLine);
  const lineShape: LineShape = {
    type: hasLines ? r.str('lineStyles', 'lineChartType', 'linear') : 'linear',
    smooth: hasLines ? r.str('lineStyles', 'interpolationSmooth', 'monotoneX') : 'monotoneX',
    smoothParam: hasLines ? r.num('lineStyles', 'interpolationSmoothParam', 50) : 50,
    step: hasLines ? r.str('lineStyles', 'interpolationStep', 'center') : 'center',
  };
  const strokeWidth = hasLines ? r.num('lineStyles', 'strokeWidth', 2) : 2;
  const strokeShow = hasLines ? r.bool('lineStyles', 'strokeShow', true) : true;
  const strokeColorOverride = hasLines && r.hasProp('lineStyles', 'strokeColor') ? r.color('lineStyles', 'strokeColor', '') : '';
  const lineDash = hasLines ? strokeDash(r, 'lineStyles', 'lineStyle', strokeWidth, 'strokeDashArray') : undefined;
  const lineCapStyle = hasLines ? lineCap(r, 'lineStyles', 'strokeDashCap') : 'round';
  const lineJoin = hasLines ? (r.str('lineStyles', 'strokeLineJoin', 'round') as 'round' | 'bevel' | 'miter') : 'round';
  const showMarker = hasLines && r.bool('lineStyles', 'showMarker', false);
  const markerShape = hasLines ? r.str('lineStyles', 'markerShape', 'circle') : 'circle';
  const markerSize = hasLines ? r.num('lineStyles', 'markerSize', MARKER_SIZE_DEFAULT) : MARKER_SIZE_DEFAULT;
  const markerColor = hasLines ? r.color('lineStyles', 'markerColor', '') : '';
  const hasMarkersCard = r.hasCard('markers');
  const markerBorderShow = hasMarkersCard && r.bool('markers', 'borderShow', false);
  const markerBorderMatch = hasMarkersCard && r.bool('markers', 'borderColorMatchFill', false);
  const markerBorderColor = hasMarkersCard ? withAlpha(r.color('markers', 'borderColor', '#FFFFFF'), r.num('markers', 'borderTransparency', 0)) : '#FFFFFF';
  const markerBorderWidth = hasMarkersCard ? r.num('markers', 'borderWidth', 1) : 1;
  const markerRotation = hasMarkersCard ? r.num('markers', 'rotation', 0) : 0;
  const markerOpacity = hasMarkersCard ? 1 - r.num('markers', 'transparency', 0) / 100 : 1;
  const markerStyle = (fill: string) => ({ fill, stroke: markerBorderShow ? (markerBorderMatch ? fill : markerBorderColor) : undefined, strokeWidth: markerBorderShow ? markerBorderWidth : undefined, rotation: markerRotation, opacity: markerOpacity });

  // ---- legend ----
  const legendRendering = hasLines ? r.str('legend', 'legendMarkerRendering', 'markerCircleDefault') : 'markerCircleDefault';
  const legendMatchLine = hasLines ? r.bool('legend', 'matchLineColor', true) : true;
  const legendKind: LegendItem['marker'] = legendRendering === 'lineOnly' ? 'line' : legendRendering === 'lineAndMarker' ? 'lineMarker' : legendRendering === 'markerOnly' ? 'marker' : 'circle';
  const lineLegend = (color: string): Partial<LegendItem> => ({ marker: legendKind, shape: showMarker ? markerShape : 'circle', dash: lineDash, lineColor: legendMatchLine ? undefined : strokeColorOverride || color });
  const legendItems: LegendItem[] = isScatter
    ? [{ label: 'Umsatz', color: seriesColor(r, 0, 1), marker: 'circle' }]
    : isWaterfall
      ? [
          { label: 'Anstieg', color: r.color('sentimentColors', 'increaseFill', r.structural.good) },
          { label: 'Rückgang', color: r.color('sentimentColors', 'decreaseFill', r.structural.bad) },
          { label: 'Gesamt', color: r.color('sentimentColors', 'totalFill', r.structural.second) },
        ]
      : rawSeries.map((_, i) => {
          const color = seriesColor(r, i, seriesCount);
          const onLine = isLine || (variant === 'combo' && options.comboLine && i === seriesCount - 1);
          return { label: SERIES_NAMES[i] ?? `Serie ${i + 1}`, color, marker: 'circle', ...(onLine ? lineLegend(color) : {}) } as LegendItem;
        });

  const { plot: afterLegend, element: legendEl } = layoutLegend(r, rect, legendItems);

  // ---- axes ----
  const catAxis = readAxis(r, 'categoryAxis', false, isLine ? 'Monat' : isScatter ? 'Umsatz' : 'Region');
  const valAxis = readAxis(r, 'valueAxis', true, isScatter ? 'Marge' : 'Umsatz');
  // Secondary Y axis: combo charts read valueAxis.sec*, line/area charts their y2Axis card (only
  // when the theme turns it on — Power BI shows it when a measure sits on the secondary axis).
  const y2Axis = options.comboLine
    ? readAxis(r, 'valueAxis', false, 'Marge', true)
    : (variant === 'line' || variant === 'area') && stack === 'none' && r.bool('y2Axis', 'show', false)
      ? readAxis(r, 'y2Axis', false, 'Plan')
      : undefined;
  const secondaryIdx = y2Axis && !options.comboLine ? rawSeries.length - 1 : -1;

  // ---- values & domain ----
  const stackedTotals = categories.map((_, ci) => rawSeries.reduce((sum, s) => sum + (s[ci] ?? 0), 0));
  let maxValue: number;
  if (isWaterfall) {
    let run = 0;
    maxValue = 0;
    for (const w of WATERFALL) {
      run += w.value;
      maxValue = Math.max(maxValue, run);
    }
  } else if (isScatter || stack === 'percent') {
    maxValue = 100;
  } else if (stack === 'stacked') {
    maxValue = Math.max(...stackedTotals);
  } else {
    maxValue = Math.max(...rawSeries.filter((_, i) => i !== secondaryIdx).flat());
  }
  const domainMin = stack === 'percent' || isScatter ? 0 : valAxis.start ?? 0;
  const autoTicks = stack === 'percent' ? [0, 20, 40, 60, 80, 100] : ticksBetween(domainMin, valAxis.end ?? maxValue * (isScatter ? 1 : 1.0001), 5);
  const domainMax = valAxis.end ?? autoTicks[autoTicks.length - 1] ?? maxValue;
  const ticks = autoTicks.filter((t) => t >= domainMin - 1e-9 && t <= domainMax + 1e-9);
  const valueFactor = isScatter ? 1 : 1000;
  const valueUnit = resolveUnit(valAxis.displayUnits, ticks.map((t) => t * valueFactor));
  const fmtTick = (v: number) => (stack === 'percent' ? `${v} %` : formatWithUnit(v * valueFactor, valueUnit, valAxis.precision));
  const tickLabels = ticks.map(fmtTick);
  // secondary axis: own domain for the series drawn on it (combo line = last series)
  const secSeries = y2Axis ? (options.comboLine ? rawSeries[seriesCount - 1] : rawSeries[secondaryIdx]) ?? [] : [];
  const secMin = y2Axis?.start ?? 0;
  const secTicks = y2Axis ? ticksBetween(secMin, y2Axis.end ?? Math.max(1, ...secSeries) * 1.15, 5) : [];
  const secDomainMax = y2Axis?.end ?? secTicks[secTicks.length - 1] ?? 1;
  const secUnit = resolveUnit(y2Axis?.displayUnits ?? 0, secTicks.map((t) => t * 1000));
  const secTickLabels = secTicks.map((v) => formatWithUnit(v * 1000, secUnit, y2Axis?.precision ?? 0));
  // scatter: numeric X axis
  const xTicks = isScatter ? ticksBetween(catAxis.start ?? 0, catAxis.end ?? 100, 5) : [];
  const xUnit = resolveUnit(catAxis.displayUnits, xTicks);
  const xTickLabels = xTicks.map((v) => formatWithUnit(v, xUnit, catAxis.precision));

  // ---- axis space ----
  const catLabelFont = catAxis.font;
  const valLabelFont = valAxis.font;
  const titleGap = 4;
  let left = afterLegend.x;
  let right = afterLegend.x + afterLegend.width;
  let top = afterLegend.y + 4;
  let bottom = afterLegend.y + afterLegend.height;
  const valueLabelsW = maxLabelWidth(tickLabels, valLabelFont) + 8;
  if (horizontal) {
    if (catAxis.show) left += Math.min(afterLegend.width * 0.35, maxLabelWidth(categories, catLabelFont) + 8);
    if (catAxis.showTitle) left += catAxis.titleFont.sizePx + titleGap;
    if (valAxis.show) {
      if (valAxis.switchPosition) top += valLabelFont.sizePx * 1.4 + 4;
      else bottom -= valLabelFont.sizePx * 1.4 + 4;
    }
    if (valAxis.showTitle) bottom -= valAxis.titleFont.sizePx + titleGap;
  } else {
    if (valAxis.show) {
      if (valAxis.switchPosition) right -= valueLabelsW;
      else left += valueLabelsW;
    }
    if (valAxis.showTitle) left += valAxis.titleFont.sizePx + titleGap;
    if (catAxis.show) bottom -= catLabelFont.sizePx * 1.4 + 4;
    if (catAxis.showTitle) bottom -= catAxis.titleFont.sizePx + titleGap;
    if (y2Axis?.show) right -= maxLabelWidth(secTickLabels, y2Axis.font) + 8 + (y2Axis.showTitle ? y2Axis.titleFont.sizePx + titleGap : 0);
  }
  const zoomShow = r.hasCard('zoom') && r.bool('zoom', 'show', false);
  if (zoomShow) {
    if (horizontal) left += 10;
    else bottom -= 10;
  }
  const plot: Rect = { x: left, y: top, width: Math.max(10, right - left), height: Math.max(10, bottom - top) };

  const valueScale = horizontal
    ? linear([domainMin, domainMax], valAxis.invert ? [plot.x + plot.width, plot.x] : [plot.x, plot.x + plot.width])
    : linear([domainMin, domainMax], valAxis.invert ? [plot.y, plot.y + plot.height] : [plot.y + plot.height, plot.y]);
  const secScale = y2Axis?.show ? linear([secMin, secDomainMax], [plot.y + plot.height, plot.y]) : undefined;
  const xScale = linear([xTicks[0] ?? 0, xTicks[xTicks.length - 1] ?? 100], [plot.x, plot.x + plot.width]);
  const catCount = categories.length;
  const bandSize = (horizontal ? plot.height : plot.width) / catCount;
  const innerPadding = Math.min(0.6, Math.max(0, (r.hasProp('categoryAxis', 'innerPadding') ? r.num('categoryAxis', 'innerPadding', variant === 'ribbon' ? 45 : 20) : 20) / 100));
  const groupSize = bandSize * (1 - innerPadding);
  const catPos = (ci: number) => (horizontal ? plot.y : plot.x) + bandSize * (catAxis.invert ? catCount - 1 - ci : ci) + bandSize / 2;
  const zeroPos = valueScale(Math.max(domainMin, 0));

  const back: ReactNode[] = [];
  const nodes: ReactNode[] = [];
  const front: ReactNode[] = [];

  // ---- gridlines ----
  if (valAxis.gridShow) {
    for (const t of ticks) {
      const p = valueScale(t);
      back.push(
        horizontal ? (
          <line key={`vg${t}`} data-part="gridline" x1={p} x2={p} y1={plot.y} y2={plot.y + plot.height} stroke={valAxis.gridColor} strokeWidth={valAxis.gridWidth} strokeDasharray={valAxis.gridDash} opacity={valAxis.gridOpacity} />
        ) : (
          <line key={`vg${t}`} data-part="gridline" x1={plot.x} x2={plot.x + plot.width} y1={p} y2={p} stroke={valAxis.gridColor} strokeWidth={valAxis.gridWidth} strokeDasharray={valAxis.gridDash} opacity={valAxis.gridOpacity} />
        ),
      );
    }
  }
  if (catAxis.gridShow) {
    const positions = isScatter ? xTicks.map((t) => xScale(t)) : categories.map((_, ci) => (horizontal ? plot.y : plot.x) + bandSize * ci).concat([(horizontal ? plot.y : plot.x) + bandSize * catCount]);
    positions.forEach((p, ci) =>
      back.push(
        horizontal ? (
          <line key={`cg${ci}`} data-part="gridline" x1={plot.x} x2={plot.x + plot.width} y1={p} y2={p} stroke={catAxis.gridColor} strokeWidth={catAxis.gridWidth} strokeDasharray={catAxis.gridDash} opacity={catAxis.gridOpacity} />
        ) : (
          <line key={`cg${ci}`} data-part="gridline" x1={p} x2={p} y1={plot.y} y2={plot.y + plot.height} stroke={catAxis.gridColor} strokeWidth={catAxis.gridWidth} strokeDasharray={catAxis.gridDash} opacity={catAxis.gridOpacity} />
        ),
      ),
    );
  }

  // ---- data labels config (the scatter chart has category labels only) ----
  const hasLabels = r.hasCard('labels');
  const labelsShow = hasLabels && r.bool('labels', 'show', false);
  const labelFont = hasLabels ? r.font('labels', 'color', r.structural.second, 9, { textClass: 'label' }) : r.font('categoryLabels', 'color', r.structural.second, 9, { textClass: 'label' });
  const labelUnitsProp = labelsShow ? r.num('labels', 'labelDisplayUnits', 0) : 0;
  const labelPrecision = labelsShow ? precisionOf(r, 'labels', 'labelPrecision') : undefined;
  const labelBg = labelsShow && r.bool('labels', 'enableBackground', false);
  const labelBgColor = labelBg ? withAlpha(r.color('labels', 'backgroundColor', '#FFFFFF'), r.num('labels', 'backgroundTransparency', 90)) : 'none';
  const labelPosition = labelsShow ? r.str('labels', 'labelPosition', 'Auto') : 'Auto';
  const labelVertical = labelsShow && r.hasProp('labels', 'labelOrientation') && String(r.raw('labels', 'labelOrientation') ?? 0) === '0' && variant === 'column' && r.has('labels', 'labelOrientation');
  const labelShowSeries = labelsShow && r.hasProp('labels', 'showSeries') && r.bool('labels', 'showSeries', false);
  const labelOpacity = labelsShow && r.hasProp('labels', 'transparency') ? 1 - r.num('labels', 'transparency', 0) / 100 : 1;
  const labelUnit = resolveUnit(labelUnitsProp, rawSeries.flat().map((v) => v * 1000));
  const fmtLabel = (v: number, si = -1) => {
    const text = stack === 'percent' ? `${Math.round(v)} %` : formatWithUnit(v * 1000, labelUnit, labelPrecision);
    return labelShowSeries && si >= 0 ? `${SERIES_NAMES[si] ?? ''}: ${text}` : text;
  };
  const dataLabel = (x: number, y: number, text: string, key: string, anchor: 'start' | 'middle' | 'end' = 'middle', vertical = false) => {
    const w = text.length * labelFont.sizePx * 0.55 + 6;
    return (
      <g key={key} data-part="data-label" opacity={labelOpacity} transform={vertical ? `rotate(-90 ${x} ${y})` : undefined}>
        {labelBg && <rect x={anchor === 'middle' ? x - w / 2 : anchor === 'start' ? x - 2 : x - w + 2} y={y - labelFont.sizePx} width={w} height={labelFont.sizePx + 4} fill={labelBgColor} rx={2} />}
        <text x={x} y={y} textAnchor={anchor} {...textProps(labelFont)}>{text}</text>
      </g>
    );
  };

  // ---- dataPoint styling: bars/columns have fill transparency + border; lines/areas/maps only `transparency`;
  // the scatter chart styles its markers via `markers`. ----
  const hasBarStyle = r.hasProp('dataPoint', 'fillTransparency');
  const fillTransparency = hasBarStyle ? r.num('dataPoint', 'fillTransparency', 0) : r.hasProp('dataPoint', 'transparency') ? r.num('dataPoint', 'transparency', 0) : 0;
  const borderShow = hasBarStyle && r.bool('dataPoint', 'borderShow', false);
  const borderColor = hasBarStyle ? withAlpha(r.color('dataPoint', 'borderColor', '#FFFFFF'), r.num('dataPoint', 'borderTransparency', 0)) : '#FFFFFF';
  const borderSize = hasBarStyle ? r.num('dataPoint', 'borderSize', 1) : 1;
  const borderMatchFill = hasBarStyle && r.bool('dataPoint', 'borderColorMatchFill', false);

  // ---- error bars (clustered/line charts) ----
  const hasError = r.hasCard('error');
  const errorOn = hasError && r.bool('error', 'enabled', false);
  const errorBarShow = errorOn && r.bool('error', 'barShow', true);
  const errorMatch = errorOn && r.bool('error', 'barMatchSeriesColor', false);
  const errorColor = errorOn ? r.color('error', 'barColor', r.structural.second) : '';
  const errorWidth = errorOn ? r.num('error', 'barWidth', 1) : 1;
  const errorMarkerShow = errorOn && r.bool('error', 'markerShow', true);
  const errorMarkerShape = errorOn ? r.str('error', 'markerShape', 'shortDash') : 'shortDash';
  const errorMarkerSize = errorOn ? r.num('error', 'markerSize', 6) : 6;
  const errorLabelShow = errorOn && r.bool('error', 'labelShow', false);
  const errorLabelFont = errorOn ? r.font('error', 'labelColor', r.structural.second, 9, { prefix: 'label', textClass: 'label' }) : labelFont;
  const errorLabelMatch = errorOn && r.bool('error', 'labelMatchSeriesColor', false);
  const errorShade = errorOn && isLine && r.hasProp('error', 'shadeShow') && r.bool('error', 'shadeShow', false);
  const errorShadeColor = errorShade ? withAlpha(r.color('error', 'shadeColor', r.structural.second), r.num('error', 'shadeTransparency', 80)) : 'none';
  const errorShadeMatch = errorShade && r.bool('error', 'shadeMatchSeriesColor', true);
  const errorWhisker = (cx: number, lo: number, hi: number, color: string, key: string, vertical: boolean, value: number) => {
    const c = errorMatch ? color : errorColor;
    const cap = errorMarkerSize;
    const parts: ReactNode[] = [];
    if (errorBarShow) parts.push(vertical ? <line key="l" x1={cx} x2={cx} y1={lo} y2={hi} stroke={c} strokeWidth={errorWidth} /> : <line key="l" x1={lo} x2={hi} y1={cx} y2={cx} stroke={c} strokeWidth={errorWidth} />);
    if (errorMarkerShow && errorMarkerShape !== 'none') {
      const rot = vertical ? 0 : 90;
      parts.push(marker(errorMarkerShape, vertical ? cx : lo, vertical ? lo : cx, cap, { fill: c, stroke: c, strokeWidth: errorWidth, rotation: rot }, 'm0'));
      parts.push(marker(errorMarkerShape, vertical ? cx : hi, vertical ? hi : cx, cap, { fill: c, stroke: c, strokeWidth: errorWidth, rotation: rot }, 'm1'));
    }
    if (errorLabelShow) {
      const f = { ...errorLabelFont, color: errorLabelMatch ? color : errorLabelFont.color };
      parts.push(<text key="t" x={vertical ? cx + cap : hi + 3} y={vertical ? Math.min(lo, hi) - 2 : cx + f.sizePx * 0.35} textAnchor="start" {...textProps(f)}>{`±${formatWithUnit(value * 0.08 * 1000, labelUnit, 0)}`}</text>);
    }
    return <g key={key} data-part="error-bar">{parts}</g>;
  };

  // ---- bars / columns ----
  const drawBars = variant === 'bar' || variant === 'column' || variant === 'ribbon' || variant === 'combo';
  const barSeries = variant === 'combo' && options.comboLine ? rawSeries.slice(0, Math.max(1, seriesCount - 1)) : rawSeries;
  const barColumns: { ci: number; si: number; v0: number; v1: number; color: string }[] = [];
  if (drawBars) {
    const barStack = variant === 'ribbon' ? 'stacked' : stack;
    const clusterGap = barStack === 'none' && barSeries.length > 1 && r.hasProp('layout', 'clusteredGapSize') ? Math.min(0.8, Math.max(0, r.num('layout', 'clusteredGapSize', 20) / 100)) : 0;
    const overlap = barStack === 'none' && barSeries.length > 1 && r.hasProp('layout', 'clusteredGapOverlaps') ? Math.min(0.9, Math.max(0, r.num('layout', 'clusteredGapOverlaps', 0) / 100)) : 0;
    const overlapReverse = overlap > 0 && r.bool('layout', 'clusteredGapOverlapReverse', false);
    const stackGap = barStack !== 'none' && r.hasProp('layout', variant === 'ribbon' ? 'ribbonGapSize' : 'stackedGapSize') ? r.num('layout', variant === 'ribbon' ? 'ribbonGapSize' : 'stackedGapSize', 0) : 0;
    const reversed = r.hasProp('layout', 'seriesOrderReversed') && r.bool('layout', 'seriesOrderReversed', false);
    const order = barSeries.map((_, i) => i);
    if (reversed) order.reverse();
    const perSeries = barStack === 'none' ? (groupSize / barSeries.length) * (1 + overlap * (barSeries.length - 1)) : groupSize;
    const step = barStack === 'none' ? (groupSize - perSeries) / Math.max(1, barSeries.length - 1) : 0;
    categories.forEach((_, ci) => {
      let acc = 0;
      const total = barSeries.reduce((s, ser) => s + (ser[ci] ?? 0), 0) || 1;
      order.forEach((si) => {
        const ser = barSeries[si]!;
        const raw = ser[ci] ?? 0;
        const v = barStack === 'percent' ? (raw / total) * 100 : raw;
        const v0 = barStack === 'none' ? 0 : acc;
        const v1 = barStack === 'none' ? v : acc + v;
        if (barStack !== 'none') acc += v;
        barColumns.push({ ci, si, v0, v1, color: seriesColor(r, si, barSeries.length) });
      });
    });
    const gapPx = barStack === 'none' && barSeries.length > 1 ? clusterGap * (groupSize / barSeries.length) : 0;
    barColumns.forEach((b, idx) => {
      const slot = order.indexOf(b.si);
      const slotIdx = overlapReverse ? barSeries.length - 1 - slot : slot;
      const start = catPos(b.ci) - groupSize / 2 + (barStack === 'none' ? slotIdx * step : 0) + gapPx / 2;
      const size = Math.max(1, perSeries - gapPx);
      let p0 = valueScale(Math.max(domainMin, b.v0));
      const p1 = valueScale(Math.min(domainMax, b.v1));
      if (stackGap && b.v0 > 0) {
        if (horizontal) p0 += stackGap;
        else p0 -= stackGap;
      }
      const fill = withAlpha(b.color, fillTransparency);
      const stroke = borderShow ? (borderMatchFill ? b.color : borderColor) : 'none';
      const value = b.v1 - b.v0;
      if (horizontal) {
        nodes.push(<rect key={`b${idx}`} data-part="bar" x={Math.min(p0, p1)} y={start} width={Math.abs(p1 - p0)} height={size} fill={fill} stroke={stroke} strokeWidth={borderShow ? borderSize : 0} />);
        if (labelsShow) {
          const pos = labelPosition === 'Auto' ? (barStack !== 'none' ? 'InsideCenter' : 'OutsideEnd') : labelPosition;
          const lx = pos === 'InsideBase' ? Math.min(p0, p1) + 4 : pos === 'InsideCenter' ? (p0 + p1) / 2 : pos === 'InsideEnd' ? Math.max(p0, p1) - 4 : Math.max(p0, p1) + 4;
          const anchor = pos === 'InsideBase' ? 'start' : pos === 'InsideCenter' ? 'middle' : pos === 'InsideEnd' ? 'end' : 'start';
          nodes.push(dataLabel(lx, start + size / 2 + labelFont.sizePx * 0.35, fmtLabel(value, b.si), `l${idx}`, anchor));
        }
        if (errorOn && barStack === 'none') nodes.push(errorWhisker(start + size / 2, valueScale(b.v1 * 0.92), valueScale(Math.min(domainMax, b.v1 * 1.08)), b.color, `e${idx}`, false, b.v1));
      } else {
        nodes.push(<rect key={`b${idx}`} data-part="bar" x={start} y={Math.min(p0, p1)} width={size} height={Math.abs(p1 - p0)} fill={fill} stroke={stroke} strokeWidth={borderShow ? borderSize : 0} />);
        if (labelsShow) {
          const pos = labelPosition === 'Auto' ? (barStack !== 'none' ? 'InsideCenter' : 'OutsideEnd') : labelPosition;
          const ly = pos === 'InsideBase' ? Math.max(p0, p1) - 4 : pos === 'InsideCenter' ? (p0 + p1) / 2 + labelFont.sizePx * 0.35 : pos === 'InsideEnd' ? Math.min(p0, p1) + labelFont.sizePx + 2 : Math.min(p0, p1) - 4;
          nodes.push(dataLabel(start + size / 2, ly, fmtLabel(value, b.si), `l${idx}`, labelVertical ? 'start' : 'middle', labelVertical));
        }
        if (errorOn && barStack === 'none') nodes.push(errorWhisker(start + size / 2, valueScale(Math.min(domainMax, b.v1 * 1.08)), valueScale(b.v1 * 0.92), b.color, `e${idx}`, true, b.v1));
      }
    });
    // ribbon connectors
    if (variant === 'ribbon' && r.bool('ribbonBands', 'show', true)) {
      const ribbonTransparency = r.num('ribbonBands', 'fillTransparency', 70);
      const matchColor = r.bool('ribbonBands', 'fillMatchColor', true);
      const ribbonColor = r.color('ribbonBands', 'fillColor', r.structural.secondaryBackground);
      const rbBorder = r.bool('ribbonBands', 'borderShow', false);
      const rbBorderColor = withAlpha(r.color('ribbonBands', 'borderColor', '#FFFFFF'), r.num('ribbonBands', 'borderTransparency', 0));
      const rbBorderMatch = r.bool('ribbonBands', 'borderColorMatchFill', false);
      const rbBorderSize = r.num('ribbonBands', 'borderSize', 1);
      for (let ci = 0; ci < catCount - 1; ci++) {
        barSeries.forEach((_, si) => {
          const a = barColumns.find((b) => b.ci === ci && b.si === si)!;
          const b = barColumns.find((b) => b.ci === ci + 1 && b.si === si)!;
          const x0 = catPos(ci) + groupSize / 2;
          const x1 = catPos(ci + 1) - groupSize / 2;
          const d = `M${x0},${valueScale(a.v0)} C${(x0 + x1) / 2},${valueScale(a.v0)} ${(x0 + x1) / 2},${valueScale(b.v0)} ${x1},${valueScale(b.v0)} L${x1},${valueScale(b.v1)} C${(x0 + x1) / 2},${valueScale(b.v1)} ${(x0 + x1) / 2},${valueScale(a.v1)} ${x0},${valueScale(a.v1)} Z`;
          nodes.push(<path key={`rb${ci}-${si}`} data-part="ribbon" d={d} fill={withAlpha(matchColor ? a.color : ribbonColor, ribbonTransparency)} stroke={rbBorder ? (rbBorderMatch ? a.color : rbBorderColor) : 'none'} strokeWidth={rbBorder ? rbBorderSize : 0} />);
        });
      }
    }
    // stacked totals (not on 100 % charts: every stack is 100 %)
    if (barStack === 'stacked' && r.hasCard('totals') && r.bool('totals', 'show', false)) {
      const tf = r.font('totals', 'color', r.structural.first, 9, { textClass: 'label' });
      const tUnit = resolveUnit(r.num('totals', 'labelDisplayUnits', 0), stackedTotals.map((v) => v * 1000));
      const tPrec = precisionOf(r, 'totals', 'labelPrecision');
      const tBg = r.bool('totals', 'enableBackground', false);
      const tBgColor = withAlpha(r.color('totals', 'backgroundColor', '#FFFFFF'), r.num('totals', 'backgroundTransparency', 90));
      categories.forEach((_, ci) => {
        const total = barSeries.reduce((s, ser) => s + (ser[ci] ?? 0), 0);
        const p = valueScale(Math.min(domainMax, total));
        const text = formatWithUnit(total * 1000, tUnit, tPrec);
        const w = text.length * tf.sizePx * 0.55 + 6;
        nodes.push(
          <g key={`t${ci}`} data-part="total-label">
            {tBg && (horizontal ? <rect x={p + 2} y={catPos(ci) - tf.sizePx * 0.7} width={w} height={tf.sizePx + 4} fill={tBgColor} rx={2} /> : <rect x={catPos(ci) - w / 2} y={p - 4 - tf.sizePx} width={w} height={tf.sizePx + 4} fill={tBgColor} rx={2} />)}
            {horizontal ? (
              <text x={p + 4} y={catPos(ci) + tf.sizePx * 0.35} {...textProps(tf)}>{text}</text>
            ) : (
              <text x={catPos(ci)} y={p - 4} textAnchor="middle" {...textProps(tf)}>{text}</text>
            )}
          </g>,
        );
      });
    }
  }

  // ---- waterfall: running total, final total bar ----
  if (isWaterfall) {
    const inc = r.color('sentimentColors', 'increaseFill', r.structural.good);
    const dec = r.color('sentimentColors', 'decreaseFill', r.structural.bad);
    const tot = r.color('sentimentColors', 'totalFill', r.structural.second);
    let run = 0;
    const size = groupSize;
    const steps = [...WATERFALL.map((w, i) => ({ ...w, total: i === 0 })), { label: 'Gesamt', value: 0, total: true }];
    steps.forEach((w, ci) => {
      const isTotal = w.total;
      const v0 = isTotal ? 0 : run;
      const v1 = isTotal ? (ci === 0 ? w.value : run) : run + w.value;
      run = v1;
      const x = catPos(ci) - size / 2;
      const y0 = valueScale(Math.max(domainMin, v0));
      const y1 = valueScale(Math.min(domainMax, v1));
      nodes.push(<rect key={`w${ci}`} data-part="bar" x={x} y={Math.min(y0, y1)} width={size} height={Math.max(1, Math.abs(y1 - y0))} fill={isTotal ? tot : w.value >= 0 ? inc : dec} />);
      if (ci < steps.length - 1) nodes.push(<line key={`wc${ci}`} x1={x + size} x2={catPos(ci + 1) - size / 2} y1={y1} y2={y1} stroke={r.structural.fourth} strokeWidth={1} />);
      if (labelsShow) nodes.push(dataLabel(catPos(ci), Math.min(y0, y1) - 4, fmtLabel(isTotal ? v1 : Math.abs(w.value)), `wl${ci}`));
    });
  }

  // ---- lines / areas ----
  const lineSeriesIdx = isLine ? rawSeries.map((_, i) => i) : variant === 'combo' && options.comboLine ? [seriesCount - 1] : [];
  if (lineSeriesIdx.length > 0) {
    const areaShow = variant === 'area' || r.bool('lineStyles', 'areaShow', false);
    const areaMatch = r.bool('lineStyles', 'areaMatchStrokeColor', true);
    const areaColor = r.color('lineStyles', 'areaColor', '');
    const strokeTransparency = r.num('lineStyles', 'strokeTransparency', 0);
    const seriesLabelsOn = r.hasCard('seriesLabels') && r.bool('seriesLabels', 'show', false);
    const seriesLabelFont = seriesLabelsOn ? r.font('seriesLabels', 'seriesColor', r.structural.second, 9, { props: { family: 'seriesFontFamily', size: 'textSize' }, textClass: 'label' }) : labelFont;
    const seriesLabelPos = seriesLabelsOn ? r.str('seriesLabels', 'seriesPosition', 'Right') : 'Right';
    const seriesLabelBg = seriesLabelsOn && r.bool('seriesLabels', 'enableBackground', false);
    const seriesLabelBgColor = seriesLabelBg ? withAlpha(r.color('seriesLabels', 'backgroundColor', '#FFFFFF'), r.num('seriesLabels', 'backgroundTransparency', 90)) : 'none';
    const stackedAcc = categories.map(() => 0);
    const seriesPoints: Point[][] = [];
    lineSeriesIdx.forEach((si) => {
      const ser = rawSeries[si] ?? [];
      const color = seriesColor(r, si, isLine ? rawSeries.length : seriesCount);
      const lineColor = strokeColorOverride || color;
      const onSecondary = secScale && ((variant === 'combo' && options.comboLine) || si === secondaryIdx);
      const scale = onSecondary ? secScale : valueScale;
      const pts: Point[] = [];
      const base: Point[] = [];
      categories.forEach((_, ci) => {
        const raw = ser[ci] ?? 0;
        const total = stackedTotals[ci] || 1;
        const v = stack === 'percent' ? (raw / total) * 100 : raw;
        const v0 = stack === 'none' ? 0 : stackedAcc[ci]!;
        const v1 = stack === 'none' ? v : v0 + v;
        if (stack !== 'none') stackedAcc[ci] = v1;
        pts.push([catPos(ci), scale(v1)]);
        base.push([catPos(ci), scale(v0)]);
      });
      seriesPoints.push(pts);
      if (areaShow) {
        const d = `${linePath(pts, lineShape)} L${base[base.length - 1]![0]},${base[base.length - 1]![1]} ${[...base].reverse().slice(1).map(([x, y]) => `L${x},${y}`).join(' ')} Z`;
        nodes.push(<path key={`a${si}`} data-part="area" d={d} fill={withAlpha(areaMatch || !areaColor ? color : areaColor, variant === 'area' ? 40 : 60)} stroke="none" />);
      }
      if (errorShade) {
        const hi = pts.map(([x, y], ci) => [x, y - (scale(0) - scale((ser[ci] ?? 0) * 0.08))] as Point);
        const lo = pts.map(([x, y], ci) => [x, y + (scale(0) - scale((ser[ci] ?? 0) * 0.08))] as Point);
        nodes.push(<path key={`es${si}`} data-part="error-shade" d={`${linePath(hi, lineShape)} ${[...lo].reverse().map(([x, y]) => `L${x},${y}`).join(' ')} Z`} fill={errorShadeMatch ? withAlpha(color, 80) : errorShadeColor} />);
      }
      if (strokeShow) nodes.push(<path key={`ln${si}`} data-part="line" d={linePath(pts, lineShape)} fill="none" stroke={withAlpha(lineColor, strokeTransparency)} strokeWidth={strokeWidth} strokeDasharray={lineDash} strokeLinejoin={lineJoin} strokeLinecap={lineCapStyle} />);
      if (showMarker) pts.forEach(([x, y], i) => nodes.push(marker(markerShape, x, y, markerSize * 1.6, markerStyle(markerColor || color), `m${si}-${i}`)));
      if (errorOn && !errorShade) pts.forEach(([x, y], ci) => nodes.push(errorWhisker(x, y - (scale(0) - scale((ser[ci] ?? 0) * 0.08)), y + (scale(0) - scale((ser[ci] ?? 0) * 0.08)), color, `el${si}-${ci}`, true, ser[ci] ?? 0)));
      if (labelsShow) {
        const under = labelPosition === 'Under';
        pts.forEach(([x, y], ci) => nodes.push(dataLabel(x, under ? y + labelFont.sizePx + 4 : y - 6, fmtLabel(ser[ci] ?? 0, si), `ll${si}-${ci}`)));
      }
      if (seriesLabelsOn) {
        const end = seriesLabelPos === 'Left' ? pts[0]! : pts[pts.length - 1]!;
        const text = SERIES_NAMES[si] ?? `Serie ${si + 1}`;
        const w = text.length * seriesLabelFont.sizePx * 0.55 + 6;
        const x = seriesLabelPos === 'Left' ? end[0] - 4 : end[0] + 4;
        nodes.push(
          <g key={`sl${si}`} data-part="series-label">
            {seriesLabelBg && <rect x={seriesLabelPos === 'Left' ? x - w : x - 2} y={end[1] - seriesLabelFont.sizePx * 0.8} width={w} height={seriesLabelFont.sizePx + 4} fill={seriesLabelBgColor} rx={2} />}
            <text x={x} y={end[1] + seriesLabelFont.sizePx * 0.35} textAnchor={seriesLabelPos === 'Left' ? 'end' : 'start'} {...textProps(seriesLabelFont)}>{text}</text>
          </g>,
        );
      }
    });
    // anomalies (line charts): one highlighted point with its expected range
    if (r.hasCard('anomalyDetection') && r.bool('anomalyDetection', 'show', false) && seriesPoints[0]) {
      const pts = seriesPoints[0];
      const ci = Math.min(pts.length - 1, 3);
      const [ax, ay] = pts[ci]!;
      const band = Math.max(8, (plot.height || 100) * 0.08);
      if (r.bool('anomalyDetection', 'confidenceBandShow', true)) {
        const bandColor = withAlpha(r.color('anomalyDetection', 'confidenceBandColor', r.structural.fourth), r.num('anomalyDetection', 'transparency', 70));
        const hi = pts.map(([x, y]) => [x, y - band] as Point);
        const lo = pts.map(([x, y]) => [x, y + band] as Point);
        back.push(<path key="anomaly-band" data-part="anomaly-band" d={`${linePath(hi, lineShape)} ${[...lo].reverse().map(([x, y]) => `L${x},${y}`).join(' ')} Z`} fill={bandColor} />);
      }
      if (r.bool('anomalyDetection', 'markerShow', true)) {
        const mBorder = r.bool('anomalyDetection', 'markerBorderShow', true);
        const mColor = r.color('anomalyDetection', 'markerColor', r.structural.bad);
        front.push(marker(r.str('anomalyDetection', 'markerShape', 'circle'), ax, ay, r.num('anomalyDetection', 'markerShapeSize', 8) * 1.4, {
          fill: withAlpha(mColor, r.num('anomalyDetection', 'markerTransparency', 0)),
          stroke: mBorder ? (r.bool('anomalyDetection', 'markerBorderColorMatchFill', false) ? mColor : withAlpha(r.color('anomalyDetection', 'markerBorderColor', '#FFFFFF'), r.num('anomalyDetection', 'markerBorderTransparency', 0))) : undefined,
          strokeWidth: mBorder ? r.num('anomalyDetection', 'markerBorderWidth', 1) : undefined,
          rotation: r.num('anomalyDetection', 'markerRotation', 0),
        }, 'anomaly'));
      }
    }
    // forecast (line charts): continuation of the first series with a confidence band
    if (r.hasCard('forecast') && r.bool('forecast', 'show', false) && seriesPoints[0] && seriesPoints[0].length >= 2) {
      const pts = seriesPoints[0];
      const n = pts.length;
      const [x0, y0] = pts[n - 3] ?? pts[0]!;
      const [x1, y1] = pts[n - 1]!;
      const fx = plot.x + plot.width;
      const slope = (y1 - y0) / Math.max(1, x1 - x0);
      const fy = Math.max(plot.y, Math.min(plot.y + plot.height, y1 + slope * (fx - x1)));
      const fColor = r.color('forecast', 'lineColor', r.structural.first);
      const fWidth = r.num('forecast', 'width', 2);
      const fDash = strokeDash(r, 'forecast', 'style', fWidth);
      const spread = Math.max(6, plot.height * 0.1);
      if (r.bool('forecast', 'bandAreaShow', true)) {
        const bandColor = withAlpha(r.bool('forecast', 'bandAreaMatchColor', true) ? fColor : r.color('forecast', 'bandAreaColor', fColor), r.num('forecast', 'bandAreaTransparency', 80));
        back.push(<path key="forecast-band" data-part="forecast-band" d={`M${x1},${y1} L${fx},${fy - spread} L${fx},${fy + spread} Z`} fill={bandColor} />);
      }
      if (r.bool('forecast', 'bandLineShow', true)) {
        const blColor = withAlpha(r.bool('forecast', 'bandLineMatchColor', true) ? fColor : r.color('forecast', 'bandLineColor', fColor), r.num('forecast', 'bandLineTransparency', 0));
        const blW = r.num('forecast', 'bandLineWidth', 1);
        nodes.push(<path key="forecast-band-line" d={`M${x1},${y1} L${fx},${fy - spread} M${x1},${y1} L${fx},${fy + spread}`} fill="none" stroke={blColor} strokeWidth={blW} strokeDasharray={strokeDash(r, 'forecast', 'bandLinePattern', blW)} />);
      }
      nodes.push(<line key="forecast" data-part="forecast" x1={x1} y1={y1} x2={fx} y2={fy} stroke={withAlpha(fColor, r.num('forecast', 'strokeTransparency', 0))} strokeWidth={fWidth} strokeDasharray={fDash} strokeLinecap={lineCap(r, 'forecast', 'dashCap')} />);
    }
  }

  // ---- scatter ----
  if (isScatter) {
    const color = seriesColor(r, 0, 1);
    const byCategory = r.hasCard('colorByCategory') && r.bool('colorByCategory', 'show', false);
    const fillOnly = r.str('fillPoint', 'style', 'Fill only') === 'Fill only';
    const bubbleSize = r.num('bubbles', 'bubbleSize', 0);
    const shape = r.str('bubbles', 'markerShape', 'circle');
    const catLabels = r.bool('categoryLabels', 'show', false);
    const catLabelFontS = r.font('categoryLabels', 'color', r.structural.second, 9, { textClass: 'label' });
    const catLabelBg = catLabels && r.bool('categoryLabels', 'enableBackground', false);
    const catLabelBgColor = catLabelBg ? withAlpha(r.color('categoryLabels', 'backgroundColor', '#FFFFFF'), r.num('categoryLabels', 'backgroundTransparency', 90)) : 'none';
    if (r.bool('plotAreaShading', 'show', false)) {
      const t = r.num('plotAreaShading', 'transparency', 90);
      const upper = withAlpha(r.color('plotAreaShading', 'upperShadingColor', r.dataColor(0)), t);
      const lower = withAlpha(r.color('plotAreaShading', 'lowerShadingColor', r.dataColor(1)), t);
      back.push(<polygon key="shade-upper" data-part="shade-upper" points={`${plot.x},${plot.y} ${plot.x + plot.width},${plot.y} ${plot.x},${plot.y + plot.height}`} fill={upper} />);
      back.push(<polygon key="shade-lower" data-part="shade-lower" points={`${plot.x + plot.width},${plot.y} ${plot.x + plot.width},${plot.y + plot.height} ${plot.x},${plot.y + plot.height}`} fill={lower} />);
    }
    SCATTER.forEach(([x, y, s], i) => {
      const cx = xScale(x!);
      const cy = valueScale(y!);
      const size = Math.max(4, (s! * 0.9 + 4) * (1 + bubbleSize / 100));
      const c = byCategory ? r.dataColor(i % CATEGORIES.length) : color;
      nodes.push(marker(shape, cx, cy, size, fillOnly ? { ...markerStyle(c), fill: withAlpha(c, markerOpacity < 1 ? 0 : fillTransparency) } : { fill: 'none', stroke: c, strokeWidth: 1.5, rotation: markerRotation }, `s${i}`));
      if (catLabels) {
        const text = CATEGORIES[i % CATEGORIES.length]!;
        const w = text.length * catLabelFontS.sizePx * 0.55 + 6;
        nodes.push(
          <g key={`sl${i}`}>
            {catLabelBg && <rect x={cx - w / 2} y={cy - size / 2 - 3 - catLabelFontS.sizePx} width={w} height={catLabelFontS.sizePx + 4} fill={catLabelBgColor} rx={2} />}
            <text x={cx} y={cy - size / 2 - 3} textAnchor="middle" {...textProps(catLabelFontS)}>{text}</text>
          </g>,
        );
      }
    });
    if (r.bool('ratioLine', 'show', false)) {
      const w = r.num('ratioLine', 'width', 1);
      nodes.push(<line key="ratio" data-part="ratio-line" x1={plot.x} y1={plot.y + plot.height} x2={plot.x + plot.width} y2={plot.y} stroke={withAlpha(r.color('ratioLine', 'lineColor', r.structural.first), r.num('ratioLine', 'transparency', 0))} strokeWidth={w} strokeDasharray={strokeDash(r, 'ratioLine', 'style', w)} strokeLinecap={lineCap(r, 'ratioLine', 'dashCap')} />);
    }
  }

  // ---- trend line ----
  if (!isWaterfall && r.hasCard('trend') && r.bool('trend', 'show', false)) {
    const lc = withAlpha(r.color('trend', 'lineColor', r.structural.first), r.num('trend', 'transparency', 0));
    const w = r.num('trend', 'width', 2);
    const d = strokeDash(r, 'trend', 'style', w);
    const cap = lineCap(r, 'trend', 'dashCap');
    front.push(horizontal
      ? <line key="trend" data-part="trend" x1={valueScale(domainMin + (domainMax - domainMin) * 0.35)} y1={plot.y} x2={valueScale(domainMin + (domainMax - domainMin) * 0.75)} y2={plot.y + plot.height} stroke={lc} strokeWidth={w} strokeDasharray={d} strokeLinecap={cap} />
      : <line key="trend" data-part="trend" x1={plot.x} y1={valueScale(domainMin + (domainMax - domainMin) * 0.35)} x2={plot.x + plot.width} y2={valueScale(domainMin + (domainMax - domainMin) * 0.75)} stroke={lc} strokeWidth={w} strokeDasharray={d} strokeLinecap={cap} />);
  }

  // ---- reference lines: value axis (y1AxisReferenceLine / referenceLine) and category axis (xAxisReferenceLine) ----
  const refLineUnit = valueUnit;
  for (const card of ['y1AxisReferenceLine', 'referenceLine', 'xAxisReferenceLine'] as const) {
    if (!r.hasCard(card) || !r.bool(card, 'show', false)) continue;
    const onCategory = card === 'xAxisReferenceLine';
    // vertical charts: value lines are horizontal, category lines vertical (and vice versa for bar charts)
    const lineIsHorizontal = onCategory ? horizontal : !horizontal;
    const rawValue = r.num(card, 'value', NaN);
    let p: number;
    let displayValue: string;
    if (onCategory) {
      const idx = isScatter ? undefined : Math.min(catCount - 1, Math.max(0, Number.isFinite(rawValue) ? Math.round(rawValue) : Math.floor(catCount / 2)));
      p = isScatter ? xScale(Number.isFinite(rawValue) ? rawValue : 50) : catPos(idx!);
      displayValue = isScatter ? formatWithUnit(Number.isFinite(rawValue) ? rawValue : 50, xUnit, r.num(card, 'dataLabelDecimalPoints', 0)) : categories[idx!]!;
    } else {
      const value = Number.isFinite(rawValue) && rawValue !== 0 ? Math.min(domainMax, Math.max(domainMin, rawValue)) : domainMin + (domainMax - domainMin) * 0.6;
      p = valueScale(value);
      const unit = resolveUnit(r.num(card, 'dataLabelDisplayUnits', 0), [value * valueFactor]) || refLineUnit;
      displayValue = formatWithUnit(value * valueFactor, unit, r.num(card, 'dataLabelDecimalPoints', 0));
    }
    const lc = withAlpha(r.color(card, 'lineColor', r.structural.first), r.num(card, 'transparency', 0));
    const w = r.num(card, 'width', 2);
    const d = strokeDash(r, card, 'style', w);
    const cap = lineCap(r, card, 'dashCap');
    const layer = r.str(card, 'position', 'back') === 'front' ? front : back;
    // shading before/after the line
    if (r.bool(card, 'shadeShow', false)) {
      const region = r.str(card, 'shadeRegion', 'none');
      if (region !== 'none') {
        const shadeColor = withAlpha(r.bool(card, 'shadeColorMatchStroke', false) ? r.color(card, 'lineColor', r.structural.first) : r.color(card, 'shadeColor', r.structural.first), r.num(card, 'shadeTransparency', 90));
        let sx = plot.x, sy = plot.y, sw = plot.width, sh = plot.height;
        if (lineIsHorizontal) {
          // "before" = lower values (below the line in a vertical chart)
          if (region === 'before') { sy = p; sh = plot.y + plot.height - p; } else { sh = p - plot.y; }
        } else if (region === 'before') { sw = p - plot.x; } else { sx = p; sw = plot.x + plot.width - p; }
        layer.push(<rect key={`${card}-shade`} data-part="reference-shade" x={sx} y={sy} width={Math.max(0, sw)} height={Math.max(0, sh)} fill={shadeColor} />);
      }
    }
    layer.push(lineIsHorizontal
      ? <line key={card} data-part="reference-line" x1={plot.x} x2={plot.x + plot.width} y1={p} y2={p} stroke={lc} strokeWidth={w} strokeDasharray={d} strokeLinecap={cap} />
      : <line key={card} data-part="reference-line" x1={p} x2={p} y1={plot.y} y2={plot.y + plot.height} stroke={lc} strokeWidth={w} strokeDasharray={d} strokeLinecap={cap} />);
    if (r.bool(card, 'dataLabelShow', false)) {
      const lf = r.font(card, 'dataLabelColor', lc, 9, { props: { family: 'dataLabelFontFamily', size: false, bold: 'dataLabelBold', italic: 'dataLabelItalic', underline: 'dataLabelUnderline' }, textClass: 'label' });
      const name = r.str(card, 'displayName', '') || 'Bezugslinie';
      const kind = r.str(card, 'dataLabelText', 'Value');
      const text = kind === 'Name' ? name : kind === 'ValueAndName' ? `${name} ${displayValue}` : displayValue;
      const hPos = r.str(card, 'dataLabelHorizontalPosition', 'left');
      const vPos = r.str(card, 'dataLabelVerticalPosition', 'above');
      if (lineIsHorizontal) {
        const x = hPos === 'right' ? plot.x + plot.width - 2 : plot.x + 2;
        const y = vPos === 'under' ? p + lf.sizePx + 2 : p - 3;
        front.push(<text key={`${card}l`} data-part="reference-label" x={x} y={y} textAnchor={hPos === 'right' ? 'end' : 'start'} {...textProps(lf)}>{text}</text>);
      } else {
        const x = hPos === 'right' ? p + 3 : p - 3;
        const y = vPos === 'under' ? plot.y + plot.height - 3 : plot.y + lf.sizePx;
        front.push(<text key={`${card}l`} data-part="reference-label" x={x} y={y} textAnchor={hPos === 'right' ? 'start' : 'end'} {...textProps(lf)}>{text}</text>);
      }
    }
  }

  // ---- axis labels (Power BI draws no axis lines, only labels, titles and gridlines) ----
  const tickText = (axis: AxisStyle, x: number, y: number, anchor: 'start' | 'middle' | 'end', text: string, key: string) => (
    <text key={key} data-part="axis-label" x={x} y={y} textAnchor={anchor} {...textProps(axis.font)}>{text}</text>
  );
  if (horizontal) {
    if (catAxis.show) categories.forEach((c, ci) => nodes.push(tickText(catAxis, plot.x - 6, catPos(ci) + catLabelFont.sizePx * 0.35, 'end', truncate(c, plot.x - afterLegend.x - 8, catLabelFont.sizePx), `cl${ci}`)));
    if (valAxis.show) ticks.forEach((t, i) => nodes.push(tickText(valAxis, valueScale(t), valAxis.switchPosition ? plot.y - 4 : plot.y + plot.height + valLabelFont.sizePx + 4, 'middle', tickLabels[i]!, `vl${i}`)));
    if (catAxis.showTitle) nodes.push(<text key="ct" data-part="axis-title" transform={`translate(${afterLegend.x + catAxis.titleFont.sizePx},${plot.y + plot.height / 2}) rotate(-90)`} textAnchor="middle" {...textProps(catAxis.titleFont)}>{catAxis.titleText}</text>);
    if (valAxis.showTitle) nodes.push(<text key="vt" data-part="axis-title" x={plot.x + plot.width / 2} y={afterLegend.y + afterLegend.height - 2} textAnchor="middle" {...textProps(valAxis.titleFont)}>{valAxis.titleText}</text>);
  } else {
    if (catAxis.show) {
      if (isScatter) xTicks.forEach((t, i) => nodes.push(tickText(catAxis, xScale(t), plot.y + plot.height + catLabelFont.sizePx + 4, 'middle', xTickLabels[i]!, `cl${i}`)));
      else categories.forEach((c, ci) => nodes.push(tickText(catAxis, catPos(ci), plot.y + plot.height + catLabelFont.sizePx + 4, 'middle', truncate(c, bandSize - 4, catLabelFont.sizePx), `cl${ci}`)));
    }
    if (valAxis.show) ticks.forEach((t, i) => nodes.push(tickText(valAxis, valAxis.switchPosition ? plot.x + plot.width + 6 : plot.x - 6, valueScale(t) + valLabelFont.sizePx * 0.35, valAxis.switchPosition ? 'start' : 'end', tickLabels[i]!, `vl${i}`)));
    if (y2Axis?.show && secScale) {
      secTicks.forEach((t, i) => nodes.push(<text key={`y2l${i}`} data-part="secondary-axis" x={plot.x + plot.width + 6} y={secScale(t) + y2Axis.font.sizePx * 0.35} textAnchor="start" {...textProps(y2Axis.font)}>{secTickLabels[i]}</text>));
      if (y2Axis.showTitle) nodes.push(<text key="y2t" data-part="axis-title" transform={`translate(${right + y2Axis.titleFont.sizePx * 0.4 + maxLabelWidth(secTickLabels, y2Axis.font) + 10},${plot.y + plot.height / 2}) rotate(90)`} textAnchor="middle" {...textProps(y2Axis.titleFont)}>{y2Axis.titleText}</text>);
    }
    if (valAxis.showTitle) nodes.push(<text key="vt" data-part="axis-title" transform={`translate(${afterLegend.x + valAxis.titleFont.sizePx},${plot.y + plot.height / 2}) rotate(-90)`} textAnchor="middle" {...textProps(valAxis.titleFont)}>{valAxis.titleText}</text>);
    if (catAxis.showTitle) nodes.push(<text key="ct" data-part="axis-title" x={plot.x + plot.width / 2} y={afterLegend.y + afterLegend.height - 2 - (zoomShow ? 10 : 0)} textAnchor="middle" {...textProps(catAxis.titleFont)}>{catAxis.titleText}</text>);
  }
  // baseline at zero when the axis starts below zero (Power BI draws the zero line)
  if (domainMin < 0 && !isScatter) nodes.push(horizontal ? <line key="zero" x1={zeroPos} x2={zeroPos} y1={plot.y} y2={plot.y + plot.height} stroke={r.structural.fourth} /> : <line key="zero" x1={plot.x} x2={plot.x + plot.width} y1={zeroPos} y2={zeroPos} stroke={r.structural.fourth} />);

  // ---- zoom slider ----
  if (zoomShow) {
    const sc = r.structural.fourth;
    nodes.push(horizontal
      ? <g key="zoom"><rect x={afterLegend.x + 2} y={plot.y} width={4} height={plot.height} rx={2} fill={r.structural.third} /><rect x={afterLegend.x + 2} y={plot.y + plot.height * 0.1} width={4} height={plot.height * 0.6} rx={2} fill={sc} /></g>
      : <g key="zoom"><rect x={plot.x} y={afterLegend.y + afterLegend.height - 6} width={plot.width} height={4} rx={2} fill={r.structural.third} /><rect x={plot.x + plot.width * 0.1} y={afterLegend.y + afterLegend.height - 6} width={plot.width * 0.6} height={4} rx={2} fill={sc} /></g>);
  }

  const plotTransparency = r.num('plotArea', 'transparency', 0);
  return (
    <g data-part="cartesian" data-uid={uid}>
      {plotTransparency < 100 && plotTransparency > 0 && <rect x={plot.x} y={plot.y} width={plot.width} height={plot.height} fill={withAlpha(r.structural.background, plotTransparency)} />}
      {legendEl}
      {back}
      {nodes}
      {front}
    </g>
  );
}

