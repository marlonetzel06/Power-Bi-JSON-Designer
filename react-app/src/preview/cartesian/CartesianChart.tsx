import type { ReactNode } from 'react';
import { truncate } from '../fonts';
import { textProps, withAlpha, type Resolver } from '../resolver';
import { CATEGORIES, MONTHS, SERIES, SERIES_NAMES, TIME_SERIES, WATERFALL, SCATTER, formatNumber } from '../sampleData';
import type { BodyProps, Rect } from '../types';
import { layoutLegend, type LegendItem } from './Legend';
import { dashArray, maxLabelWidth, niceTicks, readAxis, type AxisStyle } from './axis';

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

function pathFromPoints(points: [number, number][], type: string): string {
  if (points.length === 0) return '';
  if (type === 'smooth') {
    let d = `M${points[0]![0]},${points[0]![1]}`;
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1]!;
      const [x1, y1] = points[i]!;
      const cx = (x0 + x1) / 2;
      d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    return d;
  }
  if (type === 'step') {
    let d = `M${points[0]![0]},${points[0]![1]}`;
    for (let i = 1; i < points.length; i++) {
      const [x0] = points[i - 1]!;
      const [x1, y1] = points[i]!;
      const mx = (x0 + x1) / 2;
      d += ` H${mx} V${y1} H${x1}`;
    }
    return d;
  }
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
}

const MARKER_SIZE_DEFAULT = 5;

function marker(shape: string, cx: number, cy: number, size: number, fill: string, key: string, stroke?: string, strokeWidth?: number) {
  const s = size;
  const common = { fill, stroke, strokeWidth };
  switch (shape) {
    case 'square':
      return <rect key={key} x={cx - s / 2} y={cy - s / 2} width={s} height={s} {...common} />;
    case 'diamond':
      return <polygon key={key} points={`${cx},${cy - s / 2} ${cx + s / 2},${cy} ${cx},${cy + s / 2} ${cx - s / 2},${cy}`} {...common} />;
    case 'triangle':
      return <polygon key={key} points={`${cx},${cy - s / 2} ${cx + s / 2},${cy + s / 2} ${cx - s / 2},${cy + s / 2}`} {...common} />;
    case 'x':
      return <path d={`M${cx - s / 2},${cy - s / 2} L${cx + s / 2},${cy + s / 2} M${cx + s / 2},${cy - s / 2} L${cx - s / 2},${cy + s / 2}`} stroke={fill} strokeWidth={2} fill="none" key={key} />;
    default:
      return <circle key={key} cx={cx} cy={cy} r={s / 2} {...common} />;
  }
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
  const categories = isLine ? MONTHS : isWaterfall ? WATERFALL.map((w) => w.label) : CATEGORIES;
  const rawSeries = (isLine ? TIME_SERIES : SERIES).slice(0, seriesCount);
  const legendItems: LegendItem[] = isScatter
    ? [{ label: 'Umsatz', color: seriesColor(r, 0, 1), marker: 'circle' }]
    : isWaterfall
      ? [
          { label: 'Anstieg', color: r.color('sentimentColors', 'increaseFill', r.structural.good) },
          { label: 'Rückgang', color: r.color('sentimentColors', 'decreaseFill', r.structural.bad) },
          { label: 'Gesamt', color: r.color('sentimentColors', 'totalFill', r.structural.second) },
        ]
      : rawSeries.map((_, i) => ({ label: SERIES_NAMES[i] ?? `Serie ${i + 1}`, color: seriesColor(r, i, seriesCount), marker: isLine && variant === 'line' ? 'line' : 'square' }));

  const { plot: afterLegend, element: legendEl } = layoutLegend(r, rect, legendItems);

  const catAxis = readAxis(r, 'categoryAxis', false, isLine ? 'Monat' : 'Region');
  const valAxis = readAxis(r, 'valueAxis', true, 'Umsatz');
  const y2Axis = options.comboLine ? readAxis(r, 'y2Axis', false, 'Plan') : undefined;

  // values & domain
  let maxValue: number;
  const stackedTotals = categories.map((_, ci) => rawSeries.reduce((sum, s) => sum + (s[ci] ?? 0), 0));
  if (isWaterfall) {
    let run = 0;
    maxValue = 0;
    for (const w of WATERFALL) {
      run += w.value;
      maxValue = Math.max(maxValue, run);
    }
  } else if (isScatter) {
    maxValue = 100;
  } else if (stack === 'percent') {
    maxValue = 100;
  } else if (stack === 'stacked') {
    maxValue = Math.max(...stackedTotals);
  } else {
    maxValue = Math.max(...rawSeries.flat());
  }
  const ticks = stack === 'percent' ? [0, 20, 40, 60, 80, 100] : niceTicks(maxValue, 5);
  const domainMax = ticks[ticks.length - 1] ?? maxValue;
  const fmtTick = (v: number) => (stack === 'percent' ? `${v} %` : formatNumber(v * (isScatter ? 1 : 1000), valAxis.displayUnits, valAxis.precision));
  const tickLabels = ticks.map(fmtTick);

  // axis space
  const catLabelFont = catAxis.font;
  const valLabelFont = valAxis.font;
  const titleGap = 4;
  let left = afterLegend.x;
  let right = afterLegend.x + afterLegend.width;
  const top = afterLegend.y + 4;
  let bottom = afterLegend.y + afterLegend.height;
  if (horizontal) {
    if (catAxis.show) left += Math.min(afterLegend.width * 0.35, maxLabelWidth(categories, catLabelFont) + 8);
    if (catAxis.showTitle) left += catAxis.titleFont.sizePx + titleGap;
    if (valAxis.show) bottom -= valLabelFont.sizePx * 1.4 + 4;
    if (valAxis.showTitle) bottom -= valAxis.titleFont.sizePx + titleGap;
  } else {
    if (valAxis.show) left += maxLabelWidth(tickLabels, valLabelFont) + 8;
    if (valAxis.showTitle) left += valAxis.titleFont.sizePx + titleGap;
    if (catAxis.show) bottom -= catLabelFont.sizePx * 1.4 + 4;
    if (catAxis.showTitle) bottom -= catAxis.titleFont.sizePx + titleGap;
    if (y2Axis?.show) right -= maxLabelWidth(tickLabels, y2Axis.font) + 8 + (y2Axis.showTitle ? y2Axis.titleFont.sizePx + titleGap : 0);
  }
  const zoomShow = r.bool('zoom', 'show', false);
  if (zoomShow) {
    if (horizontal) left += 10;
    else bottom -= 10;
  }
  const plot: Rect = { x: left, y: top, width: Math.max(10, right - left), height: Math.max(10, bottom - top) };

  const valueScale = horizontal
    ? linear([0, domainMax], valAxis.invert ? [plot.x + plot.width, plot.x] : [plot.x, plot.x + plot.width])
    : linear([0, domainMax], valAxis.invert ? [plot.y, plot.y + plot.height] : [plot.y + plot.height, plot.y]);
  const catCount = categories.length;
  const bandSize = (horizontal ? plot.height : plot.width) / catCount;
  const innerPadding = Math.min(0.6, Math.max(0, r.num('categoryAxis', 'innerPadding', variant === 'ribbon' ? 45 : 20) / 100));
  const groupSize = bandSize * (1 - innerPadding);
  const catPos = (ci: number) => (horizontal ? plot.y : plot.x) + bandSize * (catAxis.invert ? catCount - 1 - ci : ci) + bandSize / 2;

  const nodes: ReactNode[] = [];

  // gridlines
  if (valAxis.gridShow) {
    for (const t of ticks) {
      const p = valueScale(t);
      nodes.push(
        horizontal ? (
          <line key={`vg${t}`} x1={p} x2={p} y1={plot.y} y2={plot.y + plot.height} stroke={valAxis.gridColor} strokeWidth={valAxis.gridWidth} strokeDasharray={valAxis.gridDash} opacity={valAxis.gridOpacity} />
        ) : (
          <line key={`vg${t}`} x1={plot.x} x2={plot.x + plot.width} y1={p} y2={p} stroke={valAxis.gridColor} strokeWidth={valAxis.gridWidth} strokeDasharray={valAxis.gridDash} opacity={valAxis.gridOpacity} />
        ),
      );
    }
  }
  if (catAxis.gridShow) {
    for (let ci = 0; ci <= catCount; ci++) {
      const p = (horizontal ? plot.y : plot.x) + bandSize * ci;
      nodes.push(
        horizontal ? (
          <line key={`cg${ci}`} x1={plot.x} x2={plot.x + plot.width} y1={p} y2={p} stroke={catAxis.gridColor} strokeWidth={catAxis.gridWidth} strokeDasharray={catAxis.gridDash} opacity={catAxis.gridOpacity} />
        ) : (
          <line key={`cg${ci}`} x1={p} x2={p} y1={plot.y} y2={plot.y + plot.height} stroke={catAxis.gridColor} strokeWidth={catAxis.gridWidth} strokeDasharray={catAxis.gridDash} opacity={catAxis.gridOpacity} />
        ),
      );
    }
  }

  // data labels config
  const labelsShow = r.bool('labels', 'show', false);
  const labelFont = r.font('labels', 'color', r.structural.second, 9);
  const labelUnits = r.num('labels', 'labelDisplayUnits', 0);
  const labelPrecision = r.num('labels', 'labelPrecision', 0);
  const labelBg = r.bool('labels', 'enableBackground', false);
  const labelBgColor = withAlpha(r.color('labels', 'backgroundColor', '#FFFFFF'), r.num('labels', 'backgroundTransparency', 90));
  const labelPosition = r.str('labels', 'labelPosition', 'Auto');
  const fmtLabel = (v: number) => (stack === 'percent' ? `${Math.round(v)} %` : formatNumber(v * 1000, labelUnits, labelPrecision));
  const dataLabel = (x: number, y: number, text: string, key: string, anchor: 'start' | 'middle' | 'end' = 'middle') => {
    const w = text.length * labelFont.sizePx * 0.55 + 6;
    return (
      <g key={key}>
        {labelBg && <rect x={anchor === 'middle' ? x - w / 2 : anchor === 'start' ? x - 2 : x - w + 2} y={y - labelFont.sizePx} width={w} height={labelFont.sizePx + 4} fill={labelBgColor} rx={2} />}
        <text x={x} y={y} textAnchor={anchor} {...textProps(labelFont)}>{text}</text>
      </g>
    );
  };

  // dataPoint styling
  const fillTransparency = r.num('dataPoint', 'fillTransparency', 0);
  const borderShow = r.bool('dataPoint', 'borderShow', false);
  const borderColor = r.color('dataPoint', 'borderColor', '#FFFFFF');
  const borderSize = r.num('dataPoint', 'borderSize', 1);

  // ---- bars / columns ----
  const drawBars = variant === 'bar' || variant === 'column' || variant === 'ribbon' || variant === 'combo';
  if (drawBars) {
    const barSeries = variant === 'combo' && options.comboLine ? rawSeries.slice(0, Math.max(1, seriesCount - 1)) : rawSeries;
    const barStack = variant === 'ribbon' ? 'stacked' : stack;
    const perSeries = barStack === 'none' ? groupSize / barSeries.length : groupSize;
    const barColumns: { ci: number; si: number; v0: number; v1: number; color: string }[] = [];
    categories.forEach((_, ci) => {
      let acc = 0;
      const total = barSeries.reduce((s, ser) => s + (ser[ci] ?? 0), 0) || 1;
      barSeries.forEach((ser, si) => {
        const raw = ser[ci] ?? 0;
        const v = barStack === 'percent' ? (raw / total) * 100 : raw;
        const v0 = barStack === 'none' ? 0 : acc;
        const v1 = barStack === 'none' ? v : acc + v;
        if (barStack !== 'none') acc += v;
        barColumns.push({ ci, si, v0, v1, color: seriesColor(r, si, barSeries.length) });
      });
    });
    const gap = barStack === 'none' && barSeries.length > 1 ? 2 : 0;
    for (const b of barColumns) {
      const start = catPos(b.ci) - groupSize / 2 + (barStack === 'none' ? b.si * perSeries : 0) + gap / 2;
      const size = perSeries - gap;
      const p0 = valueScale(b.v0);
      const p1 = valueScale(b.v1);
      const fill = withAlpha(b.color, fillTransparency);
      const stroke = borderShow ? borderColor : 'none';
      if (horizontal) {
        nodes.push(<rect key={`b${b.ci}-${b.si}`} x={Math.min(p0, p1)} y={start} width={Math.abs(p1 - p0)} height={Math.max(0, size)} fill={fill} stroke={stroke} strokeWidth={borderShow ? borderSize : 0} />);
        if (labelsShow) {
          const inside = labelPosition.startsWith('Inside') || (barStack !== 'none' && labelPosition === 'Auto');
          const lx = inside ? (p0 + p1) / 2 : Math.max(p0, p1) + 4;
          nodes.push(dataLabel(lx, start + size / 2 + labelFont.sizePx * 0.35, fmtLabel(b.v1 - b.v0), `l${b.ci}-${b.si}`, inside ? 'middle' : 'start'));
        }
      } else {
        nodes.push(<rect key={`b${b.ci}-${b.si}`} x={start} y={Math.min(p0, p1)} width={Math.max(0, size)} height={Math.abs(p1 - p0)} fill={fill} stroke={stroke} strokeWidth={borderShow ? borderSize : 0} />);
        if (labelsShow) {
          const inside = labelPosition.startsWith('Inside') || (barStack !== 'none' && labelPosition === 'Auto');
          const ly = inside ? (p0 + p1) / 2 + labelFont.sizePx * 0.35 : Math.min(p0, p1) - 4;
          nodes.push(dataLabel(start + size / 2, ly, fmtLabel(b.v1 - b.v0), `l${b.ci}-${b.si}`));
        }
      }
    }
    // ribbon connectors
    if (variant === 'ribbon' && r.bool('ribbonBands', 'show', true)) {
      const ribbonTransparency = r.num('ribbonBands', 'fillTransparency', 70);
      const matchColor = r.bool('ribbonBands', 'fillMatchColor', true);
      const ribbonColor = r.color('ribbonBands', 'fillColor', r.structural.secondaryBackground);
      for (let ci = 0; ci < catCount - 1; ci++) {
        barSeries.forEach((_, si) => {
          const a = barColumns.find((b) => b.ci === ci && b.si === si)!;
          const b = barColumns.find((b) => b.ci === ci + 1 && b.si === si)!;
          const x0 = catPos(ci) + groupSize / 2;
          const x1 = catPos(ci + 1) - groupSize / 2;
          const d = `M${x0},${valueScale(a.v0)} C${(x0 + x1) / 2},${valueScale(a.v0)} ${(x0 + x1) / 2},${valueScale(b.v0)} ${x1},${valueScale(b.v0)} L${x1},${valueScale(b.v1)} C${(x0 + x1) / 2},${valueScale(b.v1)} ${(x0 + x1) / 2},${valueScale(a.v1)} ${x0},${valueScale(a.v1)} Z`;
          nodes.push(<path key={`rb${ci}-${si}`} d={d} fill={withAlpha(matchColor ? a.color : ribbonColor, ribbonTransparency)} />);
        });
      }
    }
    // stacked totals
    if (barStack === 'stacked' && r.bool('totals', 'show', false)) {
      const tf = r.font('totals', 'color', r.structural.first, 9);
      categories.forEach((_, ci) => {
        const total = stackedTotals[ci] ?? 0;
        const p = valueScale(total);
        nodes.push(
          horizontal ? (
            <text key={`t${ci}`} x={p + 4} y={catPos(ci) + tf.sizePx * 0.35} {...textProps(tf)}>{formatNumber(total * 1000, 0, 0)}</text>
          ) : (
            <text key={`t${ci}`} x={catPos(ci)} y={p - 4} textAnchor="middle" {...textProps(tf)}>{formatNumber(total * 1000, 0, 0)}</text>
          ),
        );
      });
    }
  }

  // ---- waterfall ----
  if (isWaterfall) {
    const inc = r.color('sentimentColors', 'increaseFill', r.structural.good);
    const dec = r.color('sentimentColors', 'decreaseFill', r.structural.bad);
    const tot = r.color('sentimentColors', 'totalFill', r.structural.second);
    let run = 0;
    const size = groupSize;
    WATERFALL.forEach((w, ci) => {
      const isTotal = ci === 0;
      const v0 = isTotal ? 0 : run;
      const v1 = isTotal ? w.value : run + w.value;
      run = v1;
      const x = catPos(ci) - size / 2;
      const y0 = valueScale(v0);
      const y1 = valueScale(v1);
      nodes.push(<rect key={`w${ci}`} x={x} y={Math.min(y0, y1)} width={size} height={Math.max(1, Math.abs(y1 - y0))} fill={isTotal ? tot : w.value >= 0 ? inc : dec} />);
      if (ci < WATERFALL.length - 1) nodes.push(<line key={`wc${ci}`} x1={x + size} x2={catPos(ci + 1) - size / 2} y1={y1} y2={y1} stroke={r.structural.fourth} strokeWidth={1} />);
      if (labelsShow) nodes.push(dataLabel(catPos(ci), Math.min(y0, y1) - 4, fmtLabel(Math.abs(w.value)), `wl${ci}`));
    });
  }

  // ---- lines / areas ----
  const lineSeriesIdx = isLine ? rawSeries.map((_, i) => i) : variant === 'combo' && options.comboLine ? [seriesCount - 1] : [];
  if (lineSeriesIdx.length > 0) {
    const strokeWidth = r.num('lineStyles', 'strokeWidth', 2);
    const lineType = r.str('lineStyles', 'lineChartType', 'linear');
    const lineDash = dashArray(r.str('lineStyles', 'lineStyle', 'solid'), strokeWidth);
    const showMarker = r.bool('lineStyles', 'showMarker', false);
    const markerShape = r.str('lineStyles', 'markerShape', 'circle');
    const markerSize = r.num('lineStyles', 'markerSize', MARKER_SIZE_DEFAULT);
    const markerColor = r.color('lineStyles', 'markerColor', '');
    const areaShow = variant === 'area' || r.bool('lineStyles', 'areaShow', false);
    const areaMatch = r.bool('lineStyles', 'areaMatchStrokeColor', true);
    const areaColor = r.color('lineStyles', 'areaColor', '');
    const strokeTransparency = r.num('lineStyles', 'strokeTransparency', 0);
    const comboScale = y2Axis && options.comboLine ? linear([0, domainMax], [plot.y + plot.height, plot.y]) : valueScale;
    const stackedAcc = categories.map(() => 0);
    lineSeriesIdx.forEach((si, order) => {
      const ser = rawSeries[si] ?? [];
      const color = seriesColor(r, si, isLine ? rawSeries.length : seriesCount);
      const scale = variant === 'combo' ? comboScale : valueScale;
      const pts: [number, number][] = [];
      const base: [number, number][] = [];
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
      if (areaShow) {
        const d = `${pathFromPoints(pts, lineType)} L${base[base.length - 1]![0]},${base[base.length - 1]![1]} ${[...base].reverse().slice(1).map(([x, y]) => `L${x},${y}`).join(' ')} Z`;
        nodes.push(<path key={`a${si}`} d={d} fill={withAlpha(areaMatch || !areaColor ? color : areaColor, variant === 'area' ? 40 : 60)} stroke="none" />);
      }
      nodes.push(<path key={`ln${si}`} d={pathFromPoints(pts, lineType)} fill="none" stroke={withAlpha(color, strokeTransparency)} strokeWidth={strokeWidth} strokeDasharray={lineDash} strokeLinejoin="round" strokeLinecap="round" />);
      if (showMarker) pts.forEach(([x, y], i) => nodes.push(marker(markerShape, x, y, markerSize * 1.6, markerColor || color, `m${si}-${i}`)));
      if (labelsShow && (order === lineSeriesIdx.length - 1 || r.bool('labels', 'showAll', false))) {
        pts.forEach(([x, y], ci) => nodes.push(dataLabel(x, y - 6, fmtLabel(ser[ci] ?? 0), `ll${si}-${ci}`)));
      }
    });
  }

  // ---- scatter ----
  if (isScatter) {
    const color = seriesColor(r, 0, 1);
    const fillOnly = r.str('fillPoint', 'style', 'Fill only') === 'Fill only';
    const bubbleSize = r.num('bubbles', 'bubbleSize', 0);
    const shape = r.str('bubbles', 'markerShape', 'circle');
    const xScale = linear([0, 100], [plot.x, plot.x + plot.width]);
    const catLabels = r.bool('categoryLabels', 'show', false);
    const catLabelFontS = r.font('categoryLabels', 'color', r.structural.second, 9);
    SCATTER.forEach(([x, y, s], i) => {
      const cx = xScale(x!);
      const cy = valueScale(y!);
      const size = Math.max(4, (s! * 0.9 + 4) * (1 + bubbleSize / 100));
      nodes.push(marker(shape, cx, cy, size, fillOnly ? withAlpha(color, fillTransparency) : 'none', `s${i}`, fillOnly ? (borderShow ? borderColor : undefined) : color, fillOnly ? borderSize : 1.5));
      if (catLabels) nodes.push(<text key={`sl${i}`} x={cx} y={cy - size / 2 - 3} textAnchor="middle" {...textProps(catLabelFontS)}>{CATEGORIES[i % CATEGORIES.length]}</text>);
    });
    if (r.bool('plotAreaShading', 'show', false)) {
      nodes.unshift(<rect key="shade" x={plot.x} y={plot.y} width={plot.width} height={plot.height} fill={withAlpha(r.color('plotAreaShading', 'upperShadingColor', color), r.num('plotAreaShading', 'transparency', 90))} />);
    }
    if (r.bool('ratioLine', 'show', false)) {
      nodes.push(<line key="ratio" x1={plot.x} y1={plot.y + plot.height} x2={plot.x + plot.width} y2={plot.y} stroke={r.color('ratioLine', 'lineColor', r.structural.first)} strokeWidth={r.num('ratioLine', 'width', 1)} strokeDasharray={dashArray(r.str('ratioLine', 'style', 'dashed'), 1)} />);
    }
  }

  // ---- trend line ----
  if (!isWaterfall && r.bool('trend', 'show', false)) {
    const lc = r.color('trend', 'lineColor', r.structural.first);
    const w = r.num('trend', 'width', 2);
    const d = dashArray(r.str('trend', 'style', 'dashed'), w);
    nodes.push(horizontal
      ? <line key="trend" x1={valueScale(domainMax * 0.35)} y1={plot.y} x2={valueScale(domainMax * 0.75)} y2={plot.y + plot.height} stroke={lc} strokeWidth={w} strokeDasharray={d} />
      : <line key="trend" x1={plot.x} y1={valueScale(domainMax * 0.35)} x2={plot.x + plot.width} y2={valueScale(domainMax * 0.75)} stroke={lc} strokeWidth={w} strokeDasharray={d} />);
  }

  // ---- reference line ----
  for (const card of ['y1AxisReferenceLine', 'referenceLine'] as const) {
    if (!r.bool(card, 'show', false)) continue;
    const value = Math.min(domainMax, Math.max(0, r.num(card, 'value', domainMax * 0.6) || domainMax * 0.6));
    const p = valueScale(value);
    const lc = r.color(card, 'lineColor', r.structural.first);
    const w = r.num(card, 'width', 2);
    const d = dashArray(r.str(card, 'style', 'solid'), w);
    nodes.push(horizontal
      ? <line key={card} x1={p} x2={p} y1={plot.y} y2={plot.y + plot.height} stroke={lc} strokeWidth={w} strokeDasharray={d} />
      : <line key={card} x1={plot.x} x2={plot.x + plot.width} y1={p} y2={p} stroke={lc} strokeWidth={w} strokeDasharray={d} />);
    if (r.bool(card, 'dataLabelShow', false)) {
      const lf = r.font(card, 'dataLabelColor', lc, 9);
      nodes.push(<text key={`${card}l`} x={horizontal ? p + 3 : plot.x + plot.width} y={horizontal ? plot.y + lf.sizePx : p - 3} textAnchor={horizontal ? 'start' : 'end'} {...textProps(lf)}>{r.str(card, 'displayName', 'Ziel')}</text>);
    }
    break;
  }

  // ---- axes ----
  const axisLine = (axis: AxisStyle, x1: number, y1: number, x2: number, y2: number, key: string) =>
    axis.show ? <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={axis.gridColor} strokeWidth={1} /> : null;
  if (horizontal) {
    if (catAxis.show) {
      categories.forEach((c, ci) => nodes.push(<text key={`cl${ci}`} x={plot.x - 6} y={catPos(ci) + catLabelFont.sizePx * 0.35} textAnchor="end" {...textProps(catLabelFont)}>{truncate(c, plot.x - afterLegend.x - 8, catLabelFont.sizePx)}</text>));
    }
    if (valAxis.show) {
      ticks.forEach((t, i) => nodes.push(<text key={`vl${i}`} x={valueScale(t)} y={plot.y + plot.height + valLabelFont.sizePx + 4} textAnchor="middle" {...textProps(valLabelFont)}>{tickLabels[i]}</text>));
    }
    if (catAxis.showTitle) nodes.push(<text key="ct" transform={`translate(${afterLegend.x + catAxis.titleFont.sizePx},${plot.y + plot.height / 2}) rotate(-90)`} textAnchor="middle" {...textProps(catAxis.titleFont)}>{catAxis.titleText}</text>);
    if (valAxis.showTitle) nodes.push(<text key="vt" x={plot.x + plot.width / 2} y={afterLegend.y + afterLegend.height - 2 - (zoomShow ? 0 : 0)} textAnchor="middle" {...textProps(valAxis.titleFont)}>{valAxis.titleText}</text>);
  } else {
    if (catAxis.show) {
      const maxW = bandSize - 4;
      categories.forEach((c, ci) => nodes.push(<text key={`cl${ci}`} x={catPos(ci)} y={plot.y + plot.height + catLabelFont.sizePx + 4} textAnchor="middle" {...textProps(catLabelFont)}>{truncate(c, maxW, catLabelFont.sizePx)}</text>));
    }
    if (valAxis.show) {
      ticks.forEach((t, i) => nodes.push(<text key={`vl${i}`} x={plot.x - 6} y={valueScale(t) + valLabelFont.sizePx * 0.35} textAnchor="end" {...textProps(valLabelFont)}>{tickLabels[i]}</text>));
    }
    if (y2Axis?.show) {
      ticks.forEach((t, i) => nodes.push(<text key={`y2l${i}`} x={plot.x + plot.width + 6} y={valueScale(t) + y2Axis.font.sizePx * 0.35} textAnchor="start" {...textProps(y2Axis.font)}>{tickLabels[i]}</text>));
      if (y2Axis.showTitle) nodes.push(<text key="y2t" transform={`translate(${right + y2Axis.titleFont.sizePx * 0.4 + maxLabelWidth(tickLabels, y2Axis.font) + 10},${plot.y + plot.height / 2}) rotate(90)`} textAnchor="middle" {...textProps(y2Axis.titleFont)}>{y2Axis.titleText}</text>);
    }
    if (valAxis.showTitle) nodes.push(<text key="vt" transform={`translate(${afterLegend.x + valAxis.titleFont.sizePx},${plot.y + plot.height / 2}) rotate(-90)`} textAnchor="middle" {...textProps(valAxis.titleFont)}>{valAxis.titleText}</text>);
    if (catAxis.showTitle) nodes.push(<text key="ct" x={plot.x + plot.width / 2} y={afterLegend.y + afterLegend.height - 2 - (zoomShow ? 10 : 0)} textAnchor="middle" {...textProps(catAxis.titleFont)}>{catAxis.titleText}</text>);
  }
  nodes.push(axisLine(valAxis, plot.x, horizontal ? plot.y + plot.height : plot.y, horizontal ? plot.x + plot.width : plot.x, plot.y + plot.height, 'axv'));
  if (!valAxis.gridShow) nodes.push(axisLine(catAxis, plot.x, horizontal ? plot.y : plot.y + plot.height, horizontal ? plot.x : plot.x + plot.width, plot.y + plot.height, 'axc'));

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
      {nodes}
    </g>
  );
}
