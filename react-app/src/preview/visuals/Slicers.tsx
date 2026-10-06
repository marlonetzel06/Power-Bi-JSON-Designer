import type { ReactNode } from 'react';
import { truncate } from '../fonts';
import { textProps, withAlpha } from '../resolver';
import { SLICER_ITEMS } from '../sampleData';
import type { BodyProps } from '../types';

/** Classic slicer: header + items (list / dropdown / between). */
export function ClassicSlicer({ r, rect }: BodyProps) {
  const mode = r.str('data', 'mode', 'Basic');
  const headerShow = r.bool('header', 'show', true);
  const headerFont = r.font('header', 'fontColor', r.structural.first, 10, { props: { size: 'textSize' }, textClass: 'header' });
  const headerBg = r.color('header', 'background', '');
  const headerOutline = r.num('header', 'outlineStyle', 0);
  const itemFont = r.font('items', 'fontColor', r.structural.second, 10, { props: { size: 'textSize' }, textClass: 'label' });
  const itemBg = r.color('items', 'background', '');
  const itemOutline = r.num('items', 'outlineStyle', 0);
  const padding = r.num('items', 'padding', 4);
  const singleSelect = r.bool('selection', 'singleSelect', false);
  const nodes: ReactNode[] = [];
  let y = rect.y;
  if (headerShow) {
    const h = headerFont.sizePx + 10;
    if (headerBg) nodes.push(<rect key="hb" x={rect.x} y={y} width={rect.width} height={h} fill={headerBg} />);
    if (headerOutline !== 0) nodes.push(<line key="ho" x1={rect.x} x2={rect.x + rect.width} y1={y + h} y2={y + h} stroke={r.structural.third} />);
    nodes.push(<text key="ht" x={rect.x + 4} y={y + headerFont.sizePx + 4} {...textProps(headerFont)}>{r.str('header', 'text', '') || 'Produktgruppe'}</text>);
    y += h + 2;
  }
  if (mode === 'Dropdown') {
    const h = itemFont.sizePx + padding * 2 + 4;
    nodes.push(<rect key="dd" x={rect.x} y={y} width={rect.width} height={h} fill={itemBg || r.structural.background} stroke={r.structural.fourth} />);
    nodes.push(<text key="ddt" x={rect.x + padding + 4} y={y + h / 2 + itemFont.sizePx * 0.35} {...textProps(itemFont)}>Alle</text>);
    nodes.push(<path key="ddc" d={`M${rect.x + rect.width - 16},${y + h / 2 - 3} l5,5 l5,-5`} stroke={itemFont.color} strokeWidth={1.5} fill="none" />);
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
    nodes.push(<rect key="i0" x={rect.x} y={y} width={boxW} height={boxH} fill={inputBg} stroke={r.structural.fourth} />);
    nodes.push(<text key="t0" x={rect.x + 6} y={y + boxH / 2 + inputFont.sizePx * 0.35} {...textProps(inputFont)}>{mode === 'After' ? '' : '1.000'}</text>);
    nodes.push(<rect key="i1" x={rect.x + boxW + 12} y={y} width={boxW} height={boxH} fill={inputBg} stroke={r.structural.fourth} />);
    nodes.push(<text key="t1" x={rect.x + boxW + 18} y={y + boxH / 2 + inputFont.sizePx * 0.35} {...textProps(inputFont)}>{mode === 'Before' ? '' : '8.500'}</text>);
    const sy = y + boxH + 18;
    if (r.bool('slider', 'show', true)) {
      nodes.push(<line key="s0" x1={rect.x + 6} x2={rect.x + rect.width - 6} y1={sy} y2={sy} stroke={r.color('slider', 'secondaryLineColor', r.structural.third)} strokeWidth={3} strokeLinecap="round" />);
      nodes.push(<line key="s1" x1={rect.x + rect.width * 0.2} x2={rect.x + rect.width * 0.75} y1={sy} y2={sy} stroke={sliderColor} strokeWidth={3} strokeLinecap="round" />);
      nodes.push(<circle key="h0" cx={rect.x + rect.width * 0.2} cy={sy} r={6} fill={handle} stroke={handleBorder} strokeWidth={2} />);
      nodes.push(<circle key="h1" cx={rect.x + rect.width * 0.75} cy={sy} r={6} fill={handle} stroke={handleBorder} strokeWidth={2} />);
    }
    return <g>{nodes}</g>;
  }
  const horizontal = mode === 'HorizontalList';
  const rowH = itemFont.sizePx + padding * 2 + 2;
  const items = SLICER_ITEMS.slice(0, Math.max(1, Math.floor((rect.y + rect.height - y) / rowH)));
  if (horizontal) {
    const w = rect.width / items.length;
    items.forEach((it, i) => {
      const x = rect.x + i * w;
      const selected = i === 1;
      nodes.push(<rect key={`b${i}`} x={x + 1} y={y} width={w - 2} height={rowH} fill={selected ? withAlpha(r.dataColor(0), 0) : itemBg || r.structural.third} stroke={itemOutline !== 0 ? r.structural.fourth : 'none'} />);
      nodes.push(<text key={`t${i}`} x={x + w / 2} y={y + rowH / 2 + itemFont.sizePx * 0.35} textAnchor="middle" {...textProps(itemFont)} fill={selected ? r.structural.background : itemFont.color}>{truncate(it, w - 8, itemFont.sizePx)}</text>);
    });
    return <g>{nodes}</g>;
  }
  items.forEach((it, i) => {
    const yy = y + i * rowH;
    const checked = i === 1 || (!singleSelect && i === 3);
    if (itemBg) nodes.push(<rect key={`b${i}`} x={rect.x} y={yy} width={rect.width} height={rowH} fill={itemBg} />);
    if (itemOutline !== 0) nodes.push(<rect key={`o${i}`} x={rect.x} y={yy} width={rect.width} height={rowH} fill="none" stroke={r.structural.third} />);
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

/** Button slicer (advancedSlicerVisual) and list slicer. */
export function ButtonSlicer({ r, rect, list }: BodyProps & { list?: boolean }) {
  const style = r.str('layout', 'style', 'Cards');
  const orientation = String(r.raw('layout', 'orientation') ?? (list ? 2 : 1));
  const cols = list ? 1 : Math.max(1, Math.min(4, r.num('layout', 'columnCount', 0) || (orientation === '2' ? 1 : 3)));
  const gap = r.num('layout', 'cellPadding', 6);
  const radius = r.num('layout', 'rectangleRoundedCurve', 6);
  const bgShow = r.bool('layout', 'backgroundShow', false);
  const bgColor = r.color('layout', 'backgroundFillColor', r.structural.third);
  const fillShow = r.bool('fillCustom', 'show', true);
  const fillColor = withAlpha(r.color('fillCustom', 'fillColor', r.structural.background), r.num('fillCustom', 'transparency', 0));
  const outlineShow = r.bool('outline', 'show', true);
  const outlineColor = r.color('outline', 'lineColor', r.structural.second);
  const outlineW = r.num('outline', 'weight', 1);
  const valueFont = r.font('value', 'fontColor', r.structural.first, 10, { textClass: 'label' });
  const hAlign = r.str('value', 'horizontalAlignment', list ? 'left' : 'center');
  const accentShow = r.bool('accentBar', 'show', false);
  const accentColor = r.color('accentBar', 'color', r.dataColor(0));
  const accentW = r.num('accentBar', 'width', 4);
  const iconShow = r.bool('selectionIcon', 'show', list ?? false);
  const iconColor = r.color('selectionIcon', 'color', r.structural.first);
  const items = SLICER_ITEMS.slice(list ? 0 : 1, list ? 5 : 5);
  const rows = Math.ceil(items.length / cols);
  const cellW = (rect.width - gap * (cols - 1)) / cols;
  const cellH = Math.min((rect.height - gap * (rows - 1)) / rows, list ? valueFont.sizePx + 16 : 60);
  const nodes: ReactNode[] = [];
  if (bgShow) nodes.push(<rect key="bg" x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={bgColor} rx={radius} />);
  items.forEach((it, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = rect.x + col * (cellW + gap);
    const y = rect.y + row * (cellH + gap);
    const selected = i === 1;
    if (y + cellH > rect.y + rect.height + 1) return;
    if (style === 'Table' || list) {
      if (fillShow) nodes.push(<rect key={`f${i}`} x={x} y={y} width={cellW} height={cellH} fill={selected ? r.structural.third : fillColor} />);
      if (i < items.length - 1) nodes.push(<line key={`l${i}`} x1={x} x2={x + cellW} y1={y + cellH} y2={y + cellH} stroke={r.structural.third} />);
    } else {
      if (fillShow) nodes.push(<rect key={`f${i}`} x={x} y={y} width={cellW} height={cellH} rx={radius} fill={selected ? r.dataColor(0) : fillColor} stroke={outlineShow ? outlineColor : 'none'} strokeWidth={outlineShow ? outlineW : 0} />);
    }
    if (accentShow) nodes.push(<rect key={`a${i}`} x={x} y={y} width={accentW} height={cellH} fill={accentColor} />);
    let tx = hAlign === 'center' ? x + cellW / 2 : hAlign === 'right' ? x + cellW - 8 : x + 8 + (iconShow ? 20 : 0);
    if (iconShow) {
      const ix = x + 8;
      const iy = y + cellH / 2 - 6;
      nodes.push(<rect key={`i${i}`} x={ix} y={iy} width={12} height={12} rx={2} fill={selected ? iconColor : 'none'} stroke={iconColor} strokeWidth={1.2} />);
      if (selected) nodes.push(<path key={`ic${i}`} d={`M${ix + 2.5},${iy + 6} l2.5,2.5 l5,-5`} stroke={r.structural.background} strokeWidth={1.6} fill="none" />);
      if (hAlign === 'center') tx += 10;
    }
    const color = !list && style !== 'Table' && selected ? r.structural.background : valueFont.color;
    nodes.push(<text key={`t${i}`} x={tx} y={y + cellH / 2 + valueFont.sizePx * 0.35} textAnchor={hAlign === 'center' ? 'middle' : hAlign === 'right' ? 'end' : 'start'} {...textProps(valueFont)} fill={color}>{truncate(it, cellW - 16, valueFont.sizePx)}</text>);
  });
  return <g>{nodes}</g>;
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
