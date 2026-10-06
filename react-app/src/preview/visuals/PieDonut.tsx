import type { ReactNode } from 'react';
import { layoutLegend } from '../cartesian/Legend';
import { textProps, withAlpha } from '../resolver';
import { DONUT, PIE_LABELS, formatNumber, clampPrecision } from '../sampleData';
import type { BodyProps } from '../types';

export function PieDonut({ r, rect, donut }: BodyProps & { donut: boolean }) {
  const total = DONUT.reduce((a, b) => a + b, 0);
  const items = DONUT.map((_, i) => ({ label: PIE_LABELS[i] ?? '', color: r.dataColor(i) }));
  const { plot, element } = layoutLegend(r, rect, items);
  const labelsShow = r.bool('labels', 'show', true);
  const labelFont = r.font('labels', 'color', r.structural.second, 9, { textClass: 'label' });
  const labelStyle = r.str('labels', 'labelStyle', 'Category');
  const position = r.str('labels', 'position', 'preferOutside');
  const units = r.num('labels', 'labelDisplayUnits', 0);
  const precision = r.num('labels', 'labelPrecision', 0);
  const pctPrecision = clampPrecision(r.num('labels', 'percentageLabelPrecision', 0));
  const labelBackground = String(r.raw('labels', 'background') ?? 'auto');
  const overflow = r.bool('labels', 'overflow', false);
  const innerRatio = donut ? Math.min(0.9, Math.max(0, r.num('slices', 'innerRadiusRatio', 60) / 100)) : 0;
  const startAngle = (r.num('slices', 'startAngle', 0) * Math.PI) / 180;
  const outside = labelsShow && position.toLowerCase().includes('outside');
  const cx = plot.x + plot.width / 2;
  const cy = plot.y + plot.height / 2;
  const radius = Math.max(8, Math.min(plot.width, plot.height) / 2 - (outside ? Math.max(40, labelFont.sizePx * 3.2) : 4));
  const inner = radius * innerRatio;
  const borderShow = r.bool('dataPoint', 'borderShow', false);
  const borderColor = r.color('dataPoint', 'borderColor', r.structural.background);
  const fillTransparency = r.num('dataPoint', 'fillTransparency', 0);

  const nodes: ReactNode[] = [];
  let angle = -Math.PI / 2 + startAngle;
  DONUT.forEach((v, i) => {
    const sweep = (v / total) * Math.PI * 2;
    const a0 = angle;
    const a1 = angle + sweep;
    angle = a1;
    const large = sweep > Math.PI ? 1 : 0;
    const p = (a: number, rad: number) => [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad] as const;
    const [x0, y0] = p(a0, radius);
    const [x1, y1] = p(a1, radius);
    let d: string;
    if (inner > 0) {
      const [ix0, iy0] = p(a0, inner);
      const [ix1, iy1] = p(a1, inner);
      d = `M${x0},${y0} A${radius},${radius} 0 ${large} 1 ${x1},${y1} L${ix1},${iy1} A${inner},${inner} 0 ${large} 0 ${ix0},${iy0} Z`;
    } else {
      d = `M${cx},${cy} L${x0},${y0} A${radius},${radius} 0 ${large} 1 ${x1},${y1} Z`;
    }
    nodes.push(<path key={`s${i}`} d={d} fill={withAlpha(r.dataColor(i), fillTransparency)} stroke={borderShow ? borderColor : r.structural.background} strokeWidth={borderShow ? r.num('dataPoint', 'borderSize', 1) : 1} />);
    if (labelsShow) {
      const mid = (a0 + a1) / 2;
      const pct = `${((v / total) * 100).toFixed(pctPrecision)} %`;
      const val = formatNumber(v * 1000, units, precision);
      const cat = PIE_LABELS[i] ?? '';
      let text = cat;
      const ls = labelStyle.toLowerCase();
      if (ls === 'data') text = val;
      else if (ls === 'percent of total') text = pct;
      else if (ls === 'both') text = `${cat} ${val}`;
      else if (ls.includes('category') && ls.includes('percent') && !ls.includes('data')) text = `${cat} ${pct}`;
      else if (ls.includes('data') && ls.includes('percent') && !ls.includes('category')) text = `${val} (${pct})`;
      else if (ls.includes('category') && ls.includes('data') && ls.includes('percent')) text = `${cat} ${val} (${pct})`;
      if (outside) {
        const [lx, ly] = p(mid, radius + 6);
        const [tx, ty] = p(mid, radius + 10);
        const right = Math.cos(mid) >= 0;
        nodes.push(<line key={`ll${i}`} x1={p(mid, radius)[0]} y1={p(mid, radius)[1]} x2={lx} y2={ly} stroke={r.structural.fourth} strokeWidth={1} />);
        nodes.push(<text key={`lt${i}`} x={tx} y={ty + labelFont.sizePx * 0.35} textAnchor={right ? 'start' : 'end'} {...textProps(labelFont)}>{text}</text>);
      } else {
        const [tx, ty] = p(mid, inner > 0 ? (radius + inner) / 2 : radius * 0.62);
        if (!overflow && sweep < 0.35 && i > 0) return; // small slices get no inside label unless overflow is allowed
        const w = text.length * labelFont.sizePx * 0.55 + 6;
        nodes.push(
          <g key={`lt${i}`} data-part="data-label">
            {labelBackground !== 'off' && labelBackground !== 'false' && <rect x={tx - w / 2} y={ty - labelFont.sizePx * 0.65} width={w} height={labelFont.sizePx + 4} rx={2} fill={withAlpha(r.structural.background, labelBackground === 'on' || labelBackground === 'true' ? 10 : 35)} />}
            <text x={tx} y={ty + labelFont.sizePx * 0.35} textAnchor="middle" {...textProps(labelFont)} fill={labelFont.color}>{text}</text>
          </g>,
        );
      }
    }
  });
  return (
    <g>
      {element}
      {nodes}
    </g>
  );
}
