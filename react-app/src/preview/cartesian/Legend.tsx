import { estimateTextWidth, truncate } from '../fonts';
import { textProps, type Resolver } from '../resolver';
import { marker as markerShape } from '../shared/markers';
import type { Rect } from '../types';

export interface LegendItem {
  label: string;
  color: string;
  /**
   * Power BI draws round legend markers for every visual type (`circle`). Line charts can show the
   * series marker (`marker`), a line (`line`) or both (`lineMarker`) via legend.legendMarkerRendering.
   */
  marker?: 'square' | 'line' | 'circle' | 'marker' | 'lineMarker';
  /** Series marker shape for `marker` / `lineMarker`. */
  shape?: string;
  /** Dash array of the series line for `line` / `lineMarker`. */
  dash?: string;
  /** Line colour when it differs from the marker colour (legend.matchLineColor = false). */
  lineColor?: string;
}

export interface LegendLayout {
  /** Rect left for the plot after the legend took its space. */
  plot: Rect;
  element: React.ReactNode;
}

/** Lay out and render the legend from the `legend` card; returns the remaining plot rect. */
export function layoutLegend(r: Resolver, rect: Rect, items: LegendItem[], card = 'legend'): LegendLayout {
  const show = r.bool(card, 'show', true);
  if (!show || items.length === 0) return { plot: rect, element: null };
  const font = r.font(card, 'labelColor', r.structural.second, 8, { textClass: 'label' });
  const position = r.str(card, 'position', 'Top');
  const showTitle = r.bool(card, 'showTitle', false);
  const titleText = r.str(card, 'titleText', '') || 'Legende';
  const sw = Math.max(8, font.sizePx * 0.9);
  const gap = 6;
  const itemGap = 14;
  const lineH = Math.max(sw, font.sizePx) + 6;
  const pos = position.toLowerCase();
  const vertical = pos.startsWith('left') || pos.startsWith('right');

  // only line entries get the wide (line) marker; plain markers keep the compact width
  const markerW = (i: LegendItem) => (i.marker === 'line' || i.marker === 'lineMarker' ? sw * 2.2 : sw);
  const itemWidths = items.map((i) => markerW(i) + gap + estimateTextWidth(i.label, font.sizePx, font.weight >= 600));
  const titleW = showTitle ? estimateTextWidth(titleText, font.sizePx, true) + itemGap : 0;

  let plot: Rect;
  let lx = rect.x;
  let ly = rect.y;
  let legendW: number;
  let legendH: number;
  if (vertical) {
    legendW = Math.min(rect.width * 0.4, Math.max(...itemWidths, titleW) + 8);
    legendH = rect.height;
    if (pos.startsWith('left')) {
      plot = { x: rect.x + legendW + 8, y: rect.y, width: rect.width - legendW - 8, height: rect.height };
    } else {
      lx = rect.x + rect.width - legendW;
      plot = { x: rect.x, y: rect.y, width: rect.width - legendW - 8, height: rect.height };
    }
  } else {
    legendW = rect.width;
    legendH = lineH;
    if (pos.startsWith('bottom')) {
      ly = rect.y + rect.height - legendH;
      plot = { x: rect.x, y: rect.y, width: rect.width, height: rect.height - legendH - 4 };
    } else {
      plot = { x: rect.x, y: rect.y + legendH + 4, width: rect.width, height: rect.height - legendH - 4 };
    }
  }

  const nodes: React.ReactNode[] = [];
  if (vertical) {
    let y = ly + (pos.includes('center') ? Math.max(0, (legendH - items.length * lineH) / 2) : 0);
    if (showTitle) {
      nodes.push(<text key="t" x={lx} y={y + font.sizePx} {...textProps(font)} fontWeight={700}>{truncate(titleText, legendW, font.sizePx, true)}</text>);
      y += lineH;
    }
    items.forEach((item, i) => {
      if (y + lineH > ly + legendH) return;
      nodes.push(renderItem(item, lx, y, sw, markerW(item), font, legendW - markerW(item) - gap, `${i}`));
      y += lineH;
    });
  } else {
    const totalW = titleW + itemWidths.reduce((a, b) => a + b, 0) + itemGap * (items.length - 1);
    let x = lx;
    if (pos.includes('center')) x = lx + Math.max(0, (legendW - totalW) / 2);
    else if (pos.includes('right')) x = lx + Math.max(0, legendW - totalW);
    if (showTitle) {
      nodes.push(<text key="t" x={x} y={ly + font.sizePx + 2} {...textProps(font)} fontWeight={700}>{titleText}</text>);
      x += titleW;
    }
    items.forEach((item, i) => {
      const w = itemWidths[i] ?? 0;
      // an entry that does not fit is dropped, but keeps its slot: Power BI never reorders the legend
      if (x + w <= lx + legendW + 1) nodes.push(renderItem(item, x, ly, sw, markerW(item), font, w - markerW(item) - gap, `${i}`));
      x += w + itemGap;
    });
  }
  return { plot: clampRect(plot), element: <g data-part="legend">{nodes}</g> };
}

function renderItem(item: LegendItem, x: number, y: number, sw: number, markerW: number, font: ReturnType<Resolver['font']>, maxTextW: number, key: string) {
  const cy = y + Math.max(sw, font.sizePx) / 2 + 3;
  const kind = item.marker ?? 'circle';
  const line = kind === 'line' || kind === 'lineMarker' ? <line x1={x} x2={x + markerW} y1={cy} y2={cy} stroke={item.lineColor ?? item.color} strokeWidth={2} strokeDasharray={item.dash} strokeLinecap="round" /> : null;
  const mark =
    kind === 'square' ? <rect x={x} y={cy - sw / 2} width={sw} height={sw} fill={item.color} />
      : kind === 'marker' || kind === 'lineMarker' ? markerShape(item.shape ?? 'circle', x + markerW / 2, cy, sw * 0.9, { fill: item.color }, 'm')
        : kind === 'line' ? null
          // Power BI: round marker for bars, columns, lines, areas and pies alike.
          : <circle cx={x + sw / 2} cy={cy} r={sw / 2} fill={item.color} />;
  return (
    <g key={key} data-legend-marker={kind}>
      {line}
      {mark}
      <text x={x + markerW + 6} y={cy + font.sizePx * 0.35} {...textProps(font)}>{truncate(item.label, maxTextW, font.sizePx)}</text>
    </g>
  );
}

function clampRect(r: Rect): Rect {
  return { x: r.x, y: r.y, width: Math.max(0, r.width), height: Math.max(0, r.height) };
}
