import type { ReactNode } from 'react';
import { fontSpec, ptToPx, truncate } from '../fonts';
import { textProps, withAlpha, type Resolver } from '../resolver';
import { NAV_PAGES } from '../sampleData';
import { effectsFilter, shadowOffset, type ShadowSpec } from '../shared/effects';
import { getCardEntry } from '@/pbi/resolve';
import { iconGlyph, tilePath } from '../shared/shapes';
import type { BodyProps, Rect } from '../types';

/** Shared button-like renderer for actionButton, shape, bookmark & page navigators. */
function ButtonFace({ r, rc, label, uidKey, selected, defaultOutline, textDefaultColor, showIcon }: { r: Resolver; rc: Rect; label: string; uidKey: string; selected?: boolean; defaultOutline: boolean; textDefaultColor: string; showIcon?: boolean }) {
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
  const font = r.font('text', 'fontColor', textDefaultColor, 12, { textClass: 'label' });
  const hAlign = r.str('text', 'horizontalAlignment', 'center');
  const vAlign = r.str('text', 'verticalAlignment', 'middle');
  const margin = { top: r.num('text', 'topMargin', 0), bottom: r.num('text', 'bottomMargin', 0), left: r.num('text', 'leftMargin', 0), right: r.num('text', 'rightMargin', 0) };
  const rotation = r.hasCard('rotation') ? r.num('rotation', 'angle', 0) : 0;
  const shapeAngle = r.hasCard('rotation') ? r.num('rotation', 'shapeAngle', 0) : 0;
  const textAngle = r.hasCard('rotation') ? r.num('rotation', 'textAngle', 0) : 0;
  // navigators have an accent bar card, the action button does not
  const accentShow = r.hasCard('accentBar') && r.bool('accentBar', 'show', false);
  const accentColor = accentShow ? withAlpha(r.color('accentBar', 'color', r.dataColor(0)), r.num('accentBar', 'transparency', 0)) : 'none';
  const accentW = accentShow ? r.num('accentBar', 'width', 3) : 0;
  const accentPos = accentShow ? r.str('accentBar', 'position', 'Bottom') : 'Bottom';
  // icon (action button only)
  const iconOn = Boolean(showIcon) && r.hasCard('icon') && r.bool('icon', 'show', false);
  const iconType = iconOn ? r.str('icon', 'shapeType', 'blank') : 'blank';
  const iconSize = iconOn ? r.num('icon', 'iconSize', 20) : 0;
  const iconPlacement = iconOn ? r.str('icon', 'placement', 'left') : 'left';
  const iconColor = iconOn ? withAlpha(r.color('icon', 'lineColor', font.color), r.num('icon', 'lineTransparency', 0)) : '';
  const iconWeight = iconOn ? r.num('icon', 'lineWeight', 1) : 1;
  const iconMargin = iconOn ? { top: r.num('icon', 'topMargin', 0), bottom: r.num('icon', 'bottomMargin', 0), left: r.num('icon', 'leftMargin', 0), right: r.num('icon', 'rightMargin', 0) } : { top: 0, bottom: 0, left: 0, right: 0 };
  const iconH = iconOn ? r.str('icon', 'horizontalAlignment', 'center') : 'center';
  const iconV = iconOn ? r.str('icon', 'verticalAlignment', 'middle') : 'middle';
  const hasIconGlyph = iconOn && iconType !== 'blank';

  const filterId = `${uidKey}-fx`;
  const effects = buttonEffects(r, shadowShow, glowShow);
  const cx = rc.x + rc.width / 2;
  const cy = rc.y + rc.height / 2;

  // text area after margins and the icon
  const text: Rect = { x: rc.x + 8 + margin.left, y: rc.y + margin.top, width: Math.max(0, rc.width - 16 - margin.left - margin.right), height: Math.max(0, rc.height - margin.top - margin.bottom) };
  const iconArea: Rect = { x: rc.x + iconMargin.left, y: rc.y + iconMargin.top, width: Math.max(0, rc.width - iconMargin.left - iconMargin.right), height: Math.max(0, rc.height - iconMargin.top - iconMargin.bottom) };
  let iconCx = iconArea.x + iconArea.width / 2;
  let iconCy = iconArea.y + iconArea.height / 2;
  if (hasIconGlyph) {
    if (iconPlacement === 'left') {
      iconCx = iconArea.x + 8 + iconSize / 2;
      text.x += iconSize + 8;
      text.width = Math.max(0, text.width - iconSize - 8);
    } else if (iconPlacement === 'right') {
      iconCx = iconArea.x + iconArea.width - 8 - iconSize / 2;
      text.width = Math.max(0, text.width - iconSize - 8);
    } else if (iconPlacement === 'above') {
      iconCy = iconArea.y + 6 + iconSize / 2;
      text.y += iconSize + 6;
      text.height = Math.max(0, text.height - iconSize - 6);
    } else if (iconPlacement === 'below') {
      iconCy = iconArea.y + iconArea.height - 6 - iconSize / 2;
      text.height = Math.max(0, text.height - iconSize - 6);
    } else {
      iconCx = iconH === 'left' ? iconArea.x + iconSize / 2 : iconH === 'right' ? iconArea.x + iconArea.width - iconSize / 2 : iconCx;
      iconCy = iconV === 'top' ? iconArea.y + iconSize / 2 : iconV === 'bottom' ? iconArea.y + iconArea.height - iconSize / 2 : iconCy;
    }
  }
  const tx = hAlign === 'left' ? text.x : hAlign === 'right' ? text.x + text.width : text.x + text.width / 2;
  const ty = vAlign === 'top' ? text.y + font.sizePx + 4 : vAlign === 'bottom' ? text.y + text.height - 6 : text.y + text.height / 2 + font.sizePx * 0.35;
  return (
    <g transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined}>
      {effects.length > 0 && <defs>{effectsFilter(filterId, effects)}</defs>}
      <g data-part="button-face" transform={shapeAngle ? `rotate(${shapeAngle} ${cx} ${cy})` : undefined} fill={fillShow ? (selected ? r.structural.first : fillColor) : 'none'} stroke={outlineShow ? outlineColor : 'none'} strokeWidth={outlineShow ? outlineW : 0} filter={effects.length > 0 ? `url(#${filterId})` : undefined}>
        {tilePath(shape, rc, { radius })}
      </g>
      {accentShow && (
        <rect
          data-part="accent-bar"
          x={accentPos === 'Right' ? rc.x + rc.width - accentW : rc.x}
          y={accentPos === 'Bottom' ? rc.y + rc.height - accentW : rc.y}
          width={accentPos === 'Top' || accentPos === 'Bottom' ? rc.width : accentW}
          height={accentPos === 'Top' || accentPos === 'Bottom' ? accentW : rc.height}
          fill={accentColor}
        />
      )}
      {hasIconGlyph && <g data-part="button-icon">{iconGlyph(iconType, iconCx, iconCy, iconSize, selected ? r.structural.background : iconColor, iconWeight)}</g>}
      {textShow && (
        <text data-part="button-text" x={tx} y={ty} textAnchor={hAlign === 'left' ? 'start' : hAlign === 'right' ? 'end' : 'middle'} transform={textAngle ? `rotate(${textAngle} ${tx} ${ty})` : undefined} {...textProps(font)} fill={selected ? r.structural.background : font.color}>
          {truncate(label, Math.max(10, text.width), font.sizePx, font.weight >= 600)}
        </text>
      )}
    </g>
  );
}

/** shadow + glow cards of buttons/shapes as filter specs (both may be on at once). */
function buttonEffects(r: Resolver, shadowShow: boolean, glowShow: boolean): ShadowSpec[] {
  const specs: ShadowSpec[] = [];
  if (shadowShow) {
    const [dx, dy] = shadowOffset(r.str('shadow', 'shadowPositionPreset', 'bottomRight'), r.num('shadow', 'shadowDistance', 2), r.num('shadow', 'angle', 45));
    specs.push({ dx, dy, blur: r.num('shadow', 'shadowBlur', 4), spread: 0, color: r.color('shadow', 'color', '#000000'), opacity: 1 - r.num('shadow', 'transparency', 60) / 100 });
  }
  if (glowShow) specs.push({ dx: 0, dy: 0, blur: r.num('glow', 'shadowBlur', 4) * 2, spread: 1, color: r.color('glow', 'color', r.dataColor(0)), opacity: 1 - r.num('glow', 'transparency', 60) / 100 });
  return specs;
}

export function ActionButton({ r, rect, uid }: BodyProps) {
  const h = Math.min(rect.height, 40);
  const w = Math.min(rect.width, 160);
  const rc = { x: rect.x + (rect.width - w) / 2, y: rect.y + (rect.height - h) / 2, width: w, height: h };
  return <ButtonFace r={r} rc={rc} label={r.str('text', 'text', '') || 'Schaltfläche'} uidKey={uid} defaultOutline textDefaultColor={r.structural.second} showIcon />;
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
  // The current page/bookmark is the `selected` state. With an explicit state every tile shows it;
  // otherwise tile 0 renders in `selected`, falling back to fixed highlight colours only when the
  // theme has no fill colour for that state.
  const selectedR = r.stateId ? r : r.withState('selected');
  const stateHasFill = getCardEntry(r.theme, r.visualKey, 'fill', undefined, 'selected')?.fillColor !== undefined;
  return (
    <g>
      {labels.map((label, i) => (
        <ButtonFace
          key={label}
          r={i === 0 ? selectedR : r}
          rc={{ x: vertical ? rect.x : rect.x + i * (cellW + pad), y: vertical ? top + i * (cellH + pad) : top, width: Math.max(0, cellW), height: Math.max(0, cellH) }}
          label={label}
          uidKey={`${uid}-${i}`}
          selected={i === 0 && !r.stateId && !stateHasFill}
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
  const linecap = r.str('shape', 'linecapType', 'flat');
  const rotation = r.num('rotation', 'angle', 0);
  const shapeAngle = r.num('rotation', 'shapeAngle', 0);
  const textAngle = r.num('rotation', 'textAngle', 0);
  const textShow = r.bool('text', 'show', false);
  const font = r.font('text', 'fontColor', r.structural.background, 12, { textClass: 'label' });
  const hAlign = r.str('text', 'horizontalAlignment', 'center');
  const vAlign = r.str('text', 'verticalAlignment', 'middle');
  const margin = { top: r.num('text', 'topMargin', 0), bottom: r.num('text', 'bottomMargin', 0), left: r.num('text', 'leftMargin', 0), right: r.num('text', 'rightMargin', 0) };
  const inset = 6;
  const rc = { x: rect.x + inset, y: rect.y + inset, width: Math.max(0, rect.width - inset * 2), height: Math.max(0, rect.height - inset * 2) };
  const cx = rc.x + rc.width / 2;
  const cy = rc.y + rc.height / 2;
  const shadowShow = r.bool('shadow', 'show', false);
  const glowShow = r.bool('glow', 'show', false);
  const effects = buttonEffects(r, shadowShow, glowShow);
  const tx = hAlign === 'left' ? rc.x + 8 + margin.left : hAlign === 'right' ? rc.x + rc.width - 8 - margin.right : cx;
  const ty = vAlign === 'top' ? rc.y + margin.top + font.sizePx + 4 : vAlign === 'bottom' ? rc.y + rc.height - margin.bottom - 6 : cy + font.sizePx * 0.35;
  return (
    <g transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined}>
      {effects.length > 0 && <defs>{effectsFilter(`${uid}-sh`, effects)}</defs>}
      <g data-part="shape" transform={shapeAngle ? `rotate(${shapeAngle} ${cx} ${cy})` : undefined} fill={fillShow ? fillColor : 'none'} stroke={outlineShow || shape === 'line' ? outlineColor : 'none'} strokeWidth={outlineShow || shape === 'line' ? Math.max(outlineW, shape === 'line' ? 2 : 0) : 0} strokeLinecap={linecap === 'round' ? 'round' : linecap === 'square' ? 'square' : 'butt'} filter={effects.length > 0 ? `url(#${uid}-sh)` : undefined}>
        {tilePath(shape, rc, { radius })}
      </g>
      {textShow && <text data-part="shape-text" x={tx} y={ty} textAnchor={hAlign === 'left' ? 'start' : hAlign === 'right' ? 'end' : 'middle'} transform={textAngle ? `rotate(${textAngle} ${tx} ${ty})` : undefined} {...textProps(font)}>{r.str('text', 'text', '') || 'Text'}</text>}
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

export type { ReactNode };
