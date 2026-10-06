import type { ReactNode } from 'react';
import { dashArray } from '../cartesian/axis';
import { truncate } from '../fonts';
import { textProps, withAlpha, type FontStyle, type Resolver } from '../resolver';
import { MATRIX_ROWS, TABLE_COLUMNS, TABLE_ROWS, TABLE_TOTAL } from '../sampleData';
import { marker } from '../shared/markers';
import type { BodyProps } from '../types';

const SPARK = [[3, 5, 4, 6, 7], [5, 4, 6, 3, 4], [2, 4, 5, 6, 8], [6, 5, 4, 4, 3], [3, 3, 5, 6, 6]];

/** Font of a table card with the grid text size as the shared default size. */
function cellFont(r: Resolver, card: string, fallback: string, pt: number, textClass: 'label' | 'header' | 'callout' = 'label'): FontStyle {
  return r.font(card, 'fontColor', fallback, pt, { textClass });
}

/** Outline (per card): 0/none = no line; otherwise a line around the row block. */
function outlineOn(v: string | number | boolean | undefined): boolean {
  return v !== undefined && v !== 0 && v !== '0' && v !== 'None' && v !== false && v !== '';
}

export function Table({ r, rect, matrix }: BodyProps & { matrix?: boolean }) {
  const gridV = r.bool('grid', 'gridVertical', false);
  const gridVColor = r.color('grid', 'gridVerticalColor', r.structural.third);
  const gridVW = r.num('grid', 'gridVerticalWeight', 1);
  const gridH = r.bool('grid', 'gridHorizontal', true);
  const gridHColor = r.color('grid', 'gridHorizontalColor', r.structural.third);
  const gridHW = r.num('grid', 'gridHorizontalWeight', 1);
  const rowPadding = r.num('grid', 'rowPadding', 3);
  const gridText = r.num('grid', 'textSize', 10);
  const outlineColor = r.color('grid', 'outlineColor', r.structural.third);
  const outlineW = r.num('grid', 'outlineWeight', 1);
  const gridOutline = outlineOn(r.raw('grid', 'outlineStyle'));

  const headerFont = cellFont(r, 'columnHeaders', r.structural.first, gridText, 'header');
  const headerBg = r.color('columnHeaders', 'backColor', '');
  const headerAlign = r.str('columnHeaders', 'alignment', 'Auto');
  const headerOutline = outlineOn(r.raw('columnHeaders', 'outlineStyle'));
  const headerOutlineColor = r.color('columnHeaders', 'outlineColor', outlineColor);
  const headerOutlineW = r.num('columnHeaders', 'outlineWeight', 1);
  const headerWrap = r.bool('columnHeaders', 'wordWrap', true);

  const valueFont = cellFont(r, 'values', r.structural.first, gridText);
  const valueBg = r.color('values', 'backColor', '');
  const valueBgPrimary = r.color('values', 'backColorPrimary', valueBg);
  const valueBgAlt = r.color('values', 'backColorSecondary', '');
  const valueFontPrimary = r.color('values', 'fontColorPrimary', valueFont.color);
  const valueFontAlt = r.color('values', 'fontColorSecondary', valueFontPrimary);
  const valueOutline = outlineOn(r.raw('values', 'outlineStyle'));
  const valueOutlineColor = r.color('values', 'outlineColor', outlineColor);
  const valueOutlineW = r.num('values', 'outlineWeight', 1);

  const rowHeaderFont = matrix ? cellFont(r, 'rowHeaders', r.structural.first, gridText) : valueFont;
  const rowHeaderBg = matrix ? r.color('rowHeaders', 'backColor', '') : '';
  const rowHeaderAlign = matrix ? r.str('rowHeaders', 'alignment', 'Auto') : 'Left';
  const rowHeaderOutline = matrix && outlineOn(r.raw('rowHeaders', 'outlineStyle'));
  const rowHeaderOutlineColor = matrix ? r.color('rowHeaders', 'outlineColor', outlineColor) : outlineColor;
  const stepped = matrix ? r.bool('rowHeaders', 'stepped', true) : false;
  const indent = matrix ? r.num('rowHeaders', 'steppedLayoutIndentation', 10) : 0;
  const expandIcons = matrix ? r.bool('rowHeaders', 'showExpandCollapseButtons', true) : false;
  const expandColor = matrix ? r.color('rowHeaders', 'expandCollapseButtonsColor', rowHeaderFont.color) : rowHeaderFont.color;
  const expandSize = matrix ? r.num('rowHeaders', 'expandCollapseButtonsSize', 10) : 10;
  const bandedRowHeaders = matrix && r.bool('values', 'bandedRowHeaders', true);

  const totalCard = matrix ? 'subTotals' : 'total';
  const totalShow = matrix ? r.bool('subTotals', 'rowSubtotals', true) : r.bool('total', 'totals', true);
  const totalFont = cellFont(r, totalCard, r.structural.first, gridText);
  const totalBg = r.color(totalCard, 'backColor', '');
  const totalLabel = matrix ? r.str('subTotals', 'rowSubtotalsLabel', 'Gesamt') : r.str('total', 'label', 'Gesamt');
  const subtotalTop = matrix && r.str('subTotals', 'rowSubtotalsPosition', 'Bottom') === 'Top';
  const subtotalToHeaders = matrix && r.bool('subTotals', 'applyToHeaders', false);
  const totalOutline = matrix ? false : outlineOn(r.raw('total', 'outlineStyle'));
  const grandFont = matrix ? cellFont(r, 'rowTotal', r.structural.first, gridText) : totalFont;
  const grandBg = matrix ? r.color('rowTotal', 'backColor', '') : totalBg;
  const colTotalShow = matrix && r.bool('subTotals', 'columnSubtotals', true);
  const colTotalFont = matrix ? cellFont(r, 'columnTotal', r.structural.first, gridText) : valueFont;
  const colTotalBg = matrix ? r.color('columnTotal', 'backColor', '') : '';

  const blankRows = matrix && r.bool('blankRows', 'showBlankRows', false);
  const blankRowColor = blankRows ? withAlpha(r.color('blankRows', 'blankRowColor', r.structural.background), r.num('blankRows', 'blankRowTransparency', 0)) : 'none';
  const blankBorder = blankRows && r.bool('blankRows', 'showBorder', false);
  const blankBorderColor = blankBorder ? withAlpha(r.color('blankRows', 'borderColor', r.structural.third), r.num('blankRows', 'borderTransparency', 0)) : 'none';
  const blankBorderW = blankBorder ? r.num('blankRows', 'borderWidth', 1) : 1;
  const blankBorderPos = blankBorder ? r.str('blankRows', 'borderPosition', 'Top') : 'Top';

  const sparkOn = r.hasCard('sparklines') && r.has('sparklines', 'dataColor');
  const sparkType = sparkOn ? r.str('sparklines', 'chartType', 'line') : 'line';
  const sparkColor = sparkOn ? r.color('sparklines', 'dataColor', r.dataColor(0)) : r.dataColor(0);
  const sparkWidth = sparkOn ? r.num('sparklines', 'strokeWidth', 1) : 1;
  const sparkMarkers = sparkOn && r.bool('sparklines', 'markers', false);
  const sparkMarkerColor = sparkOn ? r.color('sparklines', 'markerColor', sparkColor) : sparkColor;
  const sparkMarkerShape = sparkOn ? r.str('sparklines', 'markerShape', 'circle') : 'circle';
  const sparkMarkerSize = sparkOn ? r.num('sparklines', 'markerSize', 2) : 2;

  const headerH = headerFont.sizePx + rowPadding * 2 + 6;
  const rowH = valueFont.sizePx + rowPadding * 2 + 4;
  const cols = [...TABLE_COLUMNS, ...(sparkOn ? ['Trend'] : [])];
  const widthShares = sparkOn ? [0.3, 0.19, 0.19, 0.14, 0.18] : [0.34, 0.22, 0.22, 0.22];
  const extraCol = colTotalShow && matrix;
  const shares = extraCol ? [...widthShares.map((s) => s * 0.84), 0.16] : widthShares;
  if (extraCol) cols.push('Gesamt');
  const colW = shares.map((s) => s * rect.width);
  const colX = colW.map((_, i) => rect.x + colW.slice(0, i).reduce((a, b) => a + b, 0));
  const alignOf = (ci: number, align: string) => (align === 'Left' ? 'start' : align === 'Right' ? 'end' : align === 'Center' ? 'middle' : ci === 0 ? 'start' : 'end');
  const textX = (ci: number, anchor: string) => (anchor === 'start' ? colX[ci]! + 6 : anchor === 'end' ? colX[ci]! + colW[ci]! - 6 : colX[ci]! + colW[ci]! / 2);

  const nodes: ReactNode[] = [];
  let y = rect.y;
  // header
  if (headerBg) nodes.push(<rect key="hb" data-part="header-bg" x={rect.x} y={y} width={rect.width} height={headerH} fill={headerBg} />);
  cols.forEach((c, ci) => {
    const anchor = alignOf(ci, headerAlign);
    const font = extraCol && ci === cols.length - 1 && subtotalToHeaders ? colTotalFont : headerFont;
    nodes.push(<text key={`h${ci}`} data-part="column-header" x={textX(ci, anchor)} y={y + headerH / 2 + headerFont.sizePx * 0.35} textAnchor={anchor} {...textProps(font)}>{headerWrap ? truncate(c, colW[ci]! - 12, headerFont.sizePx, headerFont.weight >= 600) : c}</text>);
  });
  if (headerOutline) nodes.push(<rect key="ho" data-part="header-outline" x={rect.x} y={y} width={rect.width} height={headerH} fill="none" stroke={headerOutlineColor} strokeWidth={headerOutlineW} />);
  else if (gridH) nodes.push(<line key="hl" x1={rect.x} x2={rect.x + rect.width} y1={y + headerH} y2={y + headerH} stroke={gridHColor} strokeWidth={gridHW} />);
  y += headerH;

  type Row = { cells: string[]; level: number; isSubtotal?: boolean; blank?: boolean; valueIdx: number };
  const rows: Row[] = matrix
    ? MATRIX_ROWS.flatMap((m, i, arr) => {
        const row: Row = { cells: [m.label, ...m.values], level: m.level, valueIdx: i };
        const out: Row[] = [];
        if (m.level === 0 && i > 0 && blankRows) out.push({ cells: [], level: 0, blank: true, valueIdx: -1 });
        if (m.level === 0 && subtotalTop && totalShow) out.push(row, { cells: [totalLabel, ...m.values], level: 1, isSubtotal: true, valueIdx: -1 });
        else out.push(row);
        const next = arr[i + 1];
        if (!subtotalTop && m.level === 1 && (!next || next.level === 0) && totalShow) {
          const parent = [...arr.slice(0, i)].reverse().find((p) => p.level === 0)!;
          out.push({ cells: [totalLabel, ...parent.values], level: 1, isSubtotal: true, valueIdx: -1 });
        }
        return out;
      })
    : TABLE_ROWS.map((cells, i) => ({ cells, level: 0, valueIdx: i }));

  const rowBlocks: { y0: number; y1: number }[] = [];
  let dataRowIndex = 0;
  rows.forEach((row, ri) => {
    const h = row.blank ? Math.max(4, rowH * 0.5) : rowH;
    if (y + h > rect.y + rect.height - (totalShow || matrix ? rowH : 0)) return;
    if (row.blank) {
      nodes.push(<rect key={`blank${ri}`} data-part="blank-row" x={rect.x} y={y} width={rect.width} height={h} fill={blankRowColor} />);
      if (blankBorder && blankBorderPos !== 'Bottom') nodes.push(<line key={`bbt${ri}`} x1={rect.x} x2={rect.x + rect.width} y1={y} y2={y} stroke={blankBorderColor} strokeWidth={blankBorderW} />);
      if (blankBorder && blankBorderPos !== 'Top') nodes.push(<line key={`bbb${ri}`} x1={rect.x} x2={rect.x + rect.width} y1={y + h} y2={y + h} stroke={blankBorderColor} strokeWidth={blankBorderW} />);
      y += h;
      return;
    }
    const alt = dataRowIndex % 2 === 1;
    if (!row.isSubtotal) dataRowIndex++;
    const bg = row.isSubtotal ? totalBg : alt && valueBgAlt ? valueBgAlt : valueBgPrimary;
    if (bg) nodes.push(<rect key={`rb${ri}`} data-part="row-bg" x={rect.x} y={y} width={rect.width} height={h} fill={bg} />);
    if (matrix && !row.isSubtotal) {
      const rhBg = bandedRowHeaders && alt && valueBgAlt ? valueBgAlt : rowHeaderBg;
      if (rhBg) nodes.push(<rect key={`rhb${ri}`} x={rect.x} y={y} width={colW[0]} height={h} fill={rhBg} />);
    }
    const cells = sparkOn && !row.isSubtotal ? [...row.cells, '__spark__'] : sparkOn ? [...row.cells, ''] : [...row.cells];
    if (extraCol) cells.push(row.cells[1] ?? '');
    cells.forEach((cell, ci) => {
      const isTotalCol = extraCol && ci === cells.length - 1;
      const font = row.isSubtotal ? totalFont : isTotalCol ? colTotalFont : ci === 0 ? rowHeaderFont : valueFont;
      if (isTotalCol && colTotalBg && !row.isSubtotal) nodes.push(<rect key={`ctb${ri}`} x={colX[ci]} y={y} width={colW[ci]} height={h} fill={colTotalBg} />);
      if (cell === '__spark__') {
        const data = SPARK[row.valueIdx % SPARK.length]!;
        const sx = colX[ci]! + 6;
        const sw = colW[ci]! - 12;
        const max = Math.max(...data);
        const pts = data.map((v, i) => [sx + (i / (data.length - 1)) * sw, y + h - 4 - (v / max) * (h - 8)] as const);
        if (sparkType === 'column') {
          const bw = sw / data.length - 2;
          data.forEach((v, i) => nodes.push(<rect key={`sp${ri}-${i}`} data-part="sparkline" x={sx + i * (sw / data.length)} y={y + h - 4 - (v / max) * (h - 8)} width={bw} height={(v / max) * (h - 8)} fill={sparkColor} />));
        } else {
          nodes.push(<path key={`sp${ri}`} data-part="sparkline" d={pts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px},${py}`).join(' ')} fill="none" stroke={sparkColor} strokeWidth={sparkWidth} strokeLinejoin="round" />);
          if (sparkMarkers) pts.forEach(([px, py], i) => nodes.push(marker(sparkMarkerShape, px, py, sparkMarkerSize * 2, { fill: sparkMarkerColor }, `spm${ri}-${i}`)));
        }
        return;
      }
      const anchor = ci === 0 ? alignOf(0, rowHeaderAlign) : 'end';
      let x = textX(ci, anchor);
      if (ci === 0 && matrix && stepped) x += row.level * indent + (expandIcons && row.level === 0 ? expandSize + 4 : 0);
      if (ci === 0 && matrix && expandIcons && row.level === 0 && !row.isSubtotal) {
        const s = expandSize / 2;
        nodes.push(<path key={`ex${ri}`} data-part="expand-icon" d={`M${colX[0]! + 8},${y + h / 2 - s * 0.6} l${s},${s} l${s},${-s}`} stroke={expandColor} strokeWidth={1.4} fill="none" />);
      }
      const color = row.isSubtotal || isTotalCol ? font.color : ci === 0 && matrix ? font.color : alt ? valueFontAlt : ci === 0 ? font.color : valueFontPrimary;
      nodes.push(<text key={`c${ri}-${ci}`} data-part={ci === 0 ? 'row-header' : 'value'} x={x} y={y + h / 2 + font.sizePx * 0.35} textAnchor={anchor} {...textProps(font)} fill={color}>{truncate(cell, colW[ci]! - 12 - (ci === 0 ? row.level * indent : 0), font.sizePx)}</text>);
    });
    if (gridH) nodes.push(<line key={`gh${ri}`} x1={rect.x} x2={rect.x + rect.width} y1={y + h} y2={y + h} stroke={gridHColor} strokeWidth={gridHW} />);
    rowBlocks.push({ y0: y, y1: y + h });
    y += h;
  });
  if (valueOutline && rowBlocks.length) nodes.push(<rect key="vo" data-part="values-outline" x={matrix ? colX[1]! : rect.x} y={rowBlocks[0]!.y0} width={matrix ? rect.x + rect.width - colX[1]! : rect.width} height={rowBlocks[rowBlocks.length - 1]!.y1 - rowBlocks[0]!.y0} fill="none" stroke={valueOutlineColor} strokeWidth={valueOutlineW} />);
  if (rowHeaderOutline && rowBlocks.length) nodes.push(<rect key="rho" data-part="row-headers-outline" x={rect.x} y={rowBlocks[0]!.y0} width={colW[0]} height={rowBlocks[rowBlocks.length - 1]!.y1 - rowBlocks[0]!.y0} fill="none" stroke={rowHeaderOutlineColor} strokeWidth={r.num('rowHeaders', 'outlineWeight', 1)} />);
  // total row
  if (totalShow || matrix) {
    const font = matrix ? grandFont : totalFont;
    const bg = matrix ? grandBg : totalBg;
    const cells = matrix ? ['Gesamt', ...TABLE_TOTAL.slice(1)] : [totalLabel, ...TABLE_TOTAL.slice(1)];
    if (sparkOn) cells.push('');
    if (extraCol) cells.push(TABLE_TOTAL[1]!);
    if (bg) nodes.push(<rect key="tb" data-part="total-bg" x={rect.x} y={y} width={rect.width} height={rowH} fill={bg} />);
    if (totalOutline) nodes.push(<rect key="tl" x={rect.x} y={y} width={rect.width} height={rowH} fill="none" stroke={r.color('total', 'outlineColor', outlineColor)} strokeWidth={r.num('total', 'outlineWeight', 1)} />);
    cells.forEach((cell, ci) => {
      const anchor = ci === 0 ? 'start' : 'end';
      nodes.push(<text key={`t${ci}`} data-part="total" x={textX(ci, anchor)} y={y + rowH / 2 + font.sizePx * 0.35} textAnchor={anchor} {...textProps(font)}>{cell}</text>);
    });
    y += rowH;
  }
  if (gridV) colX.slice(1).forEach((x, i) => nodes.push(<line key={`gv${i}`} x1={x} x2={x} y1={rect.y} y2={y} stroke={gridVColor} strokeWidth={gridVW} />));
  if (gridOutline) nodes.unshift(<rect key="outline" data-part="grid-outline" x={rect.x} y={rect.y} width={rect.width} height={y - rect.y} fill="none" stroke={outlineColor} strokeWidth={outlineW} strokeDasharray={dashArray('solid', outlineW)} />);
  return <g>{nodes}</g>;
}
