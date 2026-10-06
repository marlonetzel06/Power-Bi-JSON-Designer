import type { ReactNode } from 'react';
import { truncate } from '../fonts';
import { textProps } from '../resolver';
import { DECOMP_LEVELS, formatNumber } from '../sampleData';
import type { BodyProps } from '../types';

export function DecompositionTree({ r, rect }: BodyProps) {
  const headerBg = r.color('levelHeader', 'levelHeaderBackgroundColor', '');
  const titleFont = r.font('levelHeader', 'levelTitleFontColor', r.structural.first, 12, { prefix: 'levelTitle', textClass: 'header' });
  const subFont = r.font('levelHeader', 'levelSubtitleFontColor', r.structural.second, 10, { prefix: 'levelSubtitle', textClass: 'label' });
  const showSub = r.bool('levelHeader', 'showSubtitles', true);
  const accent = r.color('tree', 'accentColor', r.dataColor(0));
  const connector = r.color('tree', 'connectorDefaultColor', r.structural.fourth);
  const connectorType = r.str('tree', 'connectorType', 'curve');
  const barColor = r.color('dataBars', 'dataBarColor', accent);
  const barBg = r.color('dataBars', 'dataBarBackgroundColor', r.structural.third);
  const catFont = r.font('categoryLabels', 'categoryLabelFontColor', r.structural.first, 10, { prefix: 'categoryLabel', textClass: 'label' });
  const dataFont = r.font('dataLabels', 'dataLabelFontColor', r.structural.first, 10, { prefix: 'dataLabel', textClass: 'label' });
  const levels = DECOMP_LEVELS;
  const colW = rect.width / levels.length;
  const headerH = titleFont.sizePx + (showSub ? subFont.sizePx + 4 : 0) + 10;
  const nodeH = Math.max(26, catFont.sizePx + dataFont.sizePx + 10);
  const nodes: ReactNode[] = [];
  const centers: number[][] = [];
  levels.forEach((lvl, li) => {
    const x = rect.x + li * colW;
    if (headerBg) nodes.push(<rect key={`hb${li}`} x={x} y={rect.y} width={colW - 8} height={headerH} fill={headerBg} />);
    nodes.push(<text key={`ht${li}`} x={x + 6} y={rect.y + titleFont.sizePx + 2} {...textProps(titleFont)}>{lvl.title}</text>);
    if (showSub) nodes.push(<text key={`hs${li}`} x={x + 6} y={rect.y + titleFont.sizePx + subFont.sizePx + 6} {...textProps(subFont)}>{li === 0 ? 'Gesamt' : 'Höchster Wert'}</text>);
    const available = rect.height - headerH - 6;
    const gap = 6;
    const count = Math.min(lvl.nodes.length, Math.max(1, Math.floor((available + gap) / (nodeH + gap))));
    const startY = rect.y + headerH + 4 + (li === 0 ? (available - nodeH) / 2 : 0);
    const cs: number[] = [];
    lvl.nodes.slice(0, count).forEach((n, ni) => {
      const y = startY + ni * (nodeH + gap);
      const w = colW - 16;
      nodes.push(<rect key={`n${li}-${ni}`} x={x + 4} y={y} width={w} height={nodeH} rx={3} fill={r.structural.background} stroke={ni === 0 && li > 0 ? accent : r.structural.third} strokeWidth={ni === 0 && li > 0 ? 1.5 : 1} />);
      nodes.push(<text key={`nl${li}-${ni}`} x={x + 10} y={y + catFont.sizePx + 3} {...textProps(catFont)}>{truncate(n.label, w - 12, catFont.sizePx)}</text>);
      nodes.push(<text key={`nv${li}-${ni}`} x={x + w - 2} y={y + catFont.sizePx + 3} textAnchor="end" {...textProps(dataFont)}>{formatNumber(n.value * 1_000_000, r.num('dataLabels', 'dataLabelDisplayUnits', 0), 2)}</text>);
      const barY = y + nodeH - 7;
      nodes.push(<rect key={`bb${li}-${ni}`} x={x + 10} y={barY} width={Math.max(0, w - 14)} height={3} fill={barBg} />);
      nodes.push(<rect key={`bf${li}-${ni}`} x={x + 10} y={barY} width={Math.max(0, (w - 14) * n.width)} height={3} fill={barColor} />);
      cs.push(y + nodeH / 2);
    });
    centers.push(cs);
  });
  // connectors
  for (let li = 1; li < levels.length; li++) {
    const x0 = rect.x + (li - 1) * colW + colW - 12;
    const x1 = rect.x + li * colW + 4;
    const y0 = centers[li - 1]![0]!;
    for (const y1 of centers[li]!) {
      const d = connectorType === 'round'
        ? `M${x0},${y0} H${(x0 + x1) / 2 - 4} Q${(x0 + x1) / 2},${y0} ${(x0 + x1) / 2},${y0 + Math.sign(y1 - y0) * 4} V${y1 - Math.sign(y1 - y0) * 4} Q${(x0 + x1) / 2},${y1} ${(x0 + x1) / 2 + 4},${y1} H${x1}`
        : `M${x0},${y0} C${(x0 + x1) / 2},${y0} ${(x0 + x1) / 2},${y1} ${x1},${y1}`;
      nodes.push(<path key={`c${li}-${y1}`} d={d} stroke={connector} strokeWidth={1.2} fill="none" />);
    }
  }
  return <g>{nodes}</g>;
}

export function KeyInfluencers({ r, rect }: BodyProps) {
  const canvas = r.color('keyInfluencersVisual', 'canvasColor', r.structural.background);
  const fontColor = r.color('keyInfluencersVisual', 'fontColor', r.structural.first);
  const primary = r.color('keyInfluencersVisual', 'primaryColor', r.dataColor(0));
  const primaryFont = r.color('keyInfluencersVisual', 'primaryFontColor', r.structural.background);
  const secondary = r.color('keyInfluencersVisual', 'secondaryColor', r.structural.third);
  const secondaryFont = r.color('keyInfluencersVisual', 'secondaryFontColor', r.structural.second);
  const drill = r.color('keyDriversDrillVisual', 'defaultColor', r.dataColor(1));
  const ref = r.color('keyDriversDrillVisual', 'referenceLineColor', r.structural.second);
  const leftW = rect.width * 0.46;
  const tab = (x: number, label: string, active: boolean, w: number) => (
    <g key={label}>
      <rect x={x} y={rect.y} width={w} height={22} rx={11} fill={active ? primary : secondary} />
      <text x={x + w / 2} y={rect.y + 15} textAnchor="middle" fontSize={11} fontFamily="'Segoe UI', sans-serif" fill={active ? primaryFont : secondaryFont}>{label}</text>
    </g>
  );
  const influencers = [0.9, 0.7, 0.55, 0.4];
  const rowH = Math.min(38, (rect.height - 40) / influencers.length);
  return (
    <g>
      <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={canvas} />
      {tab(rect.x, 'Wichtigste Einflussfaktoren', true, 150)}
      {tab(rect.x + 156, 'Top-Segmente', false, 100)}
      <text x={rect.x} y={rect.y + 44} fontSize={11} fontFamily="'Segoe UI', sans-serif" fill={fontColor}>Was beeinflusst Umsatz nach oben?</text>
      {influencers.map((v, i) => {
        const y = rect.y + 54 + i * rowH;
        return (
          <g key={i}>
            <circle cx={rect.x + 10 + v * 10} cy={y + rowH / 2} r={6 + v * 10} fill={i === 0 ? primary : secondary} />
            <text x={rect.x + 40} y={y + rowH / 2 + 4} fontSize={10} fontFamily="'Segoe UI', sans-serif" fill={fontColor}>{['Region ist Nord', 'Produkt ist Software', 'Kunde ist Bestand', 'Kanal ist Direkt'][i]}</text>
            <text x={rect.x + leftW - 8} y={y + rowH / 2 + 4} textAnchor="end" fontSize={10} fontFamily="'Segoe UI', sans-serif" fill={fontColor}>{(1 + v * 1.4).toFixed(2)}x</text>
          </g>
        );
      })}
      <line x1={rect.x + leftW} x2={rect.x + leftW} y1={rect.y + 36} y2={rect.y + rect.height} stroke={r.structural.third} />
      {[0.8, 0.55, 0.42, 0.3].map((v, i) => {
        const bx = rect.x + leftW + 16;
        const bw = rect.width - leftW - 32;
        const y = rect.y + 54 + i * rowH;
        return (
          <g key={`d${i}`}>
            <rect x={bx} y={y + 6} width={Math.max(0, bw * v)} height={Math.max(0, rowH - 14)} fill={i === 0 ? drill : secondary} />
          </g>
        );
      })}
      <line x1={rect.x + leftW + 16 + (rect.width - leftW - 32) * 0.5} x2={rect.x + leftW + 16 + (rect.width - leftW - 32) * 0.5} y1={rect.y + 50} y2={rect.y + rect.height - 4} stroke={ref} strokeDasharray="3,3" />
    </g>
  );
}

export function Scorecard({ r, rect }: BodyProps) {
  const bg = r.color('scorecard', 'backgroundColor', r.structural.background);
  const fg = r.color('scorecard', 'foregroundColor', r.structural.first);
  const tableBg = r.color('scorecard', 'tableBackgroundColor', bg);
  const headerShow = r.bool('header', 'show', true);
  const headerBg = r.color('header', 'backgroundColor', bg);
  const headerFg = r.color('header', 'foregroundColor', fg);
  const colShow = r.bool('columnHeaders', 'show', true);
  const colFg = r.color('columnHeaders', 'foregroundColor', r.structural.second);
  const goalsBg = r.color('goals', 'backgroundColor', tableBg);
  const goalsFg = r.color('goals', 'foregroundColor', fg);
  const font = r.str('scorecard', 'fontFamily', 'Segoe UI');
  const family = `'${font}', 'Segoe UI', sans-serif`;
  const headerH = headerShow ? 34 : 0;
  const colH = colShow ? 20 : 0;
  const rows = [
    { name: 'Umsatz Q3', status: 'Im Plan', color: r.structural.good, value: '4,74 Mio.', target: '4,67 Mio.' },
    { name: 'Neukunden', status: 'Gefährdet', color: r.structural.neutral, value: '128', target: '150' },
    { name: 'Churn-Rate', status: 'Hinter Plan', color: r.structural.bad, value: '6,2 %', target: '5,0 %' },
  ];
  const rowH = Math.max(0, Math.min(34, (rect.height - headerH - colH) / rows.length));
  const cols = [0, 0.42, 0.62, 0.82].map((f) => rect.x + f * rect.width);
  return (
    <g>
      <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={bg} />
      {headerShow && (
        <g>
          <rect x={rect.x} y={rect.y} width={rect.width} height={headerH} fill={headerBg} />
          <text x={rect.x + 8} y={rect.y + 22} fontSize={14} fontWeight={600} fontFamily={family} fill={headerFg}>Vertriebs-Scorecard</text>
        </g>
      )}
      <rect x={rect.x} y={rect.y + headerH} width={rect.width} height={Math.max(0, rect.height - headerH)} fill={tableBg} />
      {colShow && ['Ziel', 'Status', 'Aktuell', 'Vorgabe'].map((c, i) => (
        <text key={c} x={cols[i]! + 8} y={rect.y + headerH + 14} fontSize={10} fontFamily={family} fill={colFg}>{c}</text>
      ))}
      {rows.map((row, i) => {
        const y = rect.y + headerH + colH + i * rowH;
        return (
          <g key={row.name}>
            <rect x={rect.x} y={y} width={rect.width} height={rowH} fill={goalsBg} />
            <line x1={rect.x} x2={rect.x + rect.width} y1={y + rowH} y2={y + rowH} stroke={r.structural.third} />
            <text x={cols[0]! + 8} y={y + rowH / 2 + 4} fontSize={11} fontFamily={family} fill={goalsFg}>{row.name}</text>
            <circle cx={cols[1]! + 13} cy={y + rowH / 2} r={5} fill={row.color} />
            <text x={cols[1]! + 24} y={y + rowH / 2 + 4} fontSize={10} fontFamily={family} fill={goalsFg}>{row.status}</text>
            <text x={cols[2]! + 8} y={y + rowH / 2 + 4} fontSize={11} fontFamily={family} fill={goalsFg}>{row.value}</text>
            <text x={cols[3]! + 8} y={y + rowH / 2 + 4} fontSize={11} fontFamily={family} fill={colFg}>{row.target}</text>
          </g>
        );
      })}
    </g>
  );
}
