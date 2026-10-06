import type { ReactNode } from 'react';
import { layoutLegend } from '../cartesian/Legend';
import { truncate } from '../fonts';
import { textProps } from '../resolver';
import { TREEMAP, formatNumber } from '../sampleData';
import type { BodyProps, Rect } from '../types';

/** Squarified layout (Power BI default "stableSquarified"): rows of tiles with aspect ratios close to 1. */
function squarify(items: { value: number }[], rect: Rect): Rect[] {
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  const area = rect.width * rect.height;
  const scaled = items.map((i) => (i.value / total) * area);
  const out: Rect[] = new Array<Rect>(items.length);
  let remaining: Rect = { ...rect };
  let start = 0;
  const worst = (row: number[], side: number) => {
    const sum = row.reduce((a, b) => a + b, 0);
    const max = Math.max(...row);
    const min = Math.min(...row);
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
  };
  const place = (row: number[], from: number) => {
    const sum = row.reduce((a, b) => a + b, 0);
    const horizontalStrip = remaining.width >= remaining.height;
    const side = horizontalStrip ? remaining.height : remaining.width;
    const thickness = sum / Math.max(1, side);
    let offset = 0;
    row.forEach((a, i) => {
      const len = a / Math.max(1e-9, thickness);
      out[from + i] = horizontalStrip
        ? { x: remaining.x, y: remaining.y + offset, width: thickness, height: len }
        : { x: remaining.x + offset, y: remaining.y, width: len, height: thickness };
      offset += len;
    });
    remaining = horizontalStrip
      ? { x: remaining.x + thickness, y: remaining.y, width: Math.max(0, remaining.width - thickness), height: remaining.height }
      : { x: remaining.x, y: remaining.y + thickness, width: remaining.width, height: Math.max(0, remaining.height - thickness) };
  };
  let row: number[] = [];
  for (let i = 0; i < scaled.length; i++) {
    const side = Math.min(remaining.width, remaining.height) || 1;
    const candidate = [...row, scaled[i]!];
    if (row.length === 0 || worst(candidate, side) <= worst(row, side)) row = candidate;
    else {
      place(row, start);
      start = i;
      row = [scaled[i]!];
    }
  }
  if (row.length) place(row, start);
  return out;
}

/** Slice-and-dice layout (Power BI "alternating"/"binary" approximations). */
function layout(items: { value: number }[], rect: Rect): Rect[] {
  const total = items.reduce((a, b) => a + b.value, 0);
  const out: Rect[] = [];
  let remaining = { ...rect };
  let remainingTotal = total;
  items.forEach((item, i) => {
    if (i === items.length - 1) {
      out.push(remaining);
      return;
    }
    const frac = item.value / remainingTotal;
    if (remaining.width >= remaining.height) {
      const w = remaining.width * frac;
      out.push({ x: remaining.x, y: remaining.y, width: w, height: remaining.height });
      remaining = { x: remaining.x + w, y: remaining.y, width: remaining.width - w, height: remaining.height };
    } else {
      const h = remaining.height * frac;
      out.push({ x: remaining.x, y: remaining.y, width: remaining.width, height: h });
      remaining = { x: remaining.x, y: remaining.y + h, width: remaining.width, height: remaining.height - h };
    }
    remainingTotal -= item.value;
  });
  return out;
}

export function Treemap({ r, rect }: BodyProps) {
  const items = TREEMAP.map((t, i) => ({ ...t, color: r.dataColor(i) }));
  const { plot, element } = layoutLegend(r, rect, items.map((i) => ({ label: i.label, color: i.color })));
  const catShow = r.bool('categoryLabels', 'show', true);
  const catFont = r.font('categoryLabels', 'color', '#FFFFFF', 9, { textClass: 'label' });
  const labShow = r.bool('labels', 'show', false);
  const labFont = r.font('labels', 'color', '#FFFFFF', 9, { textClass: 'label' });
  const pad = r.num('layout', 'innerPadding', 0) / 4;
  const outerPad = r.num('layout', 'outerPadding', 0) / 4;
  const method = r.str('layout', 'tilingMethod', 'stableSquarified');
  const fillOverride = r.color('dataPoint', 'fill', '');
  const inner: Rect = { x: plot.x + outerPad, y: plot.y + outerPad, width: Math.max(1, plot.width - outerPad * 2), height: Math.max(1, plot.height - outerPad * 2) };
  const rects = method === 'stableSquarified' ? squarify(items, inner) : layout(items, inner);
  const nodes: ReactNode[] = [];
  rects.forEach((rc, i) => {
    const item = items[i]!;
    nodes.push(<rect key={`t${i}`} data-part="treemap-tile" x={rc.x + pad} y={rc.y + pad} width={Math.max(0, rc.width - pad * 2)} height={Math.max(0, rc.height - pad * 2)} fill={fillOverride || item.color} stroke={r.structural.background} strokeWidth={1} />);
    let ty = rc.y + 6 + catFont.sizePx;
    if (catShow && rc.width > 20 && rc.height > catFont.sizePx + 8) {
      nodes.push(<text key={`c${i}`} x={rc.x + 6} y={ty} {...textProps(catFont)}>{truncate(item.label, rc.width - 10, catFont.sizePx)}</text>);
      ty += labFont.sizePx + 2;
    }
    if (labShow && rc.width > 20 && ty < rc.y + rc.height - 2) {
      nodes.push(<text key={`v${i}`} x={rc.x + 6} y={ty} {...textProps(labFont)}>{formatNumber(item.value * 1000, r.num('labels', 'labelDisplayUnits', 0), r.num('labels', 'labelPrecision', 0))}</text>);
    }
  });
  return (
    <g>
      {element}
      {nodes}
    </g>
  );
}
