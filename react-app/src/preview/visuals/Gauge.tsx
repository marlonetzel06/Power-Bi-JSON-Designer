import { textProps } from '../resolver';
import { formatNumber } from '../sampleData';
import type { BodyProps } from '../types';

export function Gauge({ r, rect }: BodyProps) {
  const min = r.num('axis', 'min', 0);
  const max = Math.max(min + 1, r.num('axis', 'max', 100));
  const target = r.num('axis', 'target', 75);
  const value = min + (max - min) * 0.62;
  const fill = r.color('dataPoint', 'fill', '') || r.dataColor(0);
  const targetColor = r.color('dataPoint', 'target', r.structural.second);
  const callShow = r.bool('calloutValue', 'show', true);
  const callFont = r.font('calloutValue', 'color', r.structural.first, 24, { props: { size: false }, textClass: 'callout' });
  const tgtShow = r.bool('target', 'show', true);
  const tgtFont = r.font('target', 'color', r.structural.second, 9, { textClass: 'label' });
  const labShow = r.bool('labels', 'show', true);
  const labFont = r.font('labels', 'color', r.structural.second, 9, { textClass: 'label' });
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height * 0.78;
  const radius = Math.max(10, Math.min(rect.width / 2 - 24, rect.height * 0.7));
  const thickness = Math.max(8, radius * 0.28);
  const angle = (v: number) => Math.PI + ((v - min) / (max - min)) * Math.PI;
  const arc = (a0: number, a1: number, rad: number) => {
    const x0 = cx + Math.cos(a0) * rad;
    const y0 = cy + Math.sin(a0) * rad;
    const x1 = cx + Math.cos(a1) * rad;
    const y1 = cy + Math.sin(a1) * rad;
    return `M${x0},${y0} A${rad},${rad} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`;
  };
  const ta = angle(target);
  const calloutText = callShow ? formatNumber(value * 1000, r.num('calloutValue', 'labelDisplayUnits', 0), r.num('calloutValue', 'labelPrecision', 0)) : '';
  const callSize = Math.min(callFont.sizePx, radius * 0.5);
  return (
    <g>
      <path d={arc(Math.PI, Math.PI * 2, radius - thickness / 2)} stroke={r.structural.third} strokeWidth={thickness} fill="none" />
      <path d={arc(Math.PI, angle(value), radius - thickness / 2)} stroke={fill} strokeWidth={thickness} fill="none" />
      {tgtShow && (
        <g>
          <line x1={cx + Math.cos(ta) * (radius - thickness - 2)} y1={cy + Math.sin(ta) * (radius - thickness - 2)} x2={cx + Math.cos(ta) * (radius + 4)} y2={cy + Math.sin(ta) * (radius + 4)} stroke={targetColor} strokeWidth={2} />
          <text x={cx + Math.cos(ta) * (radius + 10)} y={cy + Math.sin(ta) * (radius + 10) + tgtFont.sizePx * 0.35} textAnchor={Math.cos(ta) >= 0 ? 'start' : 'end'} {...textProps(tgtFont)}>
            {formatNumber(target * 1000, r.num('target', 'labelDisplayUnits', 0), r.num('target', 'labelPrecision', 0))}
          </text>
        </g>
      )}
      {callShow && <text x={cx} y={cy - 6} textAnchor="middle" {...textProps(callFont)} fontSize={callSize}>{calloutText}</text>}
      {labShow && (
        <g>
          <text x={cx - radius} y={cy + labFont.sizePx + 4} textAnchor="middle" {...textProps(labFont)}>{formatNumber(min * 1000)}</text>
          <text x={cx + radius} y={cy + labFont.sizePx + 4} textAnchor="middle" {...textProps(labFont)}>{formatNumber(max * 1000)}</text>
        </g>
      )}
    </g>
  );
}
