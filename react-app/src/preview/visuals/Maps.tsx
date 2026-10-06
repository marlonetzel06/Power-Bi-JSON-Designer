import type { ReactNode } from 'react';
import { layoutLegend } from '../cartesian/Legend';
import { withAlpha } from '../resolver';
import { MAP_BUBBLES, CATEGORIES } from '../sampleData';
import type { BodyProps, Rect } from '../types';

function landmass(rect: Rect, fill: string, stroke: string, strokeWidth: number): ReactNode {
  const { x, y, width: w, height: h } = rect;
  const p = (fx: number, fy: number) => `${x + fx * w},${y + fy * h}`;
  return (
    <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round">
      <path d={`M${p(0.08, 0.3)} C${p(0.12, 0.1)} ${p(0.3, 0.08)} ${p(0.42, 0.18)} C${p(0.5, 0.25)} ${p(0.47, 0.42)} ${p(0.4, 0.5)} C${p(0.33, 0.6)} ${p(0.28, 0.8)} ${p(0.2, 0.86)} C${p(0.12, 0.9)} ${p(0.06, 0.7)} ${p(0.08, 0.3)} Z`} />
      <path d={`M${p(0.52, 0.22)} C${p(0.6, 0.1)} ${p(0.82, 0.12)} ${p(0.92, 0.3)} C${p(0.98, 0.45)} ${p(0.88, 0.62)} ${p(0.76, 0.66)} C${p(0.66, 0.7)} ${p(0.6, 0.56)} ${p(0.55, 0.45)} C${p(0.5, 0.36)} ${p(0.48, 0.3)} ${p(0.52, 0.22)} Z`} />
      <path d={`M${p(0.62, 0.72)} C${p(0.7, 0.68)} ${p(0.84, 0.72)} ${p(0.86, 0.84)} C${p(0.86, 0.92)} ${p(0.7, 0.95)} ${p(0.62, 0.9)} C${p(0.56, 0.86)} ${p(0.56, 0.76)} ${p(0.62, 0.72)} Z`} />
    </g>
  );
}

export type MapKind = 'map' | 'filledMap' | 'shapeMap' | 'azureMap';

export function MapVisual({ r, rect, kind }: BodyProps & { kind: MapKind }) {
  const items = CATEGORIES.slice(0, 3).map((c, i) => ({ label: c, color: r.dataColor(i), marker: 'circle' as const }));
  const { plot, element } = layoutLegend(r, rect, items);
  // map/filledMap: mapStyles.mapTheme; azureMap: mapControls.defaultStyle; shapeMap: no style card
  const theme = kind === 'azureMap' ? r.str('mapControls', 'defaultStyle', 'road') : kind === 'shapeMap' ? 'road' : r.str('mapStyles', 'mapTheme', 'road');
  const dark = theme.includes('Dark') || theme === 'night' || theme === 'canvasDark' || theme === 'aerial' || theme === 'satellite';
  const water = dark ? '#1F2A36' : '#D6E6F2';
  const land = dark ? '#3A4654' : '#F2F0EB';
  const nodes: ReactNode[] = [];
  nodes.push(<rect key="water" x={plot.x} y={plot.y} width={plot.width} height={plot.height} fill={water} />);
  if (kind === 'filledMap' || kind === 'shapeMap') {
    const strokeShow = kind === 'filledMap' ? r.bool('stroke', 'show', true) : true;
    const strokeColor = kind === 'filledMap' ? r.color('stroke', 'strokeColor', r.structural.background) : r.color('defaultColors', 'borderColor', r.structural.background);
    const strokeW = kind === 'filledMap' ? r.num('stroke', 'strokeWidth', 1) : r.num('defaultColors', 'borderThickness', 1);
    const base = kind === 'shapeMap' ? r.color('defaultColors', 'defaultColor', r.structural.secondaryBackground) : r.color('dataPoint', 'defaultColor', r.dataColor(0));
    const t = kind === 'filledMap' ? r.num('dataPoint', 'transparency', 0) : 0;
    nodes.push(<g key="land" opacity={1 - t / 100}>{landmass(plot, base, strokeShow ? strokeColor : 'none', strokeW)}</g>);
    // shade regions with the palette (choropleth)
    const { x, y, width: w, height: h } = plot;
    nodes.push(<path key="r1" d={`M${x + 0.52 * w},${y + 0.22 * h} C${x + 0.6 * w},${y + 0.1 * h} ${x + 0.82 * w},${y + 0.12 * h} ${x + 0.92 * w},${y + 0.3 * h} C${x + 0.98 * w},${y + 0.45 * h} ${x + 0.88 * w},${y + 0.62 * h} ${x + 0.76 * w},${y + 0.66 * h} C${x + 0.66 * w},${y + 0.7 * h} ${x + 0.6 * w},${y + 0.56 * h} ${x + 0.55 * w},${y + 0.45 * h} C${x + 0.5 * w},${y + 0.36 * h} ${x + 0.48 * w},${y + 0.3 * h} ${x + 0.52 * w},${y + 0.22 * h} Z`} fill={withAlpha(kind === 'shapeMap' ? r.dataColor(1) : r.dataColor(1), t)} stroke={strokeShow ? strokeColor : 'none'} strokeWidth={strokeW} />);
    nodes.push(<path key="r2" d={`M${x + 0.62 * w},${y + 0.72 * h} C${x + 0.7 * w},${y + 0.68 * h} ${x + 0.84 * w},${y + 0.72 * h} ${x + 0.86 * w},${y + 0.84 * h} C${x + 0.86 * w},${y + 0.92 * h} ${x + 0.7 * w},${y + 0.95 * h} ${x + 0.62 * w},${y + 0.9 * h} C${x + 0.56 * w},${y + 0.86 * h} ${x + 0.56 * w},${y + 0.76 * h} ${x + 0.62 * w},${y + 0.72 * h} Z`} fill={withAlpha(r.dataColor(2), t)} stroke={strokeShow ? strokeColor : 'none'} strokeWidth={strokeW} />);
  } else {
    nodes.push(<g key="land">{landmass(plot, land, dark ? '#55657A' : '#C9C6BD', 1)}</g>);
    const bubbleCard = kind === 'azureMap' ? 'bubbleLayer' : 'bubbles';
    const sizeFactor = kind === 'azureMap' ? r.num('bubbleLayer', 'bubbleRadius', 10) / 10 : 1 + r.num('bubbles', 'bubbleSize', 0) / 100;
    const strokeColor = kind === 'azureMap' ? r.color('bubbleLayer', 'strokeColor', r.structural.background) : r.structural.background;
    const strokeW = kind === 'azureMap' ? r.num('bubbleLayer', 'bubbleStrokeWidth', 1) : 1;
    const t = kind === 'azureMap' ? 100 - Math.round((1 - r.num('bubbleLayer', 'strokeTransparency', 0) / 100) * 80) : r.num('dataPoint', 'transparency', 0);
    const base = Math.min(plot.width, plot.height) * 0.09 * sizeFactor;
    MAP_BUBBLES.forEach((b, i) => {
      nodes.push(<circle key={`b${i}`} cx={plot.x + b.x * plot.width} cy={plot.y + b.y * plot.height} r={Math.max(3, base * b.r)} fill={withAlpha(r.dataColor(i % 3), t)} stroke={strokeColor} strokeWidth={strokeW} />);
    });
    void bubbleCard;
    if (r.bool('categoryLabels', 'show', false)) {
      const f = r.font('categoryLabels', 'color', r.structural.first, 9, { textClass: 'label' });
      MAP_BUBBLES.slice(0, 3).forEach((b, i) => nodes.push(<text key={`l${i}`} x={plot.x + b.x * plot.width} y={plot.y + b.y * plot.height - base * b.r - 3} textAnchor="middle" fontFamily={f.family} fontSize={f.sizePx} fill={f.color}>{CATEGORIES[i]}</text>));
    }
  }
  const zoomButtons = kind === 'azureMap' ? r.bool('mapControls', 'showNavigationControls', true) : kind === 'shapeMap' ? false : r.bool('mapControls', 'showZoomButtons', true);
  if (zoomButtons) {
    const bx = plot.x + plot.width - 22;
    const by = plot.y + 8;
    nodes.push(<g key="zoom"><rect x={bx} y={by} width={16} height={32} rx={3} fill={r.structural.background} stroke={r.structural.fourth} /><path d={`M${bx + 4},${by + 8} h8 M${bx + 8},${by + 4} v8 M${bx + 4},${by + 24} h8`} stroke={r.structural.second} strokeWidth={1.4} /></g>);
  }
  return (
    <g>
      {element}
      {nodes}
    </g>
  );
}
