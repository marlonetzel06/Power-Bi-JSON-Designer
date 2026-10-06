import type { ReactNode } from 'react';
import { dashArray } from '../cartesian/axis';
import { truncate } from '../fonts';
import { textProps, withAlpha, type Resolver } from '../resolver';
import { SLICER_ITEMS } from '../sampleData';
import { tilePath } from '../shared/shapes';
import type { BodyProps, Rect } from '../types';
import { cornerRadii, customEffects } from '../shared/cardStyle';
import { getCardEntry } from '@/pbi/resolve';

function outlineOn(v: string | number | boolean | undefined): boolean {
  return v !== undefined && v !== 0 && v !== '0' && v !== 'None' && v !== false && v !== '';
}

/** Classic slicer: header + items (list / dropdown / between / relative date). */
export function ClassicSlicer({ r, rect }: BodyProps) {
  const mode = r.str('data', 'mode', 'Basic');
  const headerShow = r.bool('header', 'show', true);
  const headerFont = r.font('header', 'fontColor', r.structural.first, 10, { props: { size: 'textSize' }, textClass: 'header' });
  const headerBg = r.color('header', 'background', '');
  const headerOutline = outlineOn(r.raw('header', 'outlineStyle'));
  const headerRestatement = r.bool('header', 'showRestatement', false);
  const itemFont = r.font('items', 'fontColor', r.structural.second, 10, { props: { size: 'textSize' }, textClass: 'label' });
  const itemBg = r.color('items', 'background', '');
  const itemOutline = outlineOn(r.raw('items', 'outlineStyle'));
  const padding = r.num('items', 'padding', 4);
  const singleSelect = r.bool('selection', 'singleSelect', false);
  const selectAll = r.bool('selection', 'selectAllCheckboxEnabled', false);
  const nodes: ReactNode[] = [];
  let y = rect.y;
  if (headerShow) {
    const h = headerFont.sizePx + 10;
    if (headerBg) nodes.push(<rect key="hb" data-part="slicer-header-bg" x={rect.x} y={y} width={rect.width} height={h} fill={headerBg} />);
    if (headerOutline) nodes.push(<line key="ho" x1={rect.x} x2={rect.x + rect.width} y1={y + h} y2={y + h} stroke={r.structural.third} />);
    const title = r.str('header', 'text', '') || 'Produktgruppe';
    nodes.push(<text key="ht" data-part="slicer-header" x={rect.x + 4} y={y + headerFont.sizePx + 4} {...textProps(headerFont)}>{truncate(headerRestatement ? `${title}: Software` : title, rect.width - 8, headerFont.sizePx, headerFont.weight >= 600)}</text>);
    y += h + 2;
  }
  if (mode === 'Dropdown') {
    const h = itemFont.sizePx + padding * 2 + 4;
    nodes.push(<rect key="dd" data-part="slicer-dropdown" x={rect.x} y={y} width={rect.width} height={h} fill={itemBg || r.structural.background} stroke={r.structural.fourth} />);
    nodes.push(<text key="ddt" x={rect.x + padding + 4} y={y + h / 2 + itemFont.sizePx * 0.35} {...textProps(itemFont)}>Alle</text>);
    nodes.push(<path key="ddc" d={`M${rect.x + rect.width - 16},${y + h / 2 - 3} l5,5 l5,-5`} stroke={itemFont.color} strokeWidth={1.5} fill="none" />);
    return <g>{nodes}</g>;
  }
  if (mode === 'Relative' || mode === 'RelativeTime' || mode === 'Single') {
    // relative date slicer: dropdowns + number input using the date card
    const dateFont = r.font('date', 'fontColor', r.structural.first, 10, { props: { size: 'textSize' }, textClass: 'label' });
    const dateBg = r.color('date', 'background', r.structural.background);
    const h = dateFont.sizePx + 10;
    const parts = mode === 'Single' ? [['', rect.width]] : [['Letzte', rect.width * 0.34], ['3', rect.width * 0.18], [mode === 'RelativeTime' ? 'Stunden' : 'Monate', rect.width * 0.4]] as const;
    let x = rect.x;
    parts.forEach(([label, w], i) => {
      nodes.push(<rect key={`d${i}`} data-part="slicer-date" x={x} y={y} width={Number(w) - 4} height={h} fill={dateBg} stroke={r.structural.fourth} />);
      nodes.push(<text key={`dt${i}`} x={x + 6} y={y + h / 2 + dateFont.sizePx * 0.35} {...textProps(dateFont)}>{mode === 'Single' ? '30.09.2026' : String(label)}</text>);
      if (i !== 1 && !r.bool('date', 'hideDatePickerButton', false)) nodes.push(<path key={`dc${i}`} d={`M${x + Number(w) - 16},${y + h / 2 - 3} l4,4 l4,-4`} stroke={dateFont.color} strokeWidth={1.4} fill="none" />);
      x += Number(w);
    });
    return <g>{nodes}</g>;
  }
  if (mode === 'Between' || mode === 'Before' || mode === 'After') {
    const sliderColor = r.color('slider', 'color', r.dataColor(0));
    const handle = r.color('slider', 'handleFillColor', r.structural.background);
    const handleBorder = r.color('slider', 'handleBorderColor', sliderColor);
    const inputFont = r.font('numericInputStyle', 'fontColor', r.structural.first, 10, { props: { size: 'textSize' }, textClass: 'label' });
    const inputBg = r.color('numericInputStyle', 'background', r.structural.background);
    const boxW = (rect.width - 12) / 2;
    const boxH = inputFont.sizePx + 10;
    nodes.push(<rect key="i0" data-part="slicer-input" x={rect.x} y={y} width={boxW} height={boxH} fill={inputBg} stroke={r.structural.fourth} />);
    nodes.push(<text key="t0" x={rect.x + 6} y={y + boxH / 2 + inputFont.sizePx * 0.35} {...textProps(inputFont)}>{mode === 'After' ? '' : '1.000'}</text>);
    nodes.push(<rect key="i1" x={rect.x + boxW + 12} y={y} width={boxW} height={boxH} fill={inputBg} stroke={r.structural.fourth} />);
    nodes.push(<text key="t1" x={rect.x + boxW + 18} y={y + boxH / 2 + inputFont.sizePx * 0.35} {...textProps(inputFont)}>{mode === 'Before' ? '' : '8.500'}</text>);
    const sy = y + boxH + 18;
    if (r.bool('slider', 'show', true)) {
      nodes.push(<line key="s0" x1={rect.x + 6} x2={rect.x + rect.width - 6} y1={sy} y2={sy} stroke={r.color('slider', 'secondaryLineColor', r.structural.third)} strokeWidth={3} strokeLinecap="round" />);
      nodes.push(<line key="s1" data-part="slicer-slider" x1={rect.x + rect.width * 0.2} x2={rect.x + rect.width * 0.75} y1={sy} y2={sy} stroke={sliderColor} strokeWidth={3} strokeLinecap="round" />);
      nodes.push(<circle key="h0" cx={rect.x + rect.width * 0.2} cy={sy} r={6} fill={handle} stroke={handleBorder} strokeWidth={2} />);
      nodes.push(<circle key="h1" cx={rect.x + rect.width * 0.75} cy={sy} r={6} fill={handle} stroke={handleBorder} strokeWidth={2} />);
    }
    return <g>{nodes}</g>;
  }
  const horizontal = mode === 'HorizontalList';
  const rowH = itemFont.sizePx + padding * 2 + 2;
  // search box (searchBox card): shown in list mode so its colours are visible; never in the horizontal list
  if (!horizontal && (r.has('searchBox', 'background') || r.has('searchBox', 'borderColor') || outlineOn(r.raw('searchBox', 'outlineStyle')))) {
    const h = itemFont.sizePx + 8;
    nodes.push(<rect key="sb" data-part="slicer-search" x={rect.x} y={y} width={rect.width} height={h} fill={r.color('searchBox', 'background', r.structural.background)} stroke={r.color('searchBox', 'borderColor', r.structural.fourth)} />);
    nodes.push(<text key="sbt" x={rect.x + 6} y={y + h / 2 + itemFont.sizePx * 0.35} {...textProps(itemFont)} fill={withAlpha(itemFont.color, 45)}>Suchen</text>);
    nodes.push(<circle key="sbi" cx={rect.x + rect.width - 12} cy={y + h / 2 - 1} r={3.5} fill="none" stroke={itemFont.color} strokeWidth={1.2} />);
    y += h + 4;
  }
  const baseItems = selectAll ? ['Alle auswählen', ...SLICER_ITEMS.slice(1)] : SLICER_ITEMS;
  // the horizontal list is limited by the width (one row of chips), the vertical list by the height
  const items = baseItems.slice(0, Math.max(1, horizontal ? Math.floor(rect.width / (itemFont.sizePx * 4.5)) : Math.floor((rect.y + rect.height - y) / rowH)));
  if (horizontal) {
    const w = rect.width / items.length;
    items.forEach((it, i) => {
      const x = rect.x + i * w;
      const selected = i === 1;
      nodes.push(<rect key={`b${i}`} data-part="slicer-item" x={x + 1} y={y} width={w - 2} height={rowH} fill={selected ? r.dataColor(0) : itemBg || r.structural.third} stroke={itemOutline ? r.structural.fourth : 'none'} />);
      nodes.push(<text key={`t${i}`} x={x + w / 2} y={y + rowH / 2 + itemFont.sizePx * 0.35} textAnchor="middle" {...textProps(itemFont)} fill={selected ? r.structural.background : itemFont.color}>{truncate(it, w - 8, itemFont.sizePx)}</text>);
    });
    return <g>{nodes}</g>;
  }
  items.forEach((it, i) => {
    const yy = y + i * rowH;
    const checked = i === 1 || (!singleSelect && i === 3);
    if (itemBg) nodes.push(<rect key={`b${i}`} data-part="slicer-item" x={rect.x} y={yy} width={rect.width} height={rowH} fill={itemBg} />);
    if (itemOutline) nodes.push(<rect key={`o${i}`} x={rect.x} y={yy} width={rect.width} height={rowH} fill="none" stroke={r.structural.third} />);
    const bx = rect.x + padding + 2;
    const by = yy + rowH / 2 - 6;
    if (singleSelect) {
      nodes.push(<circle key={`c${i}`} cx={bx + 6} cy={by + 6} r={5.5} fill={r.structural.background} stroke={r.structural.second} strokeWidth={1.2} />);
      if (checked) nodes.push(<circle key={`cd${i}`} cx={bx + 6} cy={by + 6} r={3} fill={r.structural.first} />);
    } else {
      nodes.push(<rect key={`c${i}`} x={bx} y={by} width={12} height={12} rx={2} fill={checked ? r.structural.first : r.structural.background} stroke={r.structural.second} strokeWidth={1.2} />);
      if (checked) nodes.push(<path key={`ck${i}`} d={`M${bx + 2.5},${by + 6} l2.5,2.5 l5,-5`} stroke={r.structural.background} strokeWidth={1.6} fill="none" />);
    }
    nodes.push(<text key={`t${i}`} x={bx + 20} y={yy + rowH / 2 + itemFont.sizePx * 0.35} {...textProps(itemFont)}>{truncate(it, rect.width - 30, itemFont.sizePx)}</text>);
  });
  return <g>{nodes}</g>;
}

/** Button slicer (advancedSlicerVisual) and list slicer: tiles with states, label, icons, accent bar. */
export function ButtonSlicer({ r, rect, uid, list }: BodyProps & { list?: boolean }) {
  const style = r.str('layout', 'style', 'Cards');
  // layout.orientation: 0 grid, 1 single column, 2 single row
  const orientation = String(r.raw('layout', 'orientation') ?? 0);
  const cols = list || orientation === '1' ? 1 : orientation === '2' ? 4 : Math.max(1, Math.min(4, r.num('layout', 'columnCount', 0) || 3));
  const customPad = r.bool('layout', 'customizePadding', false);
  const cellPad = r.num('layout', 'cellPadding', 6);
  const rowGap = customPad ? r.num('layout', 'rowPadding', cellPad) : cellPad;
  const colGap = customPad ? r.num('layout', 'columnPadding', cellPad) : cellPad;
  const outer = { top: r.num('layout', 'topOuterMargin', 0), bottom: r.num('layout', 'bottomOuterMargin', 0), left: r.num('layout', 'leftOuterMargin', 0), right: r.num('layout', 'rightOuterMargin', 0) };
  const corners = cornerRadii(r, 'layout', 6);
  const tileShape = r.str('shapeCustomRectangle', 'tileShape', 'rectangleRounded');
  const tileCorners = r.has('shapeCustomRectangle', 'rectangleRoundedCurve') || r.has('shapeCustomRectangle', 'rectangleRoundedCurveCustomStyle') ? cornerRadii(r, 'shapeCustomRectangle', corners.radius) : corners;
  const bgShow = r.bool('layout', 'backgroundShow', false);
  const bgColor = withAlpha(r.color('layout', 'backgroundFillColor', r.structural.third), r.num('layout', 'backgroundTransparency', 0));
  const bgBorderW = r.num('layout', 'borderWidth', 0);
  const bgBorder = withAlpha(r.color('layout', 'borderColor', r.structural.third), r.num('layout', 'borderTransparency', 0));
  const customLines = r.bool('layout', 'customizeLines', false);
  const lineColor = withAlpha(r.color('layout', 'lineColor', r.structural.third), r.num('layout', 'lineTransparency', 0));
  const lineW = r.num('layout', 'lineWidth', 1);
  const lineDash = dashArray(r.str('layout', 'lineStyle', 'solid'), lineW);
  const indentation = list ? r.num('layout', 'indentation', 0) : 0;

  const labelShow = r.bool('label', 'show', false);
  const labelFont = r.font('label', 'fontColor', r.structural.second, 9, { textClass: 'label' });
  const labelPos = r.str('label', 'position', 'aboveValue');
  const labelOpacity = 1 - r.num('label', 'transparency', 0) / 100;
  const { defs, filter } = customEffects(r, uid);

  // Tile state: the whole slicer renders the explicitly requested state; otherwise tile 1 is the selected one.
  const states = {
    def: r,
    selected: r.stateId ? r : r.withState('selection:selected'),
  };
  const items = SLICER_ITEMS.slice(list ? 0 : 1, 5);
  const rows = Math.ceil(items.length / cols);
  const area: Rect = { x: rect.x + outer.left, y: rect.y + outer.top, width: Math.max(10, rect.width - outer.left - outer.right), height: Math.max(10, rect.height - outer.top - outer.bottom) };
  const nodes: ReactNode[] = [];
  let top = area.y;
  if (labelShow && labelPos !== 'belowValue') {
    nodes.push(<text key="label" data-part="slicer-label" x={area.x} y={top + labelFont.sizePx} opacity={labelOpacity} {...textProps(labelFont)}>Produktgruppe</text>);
    top += labelFont.sizePx * 1.4;
  }
  const availableH = area.y + area.height - top;
  const cellW = (area.width - colGap * (cols - 1)) / cols;
  const cellH = Math.max(4, Math.min((availableH - rowGap * (rows - 1)) / rows, list ? labelFont.sizePx + 18 : 60));
  // the theme styles the selected state itself when its `selection:selected` entry sets a fill colour
  const stateHasFill = getCardEntry(r.theme, r.visualKey, 'fillCustom', undefined, 'selection:selected')?.fillColor !== undefined;
  if (bgShow) nodes.push(<g key="bg" data-part="slicer-bg" fill={bgColor} stroke={bgBorderW > 0 ? bgBorder : 'none'} strokeWidth={bgBorderW}>{tilePath('rectangleRounded', area, corners)}</g>);
  items.forEach((it, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const selected = i === 1;
    const rs: Resolver = selected ? states.selected : states.def;
    const x = area.x + col * (cellW + colGap) + (list ? indentation * (i % 2) : 0);
    const y = top + row * (cellH + rowGap);
    const w = cellW - (list ? indentation * (i % 2) : 0);
    if (y + cellH > area.y + area.height + 1) return;
    const rc: Rect = { x, y, width: w, height: cellH };
    const fillShow = rs.bool('fillCustom', 'show', true);
    const fillColor = withAlpha(rs.color('fillCustom', 'fillColor', r.structural.background), rs.num('fillCustom', 'transparency', 0));
    const outlineShow = rs.bool('outline', 'show', !list);
    const outlineColor = withAlpha(rs.color('outline', 'lineColor', r.structural.second), rs.num('outline', 'transparency', 0));
    const outlineW = rs.num('outline', 'weight', 1);
    const valueFont = rs.font('value', 'fontColor', r.structural.first, 10, { textClass: 'label' });
    const valueShow = rs.bool('value', 'show', true);
    const hAlign = rs.str('value', 'horizontalAlignment', list ? 'left' : 'center');
    const vAlign = rs.str('value', 'verticalAlignment', 'middle');
    const valueOpacity = 1 - rs.num('value', 'transparency', 0) / 100;
    const accentShow = rs.bool('accentBar', 'show', false);
    const accentColor = withAlpha(rs.color('accentBar', 'color', r.dataColor(0)), rs.num('accentBar', 'transparency', 0));
    const accentW = rs.num('accentBar', 'width', 4);
    const accentPos = rs.str('accentBar', 'position', 'Left');
    const iconShow = rs.bool('selectionIcon', 'show', list ?? false);
    const iconColor = withAlpha(rs.color('selectionIcon', 'color', r.structural.first), rs.num('selectionIcon', 'transparency', 0));
    const iconSize = rs.num('selectionIcon', 'size', 12);
    const iconPos = rs.str('selectionIcon', 'position', 'Left');
    const iconSpacing = rs.num('selectionIcon', 'spacing', 8);
    const iconOverlay = rs.bool('selectionIcon', 'overlayToggle', false);
    const iconByState = rs.bool('selectionIcon', 'showIconByState', false);
    const imgShow = rs.bool('icon', 'show', false);
    const imgSize = imgShow ? rs.num('icon', 'size', 16) : 0;
    const imgPos = imgShow ? rs.str('icon', 'position', 'Left') : 'Left';
    const imgPad = imgShow ? rs.num('icon', 'padding', 4) : 0;
    const expandShow = list && r.hasCard('expansionIcon') && i % 2 === 0;
    const expandColor = expandShow ? withAlpha(r.color('expansionIcon', 'color', r.structural.first), r.num('expansionIcon', 'transparency', 0)) : '';
    const expandSize = expandShow ? r.num('expansionIcon', 'size', 12) : 0;
    const expandPos = expandShow ? r.str('expansionIcon', 'position', 'Left') : 'Left';
    const expandSpacing = expandShow ? r.num('expansionIcon', 'spacing', 6) : 0;

    // Without a state entry the default styling marks the selected tile with the first data colour (Power BI default).
    const fallbackSelected = selected && !r.stateId && !stateHasFill;
    const tileFill = fallbackSelected ? (style === 'Table' || list ? r.structural.third : r.dataColor(0)) : fillColor;
    if (style === 'Table' || list) {
      if (fillShow) nodes.push(<rect key={`f${i}`} data-part="slicer-tile" data-selected={selected ? '' : undefined} x={x} y={y} width={w} height={cellH} fill={tileFill} stroke={outlineShow ? outlineColor : 'none'} strokeWidth={outlineShow ? outlineW : 0} />);
      if (i < items.length - 1 && (customLines || !r.has('layout', 'customizeLines'))) nodes.push(<line key={`l${i}`} x1={x} x2={x + w} y1={y + cellH + rowGap / 2} y2={y + cellH + rowGap / 2} stroke={customLines ? lineColor : r.structural.third} strokeWidth={customLines ? lineW : 1} strokeDasharray={customLines ? lineDash : undefined} />);
    } else if (fillShow) {
      nodes.push(<g key={`f${i}`} data-part="slicer-tile" data-selected={selected ? '' : undefined} fill={tileFill} stroke={outlineShow ? outlineColor : 'none'} strokeWidth={outlineShow ? outlineW : 0} filter={filter}>{tilePath(tileShape, rc, tileCorners)}</g>);
    }
    if (accentShow) {
      const horizontalBar = accentPos === 'Top' || accentPos === 'Bottom';
      nodes.push(<rect key={`a${i}`} data-part="accent-bar" x={accentPos === 'Right' ? x + w - accentW : x} y={accentPos === 'Bottom' ? y + cellH - accentW : y} width={horizontalBar ? w : accentW} height={horizontalBar ? accentW : cellH} fill={accentColor} />);
    }
    let left = x + 8;
    let right = x + w - 8;
    if (expandShow) {
      const ex = expandPos === 'Right' ? right - expandSize : left;
      nodes.push(<path key={`ex${i}`} data-part="expansion-icon" d={`M${ex + expandSize * 0.2},${y + cellH / 2 - expandSize * 0.2} l${expandSize * 0.3},${expandSize * 0.35} l${expandSize * 0.3},${-expandSize * 0.35}`} stroke={expandColor} strokeWidth={1.4} fill="none" />);
      if (expandPos === 'Right') right -= expandSize + expandSpacing;
      else left += expandSize + expandSpacing;
    }
    const drawIcon = iconShow && !iconOverlay && (!iconByState || selected);
    if (drawIcon) {
      const ix = iconPos === 'Right' ? right - iconSize : left;
      const iy = y + cellH / 2 - iconSize / 2;
      nodes.push(<rect key={`i${i}`} data-part="selection-icon" x={ix} y={iy} width={iconSize} height={iconSize} rx={2} fill={selected ? iconColor : 'none'} stroke={iconColor} strokeWidth={1.2} />);
      if (selected) nodes.push(<path key={`ic${i}`} d={`M${ix + iconSize * 0.22},${iy + iconSize / 2} l${iconSize * 0.2},${iconSize * 0.2} l${iconSize * 0.4},${-iconSize * 0.42}`} stroke={r.structural.background} strokeWidth={1.6} fill="none" />);
      if (iconPos === 'Right') right -= iconSize + iconSpacing;
      else left += iconSize + iconSpacing;
    }
    if (iconShow && iconOverlay && selected) nodes.push(<circle key={`io${i}`} data-part="selection-icon" cx={x + w - 6} cy={y + 6} r={3} fill={iconColor} />);
    if (imgShow) {
      const ix = imgPos === 'Right' ? right - imgSize : left;
      const iy = imgPos === 'Top' ? y + imgPad : imgPos === 'Bottom' ? y + cellH - imgSize - imgPad : y + cellH / 2 - imgSize / 2;
      nodes.push(<rect key={`img${i}`} data-part="tile-icon" x={imgPos === 'Top' || imgPos === 'Bottom' ? x + w / 2 - imgSize / 2 : ix} y={iy} width={imgSize} height={imgSize} rx={2} fill={withAlpha(r.structural.fourth, rs.num('icon', 'transparency', 0))} />);
      if (imgPos === 'Right') right -= imgSize + imgPad;
      else if (imgPos === 'Left') left += imgSize + imgPad;
    }
    const tx = hAlign === 'center' ? (left + right) / 2 : hAlign === 'right' ? right : left;
    const ty = vAlign === 'top' ? y + valueFont.sizePx + 4 : vAlign === 'bottom' ? y + cellH - 6 : y + cellH / 2 + valueFont.sizePx * 0.35;
    // the fallback highlight inverts the text only when the theme sets no font colour of its own
    const color = fallbackSelected && style !== 'Table' && !list && !rs.has('value', 'fontColor') ? r.structural.background : valueFont.color;
    if (valueShow) nodes.push(<text key={`t${i}`} data-part="slicer-value" x={tx} y={ty} textAnchor={hAlign === 'center' ? 'middle' : hAlign === 'right' ? 'end' : 'start'} opacity={valueOpacity} {...textProps(valueFont)} fill={color}>{truncate(it, Math.max(10, right - left), valueFont.sizePx)}</text>);
  });
  if (labelShow && labelPos === 'belowValue') nodes.push(<text key="label" data-part="slicer-label" x={area.x} y={area.y + area.height - 2} opacity={labelOpacity} {...textProps(labelFont)}>Produktgruppe</text>);
  return (
    <g>
      {defs}
      {nodes}
    </g>
  );
}

/** Text slicer: input box (inputTextBox), typed text / placeholder (inputText), apply button (applyButton). */
export function TextSlicer({ r, rect }: BodyProps) {
  const font = r.font('inputText', 'fontColor', r.structural.first, 10, { textClass: 'label' });
  const placeholder = r.str('inputText', 'placeholder', '') || 'Text eingeben…';
  const boxBg = r.bool('inputTextBox', 'backShow', true) ? withAlpha(r.color('inputTextBox', 'backColor', r.structural.background), r.num('inputTextBox', 'backTransparency', 0)) : 'none';
  const boxBorderShow = r.bool('inputTextBox', 'borderShow', true);
  const boxBorder = withAlpha(r.color('inputTextBox', 'borderColor', r.structural.fourth), r.num('inputTextBox', 'borderTransparency', 0));
  const boxBorderW = r.num('inputTextBox', 'borderWidth', 1);
  const accentShow = r.bool('inputTextBox', 'accentBarShow', false);
  const accentColor = r.color('inputTextBox', 'accentBarColor', r.dataColor(0));
  const accentW = r.num('inputTextBox', 'accentBarWidth', 3);
  const btnShow = r.bool('applyButton', 'backShow', true);
  const btnColor = withAlpha(r.color('applyButton', 'backColor', r.dataColor(0)), r.num('applyButton', 'backTransparency', 0));
  const btnBorderShow = r.bool('applyButton', 'borderShow', false);
  const btnBorder = r.color('applyButton', 'borderColor', r.structural.fourth);
  const iconColor = r.color('applyButton', 'iconColor', r.structural.background);
  const iconSize = r.num('applyButton', 'iconSize', 12);
  const spacing = r.num('applyButton', 'spacing', 6);
  const h = Math.min(rect.height, font.sizePx + 14);
  const btnW = Math.min(h + 8, rect.width * 0.25);
  const boxW = rect.width - btnW - spacing;
  const cy = rect.y + h / 2;
  return (
    <g>
      <rect x={rect.x} y={rect.y} width={boxW} height={h} rx={2} fill={boxBg} stroke={boxBorderShow ? boxBorder : 'none'} strokeWidth={boxBorderShow ? boxBorderW : 0} />
      {accentShow && <rect x={rect.x} y={rect.y + h - accentW} width={boxW} height={accentW} fill={accentColor} />}
      <text x={rect.x + 8} y={cy + font.sizePx * 0.35} {...textProps(font)} fill={withAlpha(font.color, 45)}>{placeholder}</text>
      <rect x={rect.x + rect.width - btnW} y={rect.y} width={btnW} height={h} rx={2} fill={btnShow ? btnColor : 'none'} stroke={btnBorderShow ? btnBorder : 'none'} />
      <path d={`M${rect.x + rect.width - btnW / 2 - iconSize / 2},${cy} h${iconSize} m-${iconSize * 0.4},-${iconSize * 0.4} l${iconSize * 0.4},${iconSize * 0.4} l-${iconSize * 0.4},${iconSize * 0.4}`} stroke={iconColor} strokeWidth={1.5} fill="none" />
    </g>
  );
}
