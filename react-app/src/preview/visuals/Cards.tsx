import type { ReactNode } from 'react';
import { truncate } from '../fonts';
import { textProps, withAlpha } from '../resolver';
import { CATEGORIES, KPI_SPARK, TABLE_ROWS, formatNumber } from '../sampleData';
import type { BodyProps } from '../types';

/** Classic card: labels (value) + categoryLabels. */
export function ClassicCard({ r, rect }: BodyProps) {
  const valueFont = r.font('labels', 'color', r.structural.first, 32, { textClass: 'callout' });
  const catShow = r.bool('categoryLabels', 'show', true);
  const catFont = r.font('categoryLabels', 'color', r.structural.second, 12, { textClass: 'label' });
  const value = formatNumber(4736450, r.num('labels', 'labelDisplayUnits', 0), r.num('labels', 'labelPrecision', 0));
  const size = Math.min(valueFont.sizePx, rect.width / (value.length * 0.6), rect.height * 0.55);
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  return (
    <g>
      <text x={cx} y={cy + size * 0.35 - (catShow ? catFont.sizePx * 0.6 : 0)} textAnchor="middle" {...textProps(valueFont)} fontSize={size}>{value}</text>
      {catShow && <text x={cx} y={cy + size * 0.35 + catFont.sizePx + 2} textAnchor="middle" {...textProps(catFont)}>Umsatz gesamt</text>}
    </g>
  );
}

/** New card visual: value + label + accent bar + layout background. */
export function NewCard({ r, rect }: BodyProps) {
  const style = r.str('layout', 'style', 'Cards');
  const bgShow = r.bool('layout', 'backgroundShow', true);
  const bgColor = withAlpha(r.color('layout', 'backgroundFillColor', r.structural.background), r.num('layout', 'backgroundTransparency', 0));
  const radius = r.num('layout', 'rectangleRoundedCurve', 8);
  const borderW = r.num('layout', 'borderWidth', 0);
  const borderColor = r.color('layout', 'borderColor', r.structural.third);
  const fillShow = r.bool('fillCustom', 'show', true);
  const fillColor = withAlpha(r.color('fillCustom', 'fillColor', r.structural.background), r.num('fillCustom', 'transparency', 0));
  const outlineShow = r.bool('outline', 'show', false);
  const outlineColor = r.color('outline', 'lineColor', r.structural.third);
  const outlineW = r.num('outline', 'weight', 1);
  const valueShow = r.bool('value', 'show', true);
  const valueFont = r.font('value', 'fontColor', r.structural.first, 32, { textClass: 'callout' });
  const valueAlign = r.str('value', 'horizontalAlignment', 'left');
  const labelShow = r.bool('label', 'show', true);
  const labelFont = r.font('label', 'fontColor', r.structural.second, 12, { textClass: 'label' });
  const labelPos = r.str('label', 'position', 'belowValue');
  const accentShow = r.bool('accentBar', 'show', false);
  const accentColor = withAlpha(r.color('accentBar', 'color', r.dataColor(0)), r.num('accentBar', 'transparency', 0));
  const accentW = r.num('accentBar', 'width', 4);
  const accentPos = r.str('accentBar', 'position', 'Left');
  const refValueShow = r.bool('referenceLabelValue', 'show', true);
  const refValueFont = r.font('referenceLabelValue', 'valueFontColor', r.structural.first, 12, 'value');
  const refTitleFont = r.font('referenceLabelTitle', 'titleFontColor', r.structural.second, 10, 'title');
  const cols = style === 'Table' ? 1 : 2;
  const gap = r.num('layout', 'cellPadding', 8);
  const tiles = [
    { label: 'Umsatz', value: '4,74 Mio.' },
    { label: 'Plan', value: '4,67 Mio.' },
  ].slice(0, cols);
  const tileW = (rect.width - gap * (cols - 1)) / cols;
  const nodes: ReactNode[] = [];
  tiles.forEach((t, i) => {
    const x = rect.x + i * (tileW + gap);
    const y = rect.y;
    const h = rect.height;
    if (bgShow) nodes.push(<rect key={`bg${i}`} x={x} y={y} width={tileW} height={h} rx={radius} fill={bgColor} stroke={borderW > 0 ? borderColor : 'none'} strokeWidth={borderW} />);
    if (fillShow) nodes.push(<rect key={`f${i}`} x={x + 1} y={y + 1} width={tileW - 2} height={h - 2} rx={Math.max(0, radius - 1)} fill={fillColor} stroke={outlineShow ? outlineColor : 'none'} strokeWidth={outlineShow ? outlineW : 0} />);
    if (accentShow) {
      const horizontal = accentPos === 'Top' || accentPos === 'Bottom';
      nodes.push(
        <rect
          key={`ac${i}`}
          x={accentPos === 'Right' ? x + tileW - accentW : x}
          y={accentPos === 'Bottom' ? y + h - accentW : y}
          width={horizontal ? tileW : accentW}
          height={horizontal ? accentW : h}
          fill={accentColor}
          rx={1}
        />,
      );
    }
    const pad = 12 + (accentShow && accentPos === 'Left' ? accentW : 0);
    const ax = valueAlign === 'center' ? x + tileW / 2 : valueAlign === 'right' ? x + tileW - 12 : x + pad;
    const anchor = valueAlign === 'center' ? 'middle' : valueAlign === 'right' ? 'end' : 'start';
    const vSize = Math.min(valueFont.sizePx, tileW / 5, h * 0.4);
    let cy = y + h / 2 + vSize * 0.35;
    if (labelShow && labelPos === 'aboveValue') {
      nodes.push(<text key={`l${i}`} x={ax} y={y + h / 2 - vSize * 0.5 - 4} textAnchor={anchor} {...textProps(labelFont)}>{t.label}</text>);
      cy += labelFont.sizePx * 0.4;
    }
    if (valueShow) nodes.push(<text key={`v${i}`} x={ax} y={cy} textAnchor={anchor} {...textProps(valueFont)} fontSize={vSize}>{t.value}</text>);
    if (labelShow && labelPos !== 'aboveValue') nodes.push(<text key={`l${i}`} x={ax} y={cy + labelFont.sizePx + 4} textAnchor={anchor} {...textProps(labelFont)}>{t.label}</text>);
    if (refValueShow && h > 150) {
      nodes.push(<text key={`rt${i}`} x={ax} y={y + h - 8 - refValueFont.sizePx - 2} textAnchor={anchor} {...textProps(refTitleFont)}>Vorjahr</text>);
      nodes.push(<text key={`rv${i}`} x={ax} y={y + h - 8} textAnchor={anchor} {...textProps(refValueFont)}>4,21 Mio.</text>);
    }
  });
  return <g>{nodes}</g>;
}

export function MultiRowCard({ r, rect }: BodyProps) {
  const barShow = r.bool('card', 'barShow', true);
  const barColor = r.color('card', 'barColor', r.dataColor(0));
  const barW = r.num('card', 'barWeight', 4);
  const cardBg = r.color('card', 'cardBackground', '');
  const padding = r.num('card', 'cardPadding', 8);
  const outlineColor = r.color('card', 'outlineColor', r.structural.third);
  const outlineW = r.num('card', 'outlineWeight', 1);
  const outlineStyle = r.num('card', 'outlineStyle', 0);
  const titleFont = r.font('cardTitle', 'color', r.structural.second, 12, { textClass: 'label' });
  const catShow = r.bool('categoryLabels', 'show', true);
  const catFont = r.font('categoryLabels', 'color', r.structural.fourth, 10, { textClass: 'label' });
  const dataFont = r.font('dataLabels', 'color', r.structural.first, 14, { textClass: 'callout' });
  const rows = TABLE_ROWS.slice(0, 3);
  const rowH = Math.min(rect.height / rows.length, titleFont.sizePx + dataFont.sizePx + catFont.sizePx + padding * 2 + 10);
  const nodes: ReactNode[] = [];
  rows.forEach((row, i) => {
    const y = rect.y + i * rowH;
    if (cardBg) nodes.push(<rect key={`bg${i}`} x={rect.x} y={y} width={rect.width} height={rowH - 2} fill={cardBg} />);
    if (outlineStyle !== 0) nodes.push(<rect key={`o${i}`} x={rect.x} y={y} width={rect.width} height={rowH - 2} fill="none" stroke={outlineColor} strokeWidth={outlineW} />);
    if (barShow) nodes.push(<rect key={`b${i}`} x={rect.x} y={y + 2} width={barW} height={rowH - 6} fill={barColor} />);
    const x = rect.x + (barShow ? barW : 0) + padding;
    nodes.push(<text key={`t${i}`} x={x} y={y + padding + titleFont.sizePx} {...textProps(titleFont)}>{truncate(row[0] ?? '', rect.width - x, titleFont.sizePx)}</text>);
    const cols = [1, 2].map((ci) => ({ label: ['Umsatz', 'Plan'][ci - 1]!, value: row[ci] ?? '' }));
    const colW = (rect.width - (x - rect.x)) / cols.length;
    cols.forEach((c, ci) => {
      const cx = x + ci * colW;
      let yy = y + padding + titleFont.sizePx + 4;
      if (catShow) {
        yy += catFont.sizePx;
        nodes.push(<text key={`c${i}-${ci}`} x={cx} y={yy} {...textProps(catFont)}>{c.label}</text>);
      }
      yy += dataFont.sizePx + 2;
      if (yy < y + rowH) nodes.push(<text key={`d${i}-${ci}`} x={cx} y={yy} {...textProps(dataFont)}>{c.value}</text>);
    });
    if (i < rows.length - 1 && outlineStyle === 0) nodes.push(<line key={`sep${i}`} x1={rect.x} x2={rect.x + rect.width} y1={y + rowH - 1} y2={y + rowH - 1} stroke={outlineColor} strokeWidth={outlineW} />);
  });
  return <g>{nodes}</g>;
}

export function Kpi({ r, rect }: BodyProps) {
  const indFont = r.font('indicator', 'fontColor', r.structural.first, 32, { textClass: 'callout' });
  const hAlign = r.str('indicator', 'horizontalAlignment', 'left');
  const showIcon = r.bool('indicator', 'showIcon', true);
  const trendShow = r.bool('trendline', 'show', true);
  const trendTransparency = r.num('trendline', 'transparency', 20);
  const goalShow = r.bool('goals', 'showGoal', true);
  const distShow = r.bool('goals', 'showDistance', true);
  // kpi.goals: one fontSize/bold/italic/underline for both labels, separate colour + family per label
  const goalFont = r.font('goals', 'goalFontColor', r.structural.second, 9, { props: { family: 'goalFontFamily' }, textClass: 'label' });
  const distFont = r.font('goals', 'distanceFontColor', r.structural.second, 9, { props: { family: 'distanceFontFamily' }, textClass: 'label' });
  const goalText = r.str('goals', 'goalText', 'Ziel');
  const good = r.color('status', 'goodColor', r.structural.good);
  const value = '4,74 Mio.';
  const x = hAlign === 'center' ? rect.x + rect.width / 2 : hAlign === 'right' ? rect.x + rect.width - 8 : rect.x + 8;
  const anchor = hAlign === 'center' ? 'middle' : hAlign === 'right' ? 'end' : 'start';
  const size = Math.min(indFont.sizePx, rect.width / 7, rect.height * 0.4);
  const nodes: ReactNode[] = [];
  if (trendShow) {
    const max = Math.max(...KPI_SPARK);
    const pts = KPI_SPARK.map((v, i) => [rect.x + (i / (KPI_SPARK.length - 1)) * rect.width, rect.y + rect.height - (v / max) * rect.height * 0.7] as const);
    const d = `M${pts.map(([px, py]) => `${px},${py}`).join(' L')} L${rect.x + rect.width},${rect.y + rect.height} L${rect.x},${rect.y + rect.height} Z`;
    nodes.push(<path key="trend" d={d} fill={withAlpha(good, 100 - (100 - trendTransparency) * 0.35)} />);
  }
  const cy = rect.y + rect.height * 0.45;
  nodes.push(<text key="v" x={x + (showIcon && anchor === 'start' ? size * 0.9 : 0)} y={cy} textAnchor={anchor} {...textProps(indFont)} fontSize={size}>{value}</text>);
  if (showIcon) {
    const ix = anchor === 'start' ? x + size * 0.3 : anchor === 'end' ? x - size * 3.6 : x - size * 2.4;
    nodes.push(<polygon key="icon" points={`${ix},${cy - size * 0.1} ${ix + size * 0.5},${cy - size * 0.1} ${ix + size * 0.25},${cy - size * 0.55}`} fill={good} />);
  }
  let gy = cy + goalFont.sizePx + 10;
  if (goalShow) {
    nodes.push(<text key="g" x={x} y={gy} textAnchor={anchor} {...textProps(goalFont)}>{`${goalText}: 4,50 Mio.`}</text>);
    gy += distFont.sizePx + 4;
  }
  if (distShow) nodes.push(<text key="d" x={x} y={gy} textAnchor={anchor} {...textProps(distFont)}>{'+5,3 %'}</text>);
  void CATEGORIES;
  return <g>{nodes}</g>;
}
