import type { ReactNode } from 'react';
import { dashArray } from './cartesian/axis';
import { truncate } from './fonts';
import { textProps, withAlpha, type Resolver } from './resolver';
import type { Rect } from './types';

export interface VisualFrameProps {
  r: Resolver;
  width: number;
  height: number;
  uid: string;
  /** Title text shown when the theme does not set one. */
  defaultTitle: string;
  /** Visuals like buttons/shapes have no title bar in Power BI. */
  suppressTitle?: boolean;
  children: (content: Rect) => ReactNode;
}

const SHADOW_OFFSETS: Record<string, [number, number]> = {
  BottomRight: [1, 1], Bottom: [0, 1], BottomLeft: [-1, 1], CenterRight: [1, 0], Center: [0, 0],
  CenterLeft: [-1, 0], TopRight: [1, -1], Top: [0, -1], TopLeft: [-1, -1],
};

/**
 * The visual container as Power BI draws it: background, border (with radius),
 * drop shadow, title + subtitle, padding. Children render into the remaining area.
 */
export function VisualFrame({ r, width, height, uid, defaultTitle, suppressTitle, children }: VisualFrameProps) {
  const bgShow = r.bool('background', 'show', true);
  const bgColor = r.color('background', 'color', r.structural.background);
  const bgTransparency = r.num('background', 'transparency', 0);
  // cardVisual has its own `border` variant (style/transparency instead of radius); the radius then comes from the layout card.
  const borderVariant = r.visualKey === 'cardVisual';
  const borderShow = r.bool('border', 'show', false);
  const borderColor = borderVariant ? withAlpha(r.color('border', 'color', '#E6E6E6'), r.num('border', 'transparency', 0)) : r.color('border', 'color', '#E6E6E6');
  const borderWidth = r.num('border', 'width', 1);
  const borderDash = borderVariant ? dashArray(r.str('border', 'style', 'solid'), borderWidth) : undefined;
  const radius = borderVariant ? 0 : r.num('border', 'radius', 0);
  const shadowShow = r.bool('dropShadow', 'show', false);
  const shadowColor = r.color('dropShadow', 'color', '#000000');
  const shadowBlur = r.num('dropShadow', 'shadowBlur', 4);
  const shadowDistance = r.num('dropShadow', 'shadowDistance', 2);
  const shadowTransparency = r.num('dropShadow', 'transparency', 60);
  const shadowPreset = r.str('dropShadow', 'preset', 'BottomRight');
  const shadowAngle = r.num('dropShadow', 'angle', 45);
  // cardVisual and the button/list slicers use a padding variant (paddingSelection + *Margin).
  const marginVariant = r.visualKey === 'cardVisual' || r.visualKey === 'advancedSlicerVisual' || r.visualKey === 'listSlicer';
  const padPreset = marginVariant ? r.str('padding', 'paddingSelection', 'Normal') : 'Custom';
  const presetPad = padPreset === 'Wide' ? 10 : padPreset === 'Narrow' ? 2 : 5;
  const pad = (side: 'top' | 'bottom' | 'left' | 'right') => (marginVariant ? (padPreset === 'Custom' ? r.num('padding', `${side}Margin`, 5) : presetPad) : r.num('padding', side, 5));
  const padTop = pad('top');
  const padBottom = pad('bottom');
  const padLeft = pad('left');
  const padRight = pad('right');

  const titleShow = !suppressTitle && r.bool('title', 'show', true);
  const titleText = r.str('title', 'text', '') || defaultTitle;
  const titleFont = r.font('title', 'fontColor', r.structural.first, 12, { textClass: 'title' });
  const titleAlign = r.str('title', 'alignment', 'left');
  const titleBg = r.raw('title', 'background');
  const subShow = !suppressTitle && r.bool('subTitle', 'show', false);
  const subText = r.str('subTitle', 'text', '') || 'Untertitel';
  const subFont = r.font('subTitle', 'fontColor', r.structural.second, 10, { textClass: 'title' });
  const subAlign = r.str('subTitle', 'alignment', titleAlign);
  const dividerShow = r.bool('divider', 'show', false);
  const dividerColor = borderVariant ? withAlpha(r.color('divider', 'dividerColor', '#E6E6E6'), r.num('divider', 'dividerTransparency', 0)) : r.color('divider', 'color', '#E6E6E6');
  const dividerWidth = borderVariant ? r.num('divider', 'dividerWidth', 1) : r.num('divider', 'width', 1);
  const dividerDash = dashArray(borderVariant ? r.str('divider', 'dividerLineStyle', 'solid') : r.str('divider', 'style', 'solid'), dividerWidth);
  const dividerIgnorePadding = borderVariant ? r.bool('divider', 'dividerIgnorePadding', false) : r.bool('divider', 'ignorePadding', false);

  let offX = 0;
  let offY = 0;
  if (shadowShow) {
    if (shadowPreset === 'Custom') {
      const rad = (shadowAngle * Math.PI) / 180;
      offX = Math.cos(rad) * shadowDistance;
      offY = Math.sin(rad) * shadowDistance;
    } else {
      const [dx, dy] = SHADOW_OFFSETS[shadowPreset] ?? [1, 1];
      offX = dx * shadowDistance;
      offY = dy * shadowDistance;
    }
  }

  const inset = borderShow ? borderWidth : 0;
  let y = padTop + inset;
  const innerX = padLeft + inset;
  const innerW = Math.max(0, width - padLeft - padRight - inset * 2);
  const titleLineH = titleFont.sizePx * 1.35;
  const subLineH = subFont.sizePx * 1.35;

  const anchorX = (align: string) => (align === 'center' ? innerX + innerW / 2 : align === 'right' ? innerX + innerW : innerX);
  const anchor = (align: string) => (align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start');

  const titleEl = titleShow ? (
    <g key="title">
      {typeof titleBg === 'string' && titleBg && <rect x={inset} y={y - 2} width={width - inset * 2} height={titleLineH + 4} fill={titleBg} />}
      <text x={anchorX(titleAlign)} y={y + titleFont.sizePx} textAnchor={anchor(titleAlign)} {...textProps(titleFont)}>
        {truncate(titleText, innerW, titleFont.sizePx, titleFont.weight >= 600)}
      </text>
    </g>
  ) : null;
  if (titleShow) y += titleLineH;
  const subEl = subShow ? (
    <text key="sub" x={anchorX(subAlign)} y={y + subFont.sizePx} textAnchor={anchor(subAlign)} {...textProps(subFont)}>
      {truncate(subText, innerW, subFont.sizePx)}
    </text>
  ) : null;
  if (subShow) y += subLineH;
  const dividerEl = dividerShow && (titleShow || subShow) ? <line key="div" data-part="divider" x1={dividerIgnorePadding ? inset : innerX} x2={dividerIgnorePadding ? width - inset : innerX + innerW} y1={y + 2} y2={y + 2} stroke={dividerColor} strokeWidth={dividerWidth} strokeDasharray={dividerDash} /> : null;
  if (dividerShow && (titleShow || subShow)) y += 6;
  if (titleShow || subShow) y += 4;

  const content: Rect = { x: innerX, y, width: innerW, height: Math.max(0, height - y - padBottom - inset) };
  const shadowId = `${uid}-shadow`;
  const clipId = `${uid}-clip`;

  return (
    <g>
      <defs>
        {shadowShow && (
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx={offX} dy={offY} stdDeviation={shadowBlur / 2} floodColor={shadowColor} floodOpacity={1 - shadowTransparency / 100} />
          </filter>
        )}
        <clipPath id={clipId}>
          <rect x={0} y={0} width={width} height={height} rx={radius} ry={radius} />
        </clipPath>
      </defs>
      <rect
        x={inset / 2}
        y={inset / 2}
        width={width - inset}
        height={height - inset}
        rx={radius}
        ry={radius}
        fill={bgShow ? withAlpha(bgColor, bgTransparency) : 'transparent'}
        stroke={borderShow ? borderColor : 'none'}
        strokeWidth={borderShow ? borderWidth : 0}
        strokeDasharray={borderShow ? borderDash : undefined}
        filter={shadowShow ? `url(#${shadowId})` : undefined}
      />
      <g clipPath={`url(#${clipId})`}>
        {titleEl}
        {subEl}
        {dividerEl}
        {content.height > 8 && content.width > 8 ? children(content) : null}
      </g>
    </g>
  );
}

