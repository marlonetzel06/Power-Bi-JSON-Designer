import type { ReactNode } from 'react';
import { fontSpec, ptToPx } from '../fonts';
import { textProps, withAlpha, type Resolver } from '../resolver';
import { NAV_PAGES } from '../sampleData';
import type { BodyProps, Rect } from '../types';

function shapePath(shape: string, rc: Rect, radius: number): ReactNode {
  const { x, y, width: w, height: h } = rc;
  const rx = Math.min(radius, w / 2, h / 2);
  switch (shape) {
    case 'oval':
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} />;
    case 'pill':
      return <rect x={x} y={y} width={w} height={h} rx={h / 2} />;
    case 'triangleIsoc':
      return <polygon points={`${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`} />;
    case 'triangleRight':
      return <polygon points={`${x},${y} ${x + w},${y + h} ${x},${y + h}`} />;
    case 'parallelogram':
      return <polygon points={`${x + w * 0.2},${y} ${x + w},${y} ${x + w * 0.8},${y + h} ${x},${y + h}`} />;
    case 'trapezoid':
      return <polygon points={`${x + w * 0.2},${y} ${x + w * 0.8},${y} ${x + w},${y + h} ${x},${y + h}`} />;
    case 'pentagon':
      return <polygon points={`${x + w / 2},${y} ${x + w},${y + h * 0.38} ${x + w * 0.82},${y + h} ${x + w * 0.18},${y + h} ${x},${y + h * 0.38}`} />;
    case 'hexagon':
      return <polygon points={`${x + w * 0.25},${y} ${x + w * 0.75},${y} ${x + w},${y + h / 2} ${x + w * 0.75},${y + h} ${x + w * 0.25},${y + h} ${x},${y + h / 2}`} />;
    case 'octagon':
      return <polygon points={`${x + w * 0.3},${y} ${x + w * 0.7},${y} ${x + w},${y + h * 0.3} ${x + w},${y + h * 0.7} ${x + w * 0.7},${y + h} ${x + w * 0.3},${y + h} ${x},${y + h * 0.7} ${x},${y + h * 0.3}`} />;
    case 'arrow':
      return <polygon points={`${x},${y + h * 0.3} ${x + w * 0.6},${y + h * 0.3} ${x + w * 0.6},${y} ${x + w},${y + h / 2} ${x + w * 0.6},${y + h} ${x + w * 0.6},${y + h * 0.7} ${x},${y + h * 0.7}`} />;
    case 'arrowChevron':
      return <polygon points={`${x},${y} ${x + w * 0.75},${y} ${x + w},${y + h / 2} ${x + w * 0.75},${y + h} ${x},${y + h} ${x + w * 0.25},${y + h / 2}`} />;
    case 'heart':
      return <path d={`M${x + w / 2},${y + h} C${x - w * 0.1},${y + h * 0.5} ${x + w * 0.1},${y - h * 0.05} ${x + w / 2},${y + h * 0.3} C${x + w * 0.9},${y - h * 0.05} ${x + w * 1.1},${y + h * 0.5} ${x + w / 2},${y + h} Z`} />;
    case 'line':
      return <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} />;
    case 'rectangle':
      return <rect x={x} y={y} width={w} height={h} />;
    default:
      return <rect x={x} y={y} width={w} height={h} rx={rx} />;
  }
}

/** Shared button-like renderer for actionButton, shape, bookmark & page navigators. */
function ButtonFace({ r, rc, label, uidKey, selected, defaultOutline, textDefaultColor }: { r: Resolver; rc: Rect; label: string; uidKey: string; selected?: boolean; defaultOutline: boolean; textDefaultColor: string }) {
  const fillShow = r.bool('fill', 'show', true);
  const fillColor = withAlpha(r.color('fill', 'fillColor', r.structural.background), r.num('fill', 'transparency', 0));
  const outlineShow = r.bool('outline', 'show', defaultOutline);
  const outlineColor = withAlpha(r.color('outline', 'lineColor', r.structural.second), r.num('outline', 'transparency', 0));
  const outlineW = r.num('outline', 'weight', 1);
  const shadowShow = r.bool('shadow', 'show', false);
  const glowShow = r.bool('glow', 'show', false);
  const shape = r.str('shape', 'tileShape', 'rectangle');
  const radius = r.num('shape', 'rectangleRoundedCurve', r.num('shape', 'roundEdge', 0));
  const textShow = r.bool('text', 'show', true);
  const font = r.font('text', 'fontColor', textDefaultColor, 12);
  const hAlign = r.str('text', 'horizontalAlignment', 'center');
  const vAlign = r.str('text', 'verticalAlignment', 'middle');
  // navigators have an accent bar card, the action button does not
  const accentShow = r.hasCard('accentBar') && r.bool('accentBar', 'show', false);
  const accentColor = accentShow ? r.color('accentBar', 'color', r.dataColor(0)) : 'none';
  const accentW = accentShow ? r.num('accentBar', 'width', 3) : 0;
  const accentPos = accentShow ? r.str('accentBar', 'position', 'Bottom') : 'Bottom';
  const filterId = `${uidKey}-fx`;
  const tx = hAlign === 'left' ? rc.x + 10 : hAlign === 'right' ? rc.x + rc.width - 10 : rc.x + rc.width / 2;
  const ty = vAlign === 'top' ? rc.y + font.sizePx + 6 : vAlign === 'bottom' ? rc.y + rc.height - 8 : rc.y + rc.height / 2 + font.sizePx * 0.35;
  return (
    <g>
      {(shadowShow || glowShow) && (
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            {shadowShow && <feDropShadow dx={2} dy={2} stdDeviation={r.num('shadow', 'shadowBlur', 4) / 2} floodColor={r.color('shadow', 'color', '#000000')} floodOpacity={1 - r.num('shadow', 'transparency', 60) / 100} />}
            {glowShow && <feDropShadow dx={0} dy={0} stdDeviation={r.num('glow', 'shadowBlur', 4)} floodColor={r.color('glow', 'color', r.dataColor(0))} floodOpacity={1 - r.num('glow', 'transparency', 60) / 100} />}
          </filter>
        </defs>
      )}
      <g fill={fillShow ? (selected ? r.structural.first : fillColor) : 'none'} stroke={outlineShow ? outlineColor : 'none'} strokeWidth={outlineShow ? outlineW : 0} filter={shadowShow || glowShow ? `url(#${filterId})` : undefined}>
        {shapePath(shape, rc, radius)}
      </g>
      {accentShow && (
        <rect
          x={accentPos === 'Right' ? rc.x + rc.width - accentW : rc.x}
          y={accentPos === 'Bottom' ? rc.y + rc.height - accentW : rc.y}
          width={accentPos === 'Top' || accentPos === 'Bottom' ? rc.width : accentW}
          height={accentPos === 'Top' || accentPos === 'Bottom' ? accentW : rc.height}
          fill={accentColor}
        />
      )}
      {textShow && <text x={tx} y={ty} textAnchor={hAlign === 'left' ? 'start' : hAlign === 'right' ? 'end' : 'middle'} {...textProps(font)} fill={selected ? r.structural.background : font.color}>{label}</text>}
    </g>
  );
}

export function ActionButton({ r, rect, uid }: BodyProps) {
  const h = Math.min(rect.height, 40);
  const w = Math.min(rect.width, 160);
  const rc = { x: rect.x + (rect.width - w) / 2, y: rect.y + (rect.height - h) / 2, width: w, height: h };
  const iconShow = r.bool('icon', 'show', false);
  const nodes: ReactNode[] = [<ButtonFace key="b" r={r} rc={rc} label={r.str('text', 'text', '') || 'Schaltfläche'} uidKey={uid} defaultOutline textDefaultColor={r.structural.second} />];
  if (iconShow) {
    const ic = r.color('icon', 'lineColor', r.structural.second);
    nodes.push(<path key="i" d={`M${rc.x + 14},${rc.y + h / 2} h12 m-5,-5 l5,5 l-5,5`} stroke={ic} strokeWidth={r.num('icon', 'lineWeight', 1.5)} fill="none" />);
  }
  return <g>{nodes}</g>;
}

export function Navigator({ r, rect, uid, bookmarks }: BodyProps & { bookmarks?: boolean }) {
  const orientation = String(r.raw('layout', 'orientation') ?? 0);
  const pad = r.num('layout', 'cellPadding', 6);
  const labels = bookmarks ? ['Umsatz', 'Kosten', 'Marge', 'Reset'] : NAV_PAGES;
  const vertical = orientation === '1';
  const n = labels.length;
  const cellW = vertical ? rect.width : (rect.width - pad * (n - 1)) / n;
  const cellH = vertical ? (rect.height - pad * (n - 1)) / n : Math.min(rect.height, 40);
  const top = vertical ? rect.y : rect.y + (rect.height - cellH) / 2;
  return (
    <g>
      {labels.map((label, i) => (
        <ButtonFace
          key={label}
          r={r}
          rc={{ x: vertical ? rect.x : rect.x + i * (cellW + pad), y: vertical ? top + i * (cellH + pad) : top, width: cellW, height: cellH }}
          label={label}
          uidKey={`${uid}-${i}`}
          selected={i === 0}
          defaultOutline={false}
          textDefaultColor={r.structural.second}
        />
      ))}
    </g>
  );
}

export function Shape({ r, rect, uid }: BodyProps) {
  const shape = r.str('shape', 'tileShape', 'rectangle');
  const radius = r.num('shape', 'rectangleRoundedCurve', r.num('shape', 'roundEdge', 0));
  const fillShow = r.bool('fill', 'show', true);
  const fillColor = withAlpha(r.color('fill', 'fillColor', r.dataColor(0)), r.num('fill', 'transparency', 0));
  const outlineShow = r.bool('outline', 'show', false);
  const outlineColor = withAlpha(r.color('outline', 'lineColor', r.structural.first), r.num('outline', 'transparency', 0));
  const outlineW = r.num('outline', 'weight', 1);
  const rotation = r.num('rotation', 'shapeAngle', r.num('rotation', 'angle', 0));
  const textShow = r.bool('text', 'show', false);
  const font = r.font('text', 'fontColor', r.structural.background, 12);
  const inset = 6;
  const rc = { x: rect.x + inset, y: rect.y + inset, width: rect.width - inset * 2, height: rect.height - inset * 2 };
  const shadowShow = r.bool('shadow', 'show', false);
  return (
    <g>
      {shadowShow && <defs><filter id={`${uid}-sh`}><feDropShadow dx={2} dy={2} stdDeviation={2} floodColor={r.color('shadow', 'color', '#000')} floodOpacity={0.4} /></filter></defs>}
      <g transform={`rotate(${rotation} ${rc.x + rc.width / 2} ${rc.y + rc.height / 2})`} fill={fillShow ? fillColor : 'none'} stroke={outlineShow || shape === 'line' ? outlineColor : 'none'} strokeWidth={outlineShow || shape === 'line' ? Math.max(outlineW, shape === 'line' ? 2 : 0) : 0} filter={shadowShow ? `url(#${uid}-sh)` : undefined}>
        {shapePath(shape, rc, radius)}
      </g>
      {textShow && <text x={rc.x + rc.width / 2} y={rc.y + rc.height / 2 + font.sizePx * 0.35} textAnchor="middle" {...textProps(font)}>{r.str('text', 'text', '') || 'Text'}</text>}
    </g>
  );
}

export function Textbox({ r, rect }: BodyProps) {
  const color = r.color('text', 'color', r.structural.first);
  const family = fontSpec(r.str('text', 'fontFamily', 'Segoe UI')).family;
  const size = ptToPx(r.num('text', 'fontSize', 14));
  const lines = ['Umsatzbericht Q3', 'Die Entwicklung der Regionen Nord und West liegt über Plan;', 'Ost bleibt hinter den Erwartungen zurück.'];
  return (
    <g>
      <text x={rect.x + 4} y={rect.y + size + 2} fontFamily={family} fontSize={size} fontWeight={600} fill={color}>{lines[0]}</text>
      {lines.slice(1).map((l, i) => (
        <text key={l} x={rect.x + 4} y={rect.y + size * 2.4 + i * size * 1.3 * 0.85} fontFamily={family} fontSize={size * 0.8} fill={color}>{l}</text>
      ))}
    </g>
  );
}

export function Image({ r, rect }: BodyProps) {
  const scaling = r.str('imageScaling', 'imageScalingType', 'Normal');
  const w = scaling === 'Fill' ? rect.width : Math.min(rect.width, rect.height * 1.5);
  const h = scaling === 'Fill' ? rect.height : Math.min(rect.height, w / 1.5);
  const x = rect.x + (rect.width - w) / 2;
  const y = rect.y + (rect.height - h) / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={r.structural.third} />
      <polygon points={`${x + w * 0.1},${y + h * 0.85} ${x + w * 0.4},${y + h * 0.4} ${x + w * 0.6},${y + h * 0.65} ${x + w * 0.72},${y + h * 0.5} ${x + w * 0.9},${y + h * 0.85}`} fill={r.structural.fourth} />
      <circle cx={x + w * 0.75} cy={y + h * 0.25} r={Math.min(w, h) * 0.08} fill={r.structural.fourth} />
    </g>
  );
}
