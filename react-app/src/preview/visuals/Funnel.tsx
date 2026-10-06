import type { ReactNode } from 'react';
import { truncate } from '../fonts';
import { textProps, withAlpha } from '../resolver';
import { FUNNEL, clampPrecision, formatNumber } from '../sampleData';
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
  const precision = clampPrecision(r.num('labels', 'labelPrecision', 0));
  const pctPrecision = clampPrecision(r.num('labels', 'percentageLabelPrecision', 0));
  const labelPos = r.str('labels', 'labelPosition', 'InsideCenter');
  const labelBg = r.bool('labels', 'enableBackground', false);
  const labelBgColor = labelBg ? withAlpha(r.color('labels', 'backgroundColor', '#FFFFFF'), r.num('labels', 'backgroundTransparency', 90)) : 'none';
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
      const pctFirst = `${((f.value / max) * 100).toFixed(pctPrecision)} %`;
      const prev = i === 0 ? '100' : ((f.value / FUNNEL[i - 1]!.value) * 100).toFixed(pctPrecision);
      let text = formatNumber(f.value, units, precision);
      if (ls === 'percent of first') text = pctFirst;
      else if (ls === 'percent of previous') text = `${prev} %`;
      else if (ls.includes('first') && ls.startsWith('data')) text = `${text} (${pctFirst})`;
      else if (ls.includes('previous') && ls.startsWith('data')) text = `${text} (${prev} %)`;
      const lw = text.length * labFont.sizePx * 0.55 + 6;
      // "OutsideEnd" moves inside when the label would leave the visual (the widest bar), like Power BI
      const outside = labelPos === 'OutsideEnd' && x + w + 6 + lw <= rect.x + rect.width;
      const lx = outside ? x + w + 6 : rect.x + catW + barArea / 2;
      const ly = y + rowH / 2 + labFont.sizePx * 0.35;
      nodes.push(
        <g key={`l${i}`} data-part="data-label">
          {labelBg && <rect x={outside ? lx - 3 : lx - lw / 2} y={ly - labFont.sizePx} width={lw} height={labFont.sizePx + 4} rx={2} fill={labelBgColor} />}
          <text x={lx} y={ly} textAnchor={outside ? 'start' : 'middle'} {...textProps(labFont)} fill={outside && !r.has('labels', 'color') ? r.structural.second : labFont.color}>{text}</text>
        </g>,
      );
    }
  });
  return <g>{nodes}</g>;
}
