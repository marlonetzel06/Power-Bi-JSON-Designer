import type { ReactNode } from 'react';
import { truncate } from '../fonts';
import { textProps } from '../resolver';
import { FUNNEL, formatNumber } from '../sampleData';
import type { BodyProps } from '../types';

export function Funnel({ r, rect }: BodyProps) {
  const catShow = r.bool('categoryAxis', 'show', true);
  const catFont = r.font('categoryAxis', 'color', r.structural.second, 9, { textClass: 'label' });
  const labShow = r.bool('labels', 'show', true);
  const labFont = r.font('labels', 'color', '#FFFFFF', 9, { textClass: 'label' });
  const labelStyle = r.str('labels', 'funnelLabelStyle', 'Data');
  const pctShow = r.bool('percentBarLabel', 'show', true);
  const pctFont = r.font('percentBarLabel', 'color', r.structural.second, 9, { textClass: 'label' });
  const units = r.num('labels', 'labelDisplayUnits', 0);
  const precision = r.num('labels', 'labelPrecision', 0);
  const color = r.color('dataPoint', 'defaultColor', '') || r.dataColor(0);
  const catW = catShow ? Math.min(rect.width * 0.3, 70) : 0;
  const pctH = pctShow ? pctFont.sizePx + 6 : 0;
  const top = rect.y + pctH;
  const h = rect.height - pctH * 2;
  const rowH = h / FUNNEL.length;
  const max = FUNNEL[0]!.value;
  const barArea = rect.width - catW;
  const nodes: ReactNode[] = [];
  if (pctShow) {
    nodes.push(<text key="p0" x={rect.x + catW + barArea / 2} y={rect.y + pctFont.sizePx} textAnchor="middle" {...textProps(pctFont)}>100 %</text>);
    nodes.push(<text key="p1" x={rect.x + catW + barArea / 2} y={rect.y + rect.height - 2} textAnchor="middle" {...textProps(pctFont)}>{Math.round((FUNNEL[FUNNEL.length - 1]!.value / max) * 100)} %</text>);
  }
  FUNNEL.forEach((f, i) => {
    const w = (f.value / max) * barArea;
    const x = rect.x + catW + (barArea - w) / 2;
    const y = top + i * rowH;
    nodes.push(<rect key={`b${i}`} x={x} y={y + 1} width={w} height={Math.max(1, rowH - 2)} fill={color} />);
    if (catShow) nodes.push(<text key={`c${i}`} x={rect.x + catW - 6} y={y + rowH / 2 + catFont.sizePx * 0.35} textAnchor="end" {...textProps(catFont)}>{truncate(f.label, catW - 8, catFont.sizePx)}</text>);
    if (labShow && rowH > labFont.sizePx + 2) {
      const ls = labelStyle.toLowerCase();
      const pctFirst = `${Math.round((f.value / max) * 100)} %`;
      const prev = i === 0 ? 100 : Math.round((f.value / FUNNEL[i - 1]!.value) * 100);
      let text = formatNumber(f.value, units, precision);
      if (ls === 'percent of first') text = pctFirst;
      else if (ls === 'percent of previous') text = `${prev} %`;
      else if (ls.includes('first') && ls.startsWith('data')) text = `${text} (${pctFirst})`;
      else if (ls.includes('previous') && ls.startsWith('data')) text = `${text} (${prev} %)`;
      nodes.push(<text key={`l${i}`} x={rect.x + catW + barArea / 2} y={y + rowH / 2 + labFont.sizePx * 0.35} textAnchor="middle" {...textProps(labFont)}>{text}</text>);
    }
  });
  return <g>{nodes}</g>;
}
