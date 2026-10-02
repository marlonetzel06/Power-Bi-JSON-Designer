import type { ReactNode } from 'react';
import { layoutLegend } from '../cartesian/Legend';
import { truncate } from '../fonts';
import { textProps } from '../resolver';
import { TREEMAP, formatNumber } from '../sampleData';
import type { BodyProps, Rect } from '../types';

/** Slice-and-dice layout: simple, deterministic, good enough for a theme preview. */
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
  const catFont = r.font('categoryLabels', 'color', '#FFFFFF', 9);
  const labShow = r.bool('labels', 'show', false);
  const labFont = r.font('labels', 'color', '#FFFFFF', 9);
  const pad = r.num('layout', 'innerPadding', 0) / 4;
  const rects = layout(items, plot);
  const nodes: ReactNode[] = [];
  rects.forEach((rc, i) => {
    const item = items[i]!;
    nodes.push(<rect key={`t${i}`} x={rc.x + pad} y={rc.y + pad} width={Math.max(0, rc.width - pad * 2)} height={Math.max(0, rc.height - pad * 2)} fill={item.color} stroke={r.structural.background} strokeWidth={1} />);
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
