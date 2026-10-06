import type { ReactNode } from 'react';
import { dashArray } from '../cartesian/axis';
import { truncate } from '../fonts';
import { textProps, withAlpha, type FontStyle } from '../resolver';
import { KPI_SPARK, TABLE_ROWS, formatWithUnit, precisionOf, resolveUnit } from '../sampleData';
import { cornerRadii, customEffects } from '../shared/cardStyle';
import { tilePath } from '../shared/shapes';
import type { BodyProps, Rect } from '../types';

const SAMPLE_VALUE = 4_736_450;
const SAMPLE_PLAN = 4_670_000;
const SAMPLE_PREV = 4_210_000;

/** Classic card: labels (value) + categoryLabels. */
export function ClassicCard({ r, rect }: BodyProps) {
  const valueFont = r.font('labels', 'color', r.structural.first, 32, { textClass: 'callout' });
  const catShow = r.bool('categoryLabels', 'show', true);
  const catFont = r.font('categoryLabels', 'color', r.structural.second, 12, { textClass: 'label' });
  const wrap = r.hasCard('wordWrap') && r.bool('wordWrap', 'show', true);
  const value = formatWithUnit(SAMPLE_VALUE, resolveUnit(r.num('labels', 'labelDisplayUnits', 0), [SAMPLE_VALUE]), precisionOf(r, 'labels', 'labelPrecision'));
  const size = Math.min(valueFont.sizePx, rect.width / (value.length * 0.6), rect.height * 0.55);
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const category = wrap ? 'Umsatz gesamt' : truncate('Umsatz gesamt', rect.width - 8, catFont.sizePx);
  return (
    <g>
      <text data-part="callout-value" x={cx} y={cy + size * 0.35 - (catShow ? catFont.sizePx * 0.6 : 0)} textAnchor="middle" {...textProps(valueFont)} fontSize={size}>{value}</text>
      {catShow && <text data-part="category-label" x={cx} y={cy + size * 0.35 + catFont.sizePx + 2} textAnchor="middle" {...textProps(catFont)}>{category}</text>}
    </g>
  );
}

/** New card visual: value + label + accent bar + reference labels + layout (cards or table). */
export function NewCard({ r, rect, uid }: BodyProps) {
  const style = r.str('layout', 'style', 'Cards');
  const bgShow = r.bool('layout', 'backgroundShow', true);
  const bgColor = withAlpha(r.color('layout', 'backgroundFillColor', r.structural.background), r.num('layout', 'backgroundTransparency', 0));
  const borderW = r.num('layout', 'borderWidth', 0);
  const borderColor = withAlpha(r.color('layout', 'borderColor', r.structural.third), r.num('layout', 'borderTransparency', 0));
  const borderDash = dashArray(r.str('layout', 'borderStyle', 'solid'), Math.max(1, borderW));
  const corners = cornerRadii(r, 'layout', 8);
  const outer = { top: r.num('layout', 'topOuterMargin', 0), bottom: r.num('layout', 'bottomOuterMargin', 0), left: r.num('layout', 'leftOuterMargin', 0), right: r.num('layout', 'rightOuterMargin', 0) };
  const customPad = r.bool('layout', 'customizePadding', false);
  const cellPad = r.num('layout', 'cellPadding', 8);
  const rowPad = customPad ? r.num('layout', 'rowPadding', cellPad) : cellPad;
  const colPad = customPad ? r.num('layout', 'columnPadding', cellPad) : cellPad;
  const customLines = r.bool('layout', 'customizeLines', false);
  const lineColor = withAlpha(r.color('layout', 'lineColor', r.structural.third), r.num('layout', 'lineTransparency', 0));
  const lineW = r.num('layout', 'lineWidth', 1);
  const lineDash = dashArray(r.str('layout', 'lineStyle', 'solid'), lineW);
  const tileShape = r.str('shapeCustomRectangle', 'tileShape', 'rectangleRounded');
  const tileCorners = r.has('shapeCustomRectangle', 'rectangleRoundedCurve') || r.has('shapeCustomRectangle', 'rectangleRoundedCurveCustomStyle') ? cornerRadii(r, 'shapeCustomRectangle', corners.radius) : corners;
  const fillShow = r.bool('fillCustom', 'show', true);
  const fillColor = withAlpha(r.color('fillCustom', 'fillColor', r.structural.background), r.num('fillCustom', 'transparency', 0));
  const outlineShow = r.bool('outline', 'show', false);
  const outlineColor = withAlpha(r.color('outline', 'lineColor', r.structural.third), r.num('outline', 'transparency', 0));
  const outlineW = r.num('outline', 'weight', 1);
  const gridShow = r.hasCard('grid') && r.bool('grid', 'show', false);
  const gridColor = gridShow ? withAlpha(r.color('grid', 'color', r.structural.third), r.num('grid', 'transparency', 0)) : 'none';
  const gridW = gridShow ? r.num('grid', 'width', 1) : 1;
  const gridDash = gridShow ? dashArray(r.str('grid', 'style', 'solid'), gridW) : undefined;

  const valueShow = r.bool('value', 'show', true);
  const valueFont = r.font('value', 'fontColor', r.structural.first, 32, { textClass: 'callout' });
  const valueAlign = r.str('value', 'horizontalAlignment', 'left');
  const valueOpacity = 1 - r.num('value', 'transparency', 0) / 100;
  const valueUnits = r.num('value', 'labelDisplayUnits', 0);
  const valuePrecision = precisionOf(r, 'value', 'labelPrecision');
  const labelShow = r.bool('label', 'show', true);
  const labelFont = r.font('label', 'fontColor', r.structural.second, 12, { textClass: 'label' });
  const labelText = r.str('label', 'text', '');
  const labelPos = r.str('label', 'position', 'belowValue');
  const labelAlignOwn = r.str('label', 'horizontalAlignment', valueAlign);
  const labelAlign = r.bool('label', 'matchValueAlignment', true) ? valueAlign : labelAlignOwn;
  const labelOpacity = 1 - r.num('label', 'transparency', 0) / 100;
  const accentShow = r.bool('accentBar', 'show', false);
  const accentColor = withAlpha(r.color('accentBar', 'color', r.dataColor(0)), r.num('accentBar', 'transparency', 0));
  const accentW = r.num('accentBar', 'width', 4);
  const accentPos = r.str('accentBar', 'position', 'Left');
  const imageShow = r.bool('image', 'show', false);
  const imageSize = imageShow ? r.num('image', 'size', 24) : 0;
  const imagePos = imageShow ? r.str('image', 'position', 'Left') : 'Left';
  const imagePad = imageShow ? r.num('image', 'padding', 4) : 0;
  const imageOpacity = imageShow ? 1 - r.num('image', 'transparency', 0) / 100 : 1;

  // reference labels
  const refTitleShow = r.bool('referenceLabelTitle', 'show', true);
  const refValueShow = r.bool('referenceLabelValue', 'show', true);
  const refDetailShow = r.bool('referenceLabelDetail', 'show', false);
  const refTitleFont = r.font('referenceLabelTitle', 'titleFontColor', r.structural.second, 10, { prefix: 'title', textClass: 'label' });
  const refValueFont = r.font('referenceLabelValue', 'valueFontColor', r.structural.first, 12, { prefix: 'value', textClass: 'label' });
  const refDetailFont = r.font('referenceLabelDetail', 'detailFontColor', r.structural.second, 9, { prefix: 'detail', textClass: 'label' });
  const refTitleText = r.str('referenceLabelTitle', 'titleText', '') || (r.str('referenceLabelTitle', 'titleContentType', 'fieldName') === 'fieldName' ? 'Vorjahr' : 'Vorjahr');
  const refLayoutPos = r.str('referenceLabelLayout', 'position', 'below');
  const refLayoutStyle = r.str('referenceLabelLayout', 'style', 'sentence');
  const refAlign = r.str('referenceLabelLayout', 'horizontalAlignment', 'left');
  const refValueText = formatWithUnit(SAMPLE_PREV, resolveUnit(r.num('referenceLabelValue', 'valueDisplayUnits', 0), [SAMPLE_PREV]), precisionOf(r, 'referenceLabelValue', 'valuePrecision'));
  const refDetailBg = refDetailShow ? r.color('referenceLabelDetail', 'detailBackgroundColor', '') : '';
  const refDetailText = `${formatWithUnit(SAMPLE_VALUE - SAMPLE_PREV, resolveUnit(r.num('referenceLabelDetail', 'detailDisplayUnits', 0), [SAMPLE_VALUE - SAMPLE_PREV]), precisionOf(r, 'referenceLabelDetail', 'detailPrecision'))} ▲`;
  const hasRef = refTitleShow || refValueShow || refDetailShow;

  const tiles = [
    { label: labelText || 'Umsatz', value: SAMPLE_VALUE },
    { label: labelText || 'Plan', value: SAMPLE_PLAN },
    { label: labelText || 'Vorjahr', value: SAMPLE_PREV },
  ];
  const orientation = String(r.raw('layout', 'orientation') ?? 0);
  const requestedCols = r.num('layout', 'columnCount', 0);
  const cols = style === 'Table' || orientation === '1' ? 1 : orientation === '2' ? tiles.length : Math.max(1, Math.min(tiles.length, requestedCols || 2));
  const count = Math.min(tiles.length, cols * Math.max(1, r.num('layout', 'rowCount', 0) || (style === 'Table' ? 3 : Math.ceil(2 / cols))));
  const shown = tiles.slice(0, count);
  const rows = Math.ceil(shown.length / cols);
  const area: Rect = { x: rect.x + outer.left, y: rect.y + outer.top, width: Math.max(10, rect.width - outer.left - outer.right), height: Math.max(10, rect.height - outer.top - outer.bottom) };
  const tileW = (area.width - colPad * (cols - 1)) / cols;
  const tileH = (area.height - rowPad * (rows - 1)) / rows;
  const { defs, filter } = customEffects(r, uid);
  const nodes: ReactNode[] = [];
  const unit = resolveUnit(valueUnits, shown.map((t) => t.value));
  shown.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = area.x + col * (tileW + colPad);
    const y = area.y + row * (tileH + rowPad);
    const rc: Rect = { x, y, width: tileW, height: tileH };
    const isTable = style === 'Table';
    if (bgShow && !isTable) nodes.push(<g key={`bg${i}`} data-part="card-bg" fill={bgColor} stroke={borderW > 0 ? borderColor : 'none'} strokeWidth={borderW} strokeDasharray={borderDash} filter={filter}>{tilePath('rectangleRounded', rc, corners)}</g>);
    if (fillShow) nodes.push(<g key={`f${i}`} data-part="card-fill" fill={fillColor} stroke={outlineShow ? outlineColor : 'none'} strokeWidth={outlineShow ? outlineW : 0}>{tilePath(tileShape, { x: x + 1, y: y + 1, width: tileW - 2, height: tileH - 2 }, { radius: Math.max(0, tileCorners.radius - 1), radii: tileCorners.radii })}</g>);
    if (isTable && i > 0 && (customLines || gridShow)) nodes.push(<line key={`ln${i}`} data-part="card-line" x1={x} x2={x + tileW} y1={y - rowPad / 2} y2={y - rowPad / 2} stroke={customLines ? lineColor : gridColor} strokeWidth={customLines ? lineW : gridW} strokeDasharray={customLines ? lineDash : gridDash} />);
    if (accentShow) {
      const horizontalBar = accentPos === 'Top' || accentPos === 'Bottom';
      nodes.push(<rect key={`ac${i}`} data-part="accent-bar" x={accentPos === 'Right' ? x + tileW - accentW : x} y={accentPos === 'Bottom' ? y + tileH - accentW : y} width={horizontalBar ? tileW : accentW} height={horizontalBar ? accentW : tileH} fill={accentColor} rx={1} />);
    }
    let left = x + 12 + (accentShow && accentPos === 'Left' ? accentW : 0);
    let right = x + tileW - 12 - (accentShow && accentPos === 'Right' ? accentW : 0);
    if (imageShow) {
      const ix = imagePos === 'Right' ? right - imageSize : left;
      const iy = imagePos === 'Bottom' ? y + tileH - imageSize - imagePad : y + imagePad + 4;
      nodes.push(<g key={`img${i}`} data-part="card-image" opacity={imageOpacity}><rect x={ix} y={iy} width={imageSize} height={imageSize} rx={3} fill={r.structural.third} /><polygon points={`${ix + imageSize * 0.15},${iy + imageSize * 0.8} ${ix + imageSize * 0.45},${iy + imageSize * 0.4} ${ix + imageSize * 0.65},${iy + imageSize * 0.62} ${ix + imageSize * 0.85},${iy + imageSize * 0.8}`} fill={r.structural.fourth} /></g>);
      if (imagePos === 'Left') left += imageSize + imagePad;
      if (imagePos === 'Right') right -= imageSize + imagePad;
    }
    const innerW = Math.max(10, right - left);
    const ax = (align: string) => (align === 'center' ? left + innerW / 2 : align === 'right' ? right : left);
    const anchor = (align: string) => (align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start');
    const vSize = Math.min(valueFont.sizePx, innerW / 5, tileH * 0.4);
    const valueText = formatWithUnit(t.value, unit, valuePrecision);
    const refBlockH = hasRef && tileH > 110 ? (refTitleShow ? refTitleFont.sizePx * 1.2 : 0) + (refValueShow ? refValueFont.sizePx * 1.2 : 0) + (refDetailShow ? refDetailFont.sizePx * 1.2 : 0) + 6 : 0;
    const refRight = hasRef && refLayoutPos === 'right' && tileW > 200;
    const mainW = refRight ? innerW * 0.6 : innerW;
    const mainCenterY = y + (tileH - (refRight ? 0 : refBlockH)) / 2;
    let cy = mainCenterY + vSize * 0.35;
    const mainRight = left + mainW;
    const axMain = (align: string) => (align === 'center' ? left + mainW / 2 : align === 'right' ? mainRight : left);
    if (labelShow && labelPos === 'aboveValue') {
      nodes.push(<text key={`l${i}`} data-part="card-label" x={axMain(labelAlign)} y={mainCenterY - vSize * 0.5 - 4} textAnchor={anchor(labelAlign)} opacity={labelOpacity} {...textProps(labelFont)}>{truncate(t.label, mainW, labelFont.sizePx)}</text>);
      cy += labelFont.sizePx * 0.4;
    }
    if (valueShow) nodes.push(<text key={`v${i}`} data-part="card-value" x={axMain(valueAlign)} y={cy} textAnchor={anchor(valueAlign)} opacity={valueOpacity} {...textProps(valueFont)} fontSize={vSize}>{valueText}</text>);
    if (labelShow && labelPos !== 'aboveValue') nodes.push(<text key={`l${i}`} data-part="card-label" x={axMain(labelAlign)} y={cy + labelFont.sizePx + 4} textAnchor={anchor(labelAlign)} opacity={labelOpacity} {...textProps(labelFont)}>{truncate(t.label, mainW, labelFont.sizePx)}</text>);
    if (hasRef && (refBlockH > 0 || refRight)) {
      const rx = refRight ? ax('left') + mainW + 8 : ax(refAlign);
      const rAnchor = refRight ? 'start' : anchor(refAlign);
      let ry = refRight ? mainCenterY - refBlockH / 2 + refTitleFont.sizePx : y + tileH - 8 - refBlockH + refTitleFont.sizePx;
      const line = (key: string, text: string, font: FontStyle, bg?: string) => {
        const w = text.length * font.sizePx * 0.55 + 6;
        nodes.push(
          <g key={key} data-part="reference-label">
            {bg && <rect x={rAnchor === 'end' ? rx - w : rAnchor === 'middle' ? rx - w / 2 : rx - 3} y={ry - font.sizePx} width={w} height={font.sizePx + 4} rx={2} fill={bg} />}
            <text x={rx} y={ry} textAnchor={rAnchor} {...textProps(font)}>{text}</text>
          </g>,
        );
        ry += font.sizePx * 1.2;
      };
      if (refLayoutStyle === 'tabular' && refTitleShow && refValueShow) {
        line(`rt${i}`, `${refTitleText}  ${refValueText}`, refValueFont);
      } else {
        if (refTitleShow) line(`rt${i}`, refTitleText, refTitleFont);
        if (refValueShow) line(`rv${i}`, refValueText, refValueFont);
      }
      if (refDetailShow) line(`rd${i}`, refDetailText, refDetailFont, refDetailBg || undefined);
    }
  });
  return (
    <g>
      {defs}
      {nodes}
    </g>
  );
}

export function MultiRowCard({ r, rect }: BodyProps) {
  const barShow = r.bool('card', 'barShow', true);
  const barColor = r.color('card', 'barColor', r.dataColor(0));
  const barW = r.num('card', 'barWeight', 4);
  const cardBg = r.color('card', 'cardBackground', '');
  const padding = r.num('card', 'cardPadding', 8);
  const outlineColor = r.color('card', 'outlineColor', r.structural.third);
  const outlineW = r.num('card', 'outlineWeight', 1);
  const outlineStyle = r.raw('card', 'outlineStyle');
  const outlined = outlineStyle !== undefined && outlineStyle !== 0 && outlineStyle !== '0' && outlineStyle !== 'None';
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
    if (outlined) nodes.push(<rect key={`o${i}`} x={rect.x} y={y} width={rect.width} height={rowH - 2} fill="none" stroke={outlineColor} strokeWidth={outlineW} />);
    if (barShow) nodes.push(<rect key={`b${i}`} data-part="card-bar" x={rect.x} y={y + 2} width={barW} height={rowH - 6} fill={barColor} />);
    const x = rect.x + (barShow ? barW : 0) + padding;
    nodes.push(<text key={`t${i}`} data-part="card-title" x={x} y={y + padding + titleFont.sizePx} {...textProps(titleFont)}>{truncate(row[0] ?? '', rect.width - x, titleFont.sizePx)}</text>);
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
    if (i < rows.length - 1 && !outlined) nodes.push(<line key={`sep${i}`} x1={rect.x} x2={rect.x + rect.width} y1={y + rowH - 1} y2={y + rowH - 1} stroke={outlineColor} strokeWidth={outlineW} />);
  });
  return <g>{nodes}</g>;
}

export function Kpi({ r, rect }: BodyProps) {
  const indFont = r.font('indicator', 'fontColor', r.structural.first, 32, { textClass: 'callout' });
  const hAlign = r.str('indicator', 'horizontalAlignment', 'left');
  const vAlign = r.str('indicator', 'verticalAlignment', 'middle');
  const showIcon = r.bool('indicator', 'showIcon', true);
  const iconSize = r.num('indicator', 'iconSize', 20);
  const indUnits = r.num('indicator', 'indicatorDisplayUnits', 0);
  const indPrecision = precisionOf(r, 'indicator', 'indicatorPrecision');
  const trendShow = r.bool('trendline', 'show', true);
  const trendTransparency = r.num('trendline', 'transparency', 20);
  const goalShow = r.bool('goals', 'showGoal', true);
  const distShow = r.bool('goals', 'showDistance', true);
  // kpi.goals: one fontSize/bold/italic/underline for both labels, separate colour + family per label
  const goalFont = r.font('goals', 'goalFontColor', r.structural.second, 9, { props: { family: 'goalFontFamily' }, textClass: 'label' });
  const distFont = r.font('goals', 'distanceFontColor', r.structural.second, 9, { props: { family: 'distanceFontFamily' }, textClass: 'label' });
  const goalText = r.str('goals', 'goalText', '') || 'Ziel';
  const distanceLabel = r.str('goals', 'distanceLabel', 'Percent');
  const goalDirection = r.str('goals', 'direction', 'High is good');
  const statusDirection = r.str('status', 'direction', 'Positive');
  const good = r.color('status', 'goodColor', r.structural.good);
  const bad = r.color('status', 'badColor', r.structural.bad);
  // the sample value is above goal: good when "high is good" / positive, bad otherwise
  const favourable = (goalDirection === 'High is good') === (statusDirection === 'Positive');
  const statusColor = favourable ? good : bad;
  const lastDateShow = r.bool('lastDate', 'show', false);
  const lastDateFont = r.font('lastDate', 'lastDateFontColor', r.structural.second, 9, { props: { family: 'lastDateFontFamily' }, textClass: 'label' });
  const value = formatWithUnit(SAMPLE_VALUE, resolveUnit(indUnits, [SAMPLE_VALUE]), indPrecision);
  const x = hAlign === 'center' ? rect.x + rect.width / 2 : hAlign === 'right' ? rect.x + rect.width - 8 : rect.x + 8;
  const anchor = hAlign === 'center' ? 'middle' : hAlign === 'right' ? 'end' : 'start';
  const size = Math.min(indFont.sizePx, rect.width / 7, rect.height * 0.4);
  const nodes: ReactNode[] = [];
  if (trendShow) {
    const max = Math.max(...KPI_SPARK);
    const pts = KPI_SPARK.map((v, i) => [rect.x + (i / (KPI_SPARK.length - 1)) * rect.width, rect.y + rect.height - (v / max) * rect.height * 0.7] as const);
    const d = `M${pts.map(([px, py]) => `${px},${py}`).join(' L')} L${rect.x + rect.width},${rect.y + rect.height} L${rect.x},${rect.y + rect.height} Z`;
    nodes.push(<path key="trend" data-part="kpi-trend" d={d} fill={withAlpha(statusColor, 100 - (100 - trendTransparency) * 0.35)} />);
  }
  const blockH = size + (goalShow ? goalFont.sizePx + 10 : 0) + (distShow ? distFont.sizePx + 4 : 0) + (lastDateShow ? lastDateFont.sizePx + 4 : 0);
  const cy = vAlign === 'top' ? rect.y + size : vAlign === 'bottom' ? rect.y + rect.height - blockH + size : rect.y + (rect.height - blockH) / 2 + size;
  nodes.push(<text key="v" data-part="kpi-value" x={x + (showIcon && anchor === 'start' ? iconSize * 1.2 : 0)} y={cy} textAnchor={anchor} {...textProps(indFont)} fontSize={size}>{value}</text>);
  if (showIcon) {
    const ix = anchor === 'start' ? x : anchor === 'end' ? x - size * 3.6 - iconSize : x - size * 2.4 - iconSize;
    const up = favourable === (statusDirection === 'Positive');
    nodes.push(up
      ? <polygon key="icon" data-part="kpi-icon" points={`${ix},${cy - iconSize * 0.1} ${ix + iconSize},${cy - iconSize * 0.1} ${ix + iconSize / 2},${cy - iconSize * 0.9}`} fill={statusColor} />
      : <polygon key="icon" data-part="kpi-icon" points={`${ix},${cy - iconSize * 0.9} ${ix + iconSize},${cy - iconSize * 0.9} ${ix + iconSize / 2},${cy - iconSize * 0.1}`} fill={statusColor} />);
  }
  let gy = cy + goalFont.sizePx + 10;
  const goalValue = formatWithUnit(SAMPLE_PLAN, resolveUnit(indUnits, [SAMPLE_PLAN]), indPrecision);
  if (goalShow) {
    nodes.push(<text key="g" data-part="kpi-goal" x={x} y={gy} textAnchor={anchor} {...textProps(goalFont)}>{`${goalText}: ${goalValue}`}</text>);
    gy += distFont.sizePx + 4;
  }
  if (distShow) {
    const diff = SAMPLE_VALUE - SAMPLE_PLAN;
    const pct = `${diff >= 0 ? '+' : ''}${((diff / SAMPLE_PLAN) * 100).toLocaleString('de-DE', { minimumFractionDigits: r.num('goals', 'labelPrecision', 1), maximumFractionDigits: r.num('goals', 'labelPrecision', 1) })} %`;
    const abs = `${diff >= 0 ? '+' : ''}${formatWithUnit(diff, resolveUnit(indUnits, [diff]), indPrecision)}`;
    const text = distanceLabel === 'Value' ? abs : distanceLabel === 'Value, percent' ? `${abs} (${pct})` : pct;
    nodes.push(<text key="d" data-part="kpi-distance" x={x} y={gy} textAnchor={anchor} {...textProps(distFont)}>{text}</text>);
    gy += lastDateFont.sizePx + 4;
  }
  if (lastDateShow) nodes.push(<text key="ld" data-part="kpi-date" x={x} y={gy} textAnchor={anchor} {...textProps(lastDateFont)}>Stand: 30.09.2026</text>);
  return <g>{nodes}</g>;
}
