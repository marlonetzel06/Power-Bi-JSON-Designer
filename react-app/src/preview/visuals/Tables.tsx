import type { ReactNode } from 'react';
import { truncate } from '../fonts';
import { textProps } from '../resolver';
import { MATRIX_ROWS, TABLE_COLUMNS, TABLE_ROWS, TABLE_TOTAL } from '../sampleData';
import type { BodyProps } from '../types';

function cellFont(r: ReturnType<typeof import('../resolver').createResolver>, card: string, fallback: string, pt: number) {
  const f = r.font(card, 'fontColor', fallback, pt);
  return f;
}

export function Table({ r, rect, matrix }: BodyProps & { matrix?: boolean }) {
  const gridV = r.bool('grid', 'gridVertical', false);
  const gridVColor = r.color('grid', 'gridVerticalColor', r.structural.third);
  const gridVW = r.num('grid', 'gridVerticalWeight', 1);
  const gridH = r.bool('grid', 'gridHorizontal', true);
  const gridHColor = r.color('grid', 'gridHorizontalColor', r.structural.third);
  const gridHW = r.num('grid', 'gridHorizontalWeight', 1);
  const rowPadding = r.num('grid', 'rowPadding', 3);
  const outlineColor = r.color('grid', 'outlineColor', r.structural.third);
  const headerFont = cellFont(r, 'columnHeaders', r.structural.first, 10);
  const headerBg = r.color('columnHeaders', 'backColor', '');
  const headerAlign = r.str('columnHeaders', 'alignment', 'Auto');
  const headerOutline = r.num('columnHeaders', 'outlineStyle', 0);
  const valueFont = cellFont(r, 'values', r.structural.first, 10);
  const valueBg = r.color('values', 'backColor', '');
  const valueBgAlt = r.color('values', 'backColorSecondary', '');
  const valueBgPrimary = r.color('values', 'backColorPrimary', valueBg);
  const valueFontAlt = r.color('values', 'fontColorSecondary', valueFont.color);
  const rowHeaderFont = matrix ? cellFont(r, 'rowHeaders', r.structural.first, 10) : valueFont;
  const rowHeaderBg = matrix ? r.color('rowHeaders', 'backColor', '') : '';
  const stepped = matrix ? r.bool('rowHeaders', 'stepped', true) : false;
  const indent = matrix ? r.num('rowHeaders', 'steppedLayoutIndentation', 10) : 0;
  const expandIcons = matrix ? r.bool('rowHeaders', 'showExpandCollapseButtons', true) : false;
  const totalCard = matrix ? 'subTotals' : 'total';
  const totalShow = matrix ? r.bool('subTotals', 'rowSubtotals', true) : r.bool('total', 'totals', true);
  const totalFont = cellFont(r, totalCard, r.structural.first, 10);
  const totalBg = r.color(totalCard, 'backColor', '');
  const totalLabel = matrix ? r.str('subTotals', 'rowSubtotalsLabel', 'Gesamt') : r.str('total', 'label', 'Gesamt');
  const totalOutline = matrix ? 0 : r.num('total', 'outlineStyle', 0);
  const grandTotalShow = matrix ? true : false;
  const grandFont = matrix ? cellFont(r, 'rowTotal', r.structural.first, 10) : totalFont;
  const grandBg = matrix ? r.color('rowTotal', 'backColor', '') : totalBg;

  const headerH = headerFont.sizePx + rowPadding * 2 + 6;
  const rowH = valueFont.sizePx + rowPadding * 2 + 4;
  const cols = TABLE_COLUMNS;
  const colW = cols.map((_, i) => (i === 0 ? 0.34 : 0.22) * rect.width);
  const colX = colW.map((_, i) => rect.x + colW.slice(0, i).reduce((a, b) => a + b, 0));
  const alignOf = (ci: number, align: string) => (align === 'Left' ? 'start' : align === 'Right' ? 'end' : align === 'Center' ? 'middle' : ci === 0 ? 'start' : 'end');
  const textX = (ci: number, anchor: string) => (anchor === 'start' ? colX[ci]! + 6 : anchor === 'end' ? colX[ci]! + colW[ci]! - 6 : colX[ci]! + colW[ci]! / 2);

  const nodes: ReactNode[] = [];
  let y = rect.y;
  // header
  if (headerBg) nodes.push(<rect key="hb" x={rect.x} y={y} width={rect.width} height={headerH} fill={headerBg} />);
  cols.forEach((c, ci) => {
    const anchor = alignOf(ci, headerAlign);
    nodes.push(<text key={`h${ci}`} x={textX(ci, anchor)} y={y + headerH / 2 + headerFont.sizePx * 0.35} textAnchor={anchor} {...textProps(headerFont)}>{truncate(c, colW[ci]! - 12, headerFont.sizePx, headerFont.weight >= 600)}</text>);
  });
  if (headerOutline !== 0 || gridH) nodes.push(<line key="hl" x1={rect.x} x2={rect.x + rect.width} y1={y + headerH} y2={y + headerH} stroke={headerOutline !== 0 ? outlineColor : gridHColor} strokeWidth={headerOutline !== 0 ? r.num('columnHeaders', 'outlineWeight', 1) : gridHW} />);
  y += headerH;

  type Row = { cells: string[]; level: number; isSubtotal?: boolean };
  const rows: Row[] = matrix
    ? MATRIX_ROWS.flatMap((m, i, arr) => {
        const row: Row = { cells: [m.label, ...m.values], level: m.level };
        const next = arr[i + 1];
        if (m.level === 1 && (!next || next.level === 0) && totalShow) {
          const parent = [...arr.slice(0, i)].reverse().find((p) => p.level === 0)!;
          return [row, { cells: [totalLabel, ...parent.values], level: 1, isSubtotal: true }];
        }
        return [row];
      })
    : TABLE_ROWS.map((cells) => ({ cells, level: 0 }));

  rows.forEach((row, ri) => {
    if (y + rowH > rect.y + rect.height - (totalShow || grandTotalShow ? rowH : 0)) return;
    const alt = ri % 2 === 1;
    const bg = row.isSubtotal ? totalBg : alt && valueBgAlt ? valueBgAlt : valueBgPrimary;
    if (bg) nodes.push(<rect key={`rb${ri}`} x={rect.x} y={y} width={rect.width} height={rowH} fill={bg} />);
    if (matrix && rowHeaderBg && !row.isSubtotal) nodes.push(<rect key={`rhb${ri}`} x={rect.x} y={y} width={colW[0]} height={rowH} fill={rowHeaderBg} />);
    row.cells.forEach((cell, ci) => {
      const font = row.isSubtotal ? totalFont : ci === 0 ? rowHeaderFont : valueFont;
      const anchor = ci === 0 ? 'start' : 'end';
      let x = textX(ci, anchor);
      if (ci === 0 && matrix && stepped) x += row.level * indent + (expandIcons && row.level === 0 ? 14 : 0);
      if (ci === 0 && matrix && expandIcons && row.level === 0 && !row.isSubtotal) {
        nodes.push(<path key={`ex${ri}`} d={`M${colX[0]! + 8},${y + rowH / 2 - 3} l4,4 l4,-4`} stroke={r.color('rowHeaders', 'expandCollapseButtonsColor', font.color)} strokeWidth={1.4} fill="none" />);
      }
      const color = alt && !row.isSubtotal && ci > 0 ? valueFontAlt : font.color;
      nodes.push(<text key={`c${ri}-${ci}`} x={x} y={y + rowH / 2 + font.sizePx * 0.35} textAnchor={anchor} {...textProps(font)} fill={color}>{truncate(cell, colW[ci]! - 12 - (ci === 0 ? row.level * indent : 0), font.sizePx)}</text>);
    });
    if (gridH) nodes.push(<line key={`gh${ri}`} x1={rect.x} x2={rect.x + rect.width} y1={y + rowH} y2={y + rowH} stroke={gridHColor} strokeWidth={gridHW} />);
    y += rowH;
  });
  // total row
  if (totalShow || grandTotalShow) {
    const font = matrix ? grandFont : totalFont;
    const bg = matrix ? grandBg : totalBg;
    const cells = matrix ? ['Gesamt', ...TABLE_TOTAL.slice(1)] : [totalLabel, ...TABLE_TOTAL.slice(1)];
    if (bg) nodes.push(<rect key="tb" x={rect.x} y={y} width={rect.width} height={rowH} fill={bg} />);
    if (totalOutline !== 0) nodes.push(<line key="tl" x1={rect.x} x2={rect.x + rect.width} y1={y} y2={y} stroke={r.color('total', 'outlineColor', outlineColor)} strokeWidth={r.num('total', 'outlineWeight', 1)} />);
    cells.forEach((cell, ci) => {
      const anchor = ci === 0 ? 'start' : 'end';
      nodes.push(<text key={`t${ci}`} x={textX(ci, anchor)} y={y + rowH / 2 + font.sizePx * 0.35} textAnchor={anchor} {...textProps(font)}>{cell}</text>);
    });
    y += rowH;
  }
  if (gridV) colX.slice(1).forEach((x, i) => nodes.push(<line key={`gv${i}`} x1={x} x2={x} y1={rect.y} y2={y} stroke={gridVColor} strokeWidth={gridVW} />));
  nodes.unshift(<rect key="outline" x={rect.x} y={rect.y} width={rect.width} height={y - rect.y} fill="none" stroke={outlineColor} strokeWidth={r.num('grid', 'outlineWeight', 1)} opacity={r.num('grid', 'outlineStyle', 0) !== 0 ? 1 : 0} />);
  return <g>{nodes}</g>;
}
