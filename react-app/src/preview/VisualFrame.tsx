import type { ReactNode } from 'react';
import { dashArray } from './cartesian/axis';
import { truncate, wrapText } from './fonts';
import { textProps, withAlpha, type FontStyle, type Resolver } from './resolver';
import { shadowFilter, shadowOffset } from './shared/effects';
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

/**
 * The visual container as Power BI draws it: background, border (with radius),
 * drop shadow, title + subtitle (+ subheader), divider, spacing, padding. Children render into the remaining area.
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
  const shadowInner = shadowShow && r.str('dropShadow', 'position', 'Outer') === 'Inner';
  const [offX, offY] = shadowShow ? shadowOffset(r.str('dropShadow', 'preset', 'BottomRight'), r.num('dropShadow', 'shadowDistance', 2), r.num('dropShadow', 'angle', 45)) : [0, 0];
  const shadowSpec = shadowShow
    ? { dx: offX, dy: offY, blur: r.num('dropShadow', 'shadowBlur', 4), spread: r.num('dropShadow', 'shadowSpread', 0), color: r.color('dropShadow', 'color', '#000000'), opacity: 1 - r.num('dropShadow', 'transparency', 60) / 100, inner: shadowInner, shadowOnly: true }
    : undefined;

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
  const titleWrap = r.bool('title', 'titleWrap', true);
  const titleBg = r.raw('title', 'background');
  const subShow = !suppressTitle && r.bool('subTitle', 'show', false);
  const subText = r.str('subTitle', 'text', '') || 'Untertitel';
  const subFont = r.font('subTitle', 'fontColor', r.structural.second, 10, { textClass: 'title' });
  const subAlign = r.str('subTitle', 'alignment', titleAlign);
  const subWrap = r.bool('subTitle', 'titleWrap', true);
  const dividerShow = r.bool('divider', 'show', false);
  const dividerColor = borderVariant ? withAlpha(r.color('divider', 'dividerColor', '#E6E6E6'), r.num('divider', 'dividerTransparency', 0)) : r.color('divider', 'color', '#E6E6E6');
  const dividerWidth = borderVariant ? r.num('divider', 'dividerWidth', 1) : r.num('divider', 'width', 1);
  const dividerDash = dashArray(borderVariant ? r.str('divider', 'dividerLineStyle', 'solid') : r.str('divider', 'style', 'solid'), dividerWidth);
  const dividerIgnorePadding = borderVariant ? r.bool('divider', 'dividerIgnorePadding', false) : r.bool('divider', 'ignorePadding', false);
  // spacing: the shared card has custom spaces below title/subtitle/title area; the card visual only `verticalSpacing`
  const spacingVariant = marginVariant;
  const customSpacing = !spacingVariant && r.bool('spacing', 'customizeSpacing', false);
  const spaceBelowTitle = customSpacing ? r.num('spacing', 'spaceBelowTitle', 0) : 0;
  const spaceBelowSub = customSpacing ? r.num('spacing', 'spaceBelowSubTitle', 0) : 0;
  const spaceBelowArea = customSpacing ? r.num('spacing', 'spaceBelowTitleArea', 0) : spacingVariant ? r.num('spacing', 'verticalSpacing', 0) : 0;
  // subheader (cartesian charts): an extra line under the title area or at the bottom
  const subheaderShow = !suppressTitle && r.hasCard('subheader') && r.bool('subheader', 'show', false);
  const subheaderFont = subheaderShow ? r.font('subheader', 'fontColor', r.structural.second, 10, { textClass: 'label' }) : subFont;
  const subheaderPos = subheaderShow ? r.str('subheader', 'position', 'top') : 'top';
  const subheaderAlign = subheaderShow ? r.str('subheader', 'alignment', 'left') : 'left';

  const inset = borderShow ? borderWidth : 0;
  let y = padTop + inset;
  const innerX = padLeft + inset;
  const innerW = Math.max(0, width - padLeft - padRight - inset * 2);
  const lineH = (f: FontStyle) => f.sizePx * 1.35;

  const anchorX = (align: string) => (align === 'center' ? innerX + innerW / 2 : align === 'right' ? innerX + innerW : innerX);
  const anchor = (align: string) => (align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start');

  const textBlock = (key: string, text: string, font: FontStyle, align: string, wrap: boolean, part: string): ReactNode => {
    const lines = wrap ? wrapText(text, innerW, font, 2) : [truncate(text, innerW, font.sizePx, font.weight >= 600)];
    const el = (
      <text key={key} data-part={part} x={anchorX(align)} y={y + font.sizePx} textAnchor={anchor(align)} {...textProps(font)}>
        {lines.length === 1 ? lines[0] : lines.map((l, i) => <tspan key={i} x={anchorX(align)} dy={i === 0 ? 0 : lineH(font)}>{l}</tspan>)}
      </text>
    );
    y += lineH(font) * lines.length;
    return el;
  };

  const header: ReactNode[] = [];
  if (titleShow) {
    const bgY = y - 2;
    const el = textBlock('title', titleText, titleFont, titleAlign, titleWrap, 'title');
    if (typeof titleBg === 'string' && titleBg) header.push(<rect key="title-bg" x={inset} y={bgY} width={width - inset * 2} height={y - bgY + 2} fill={titleBg} />);
    header.push(el);
    y += spaceBelowTitle;
  }
  if (subShow) {
    header.push(textBlock('sub', subText, subFont, subAlign, subWrap, 'subtitle'));
    y += spaceBelowSub;
  }
  if (subheaderShow && subheaderPos !== 'bottom') header.push(textBlock('subheader', 'Quelle: Vertriebsdaten 2026', subheaderFont, subheaderAlign, false, 'subheader'));
  const hasHeader = titleShow || subShow || (subheaderShow && subheaderPos !== 'bottom');
  if (dividerShow && hasHeader) {
    header.push(<line key="div" data-part="divider" x1={dividerIgnorePadding ? inset : innerX} x2={dividerIgnorePadding ? width - inset : innerX + innerW} y1={y + 2} y2={y + 2} stroke={dividerColor} strokeWidth={dividerWidth} strokeDasharray={dividerDash} />);
    y += 6;
  }
  if (hasHeader) y += 4 + spaceBelowArea;

  let bottomReserve = padBottom + inset;
  const footer: ReactNode[] = [];
  if (subheaderShow && subheaderPos === 'bottom') {
    const fy = height - padBottom - inset - subheaderFont.sizePx * 0.4;
    footer.push(<text key="subheader" data-part="subheader" x={anchorX(subheaderAlign)} y={fy} textAnchor={anchor(subheaderAlign)} {...textProps(subheaderFont)}>{truncate('Quelle: Vertriebsdaten 2026', innerW, subheaderFont.sizePx)}</text>);
    bottomReserve += lineH(subheaderFont);
  }

  const content: Rect = { x: innerX, y, width: innerW, height: Math.max(0, height - y - bottomReserve) };
  const shadowId = `${uid}-shadow`;
  const clipId = `${uid}-clip`;

  return (
    <g>
      <defs>
        {shadowSpec && shadowFilter(shadowId, shadowSpec)}
        <clipPath id={clipId}>
          <rect x={0} y={0} width={width} height={height} rx={radius} ry={radius} />
        </clipPath>
      </defs>
      {/* Power BI casts the container's shadow whatever the background's transparency: paint it from an opaque stand-in. */}
      {shadowSpec && <rect data-part="shadow" x={inset / 2} y={inset / 2} width={width - inset} height={height - inset} rx={radius} ry={radius} fill="#000000" filter={`url(#${shadowId})`} />}
      <rect
        data-part="frame"
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
      />
      <g clipPath={`url(#${clipId})`}>
        {header}
        {content.height > 8 && content.width > 8 ? children(content) : null}
        {footer}
      </g>
    </g>
  );
}
