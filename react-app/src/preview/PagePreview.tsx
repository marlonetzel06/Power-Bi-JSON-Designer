import { fontSpec } from './fonts';
import { textProps, withAlpha, type Resolver } from './resolver';

/**
 * The report page itself: wallpaper (outspace), canvas (background), filter pane and
 * filter cards. Used for the `page` pseudo-visual.
 */
export function PagePreview({ r, width, height }: { r: Resolver; width: number; height: number }) {
  const wallpaper = withAlpha(r.color('outspace', 'color', '#F3F2F1'), r.num('outspace', 'transparency', 0));
  const canvas = withAlpha(r.color('background', 'color', r.structural.background), r.num('background', 'transparency', 0));
  const sizeType = r.str('pageSize', 'pageSizeTypes', 'Widescreen');
  const pw = r.num('pageSize', 'pageSizeWidth', 1280);
  const ph = r.num('pageSize', 'pageSizeHeight', 720);
  const ratio = sizeType === 'Standard' ? 4 / 3 : sizeType === 'Letter' ? 8.5 / 11 : sizeType === 'Tooltip' ? 320 / 240 : sizeType === 'Custom' ? pw / Math.max(1, ph) : 16 / 9;
  const paneBg = withAlpha(r.color('outspacePane', 'backgroundColor', r.structural.background), r.num('outspacePane', 'transparency', 0));
  const paneFg = r.color('outspacePane', 'foregroundColor', r.structural.first);
  const paneBorder = r.bool('outspacePane', 'border', true);
  const paneBorderColor = r.color('outspacePane', 'borderColor', r.structural.third);
  const paneW = Math.min(width * 0.26, Math.max(60, (r.num('outspacePane', 'width', 240) / 1280) * width));
  const titleSize = (r.num('outspacePane', 'titleSize', 14) * 4) / 3 * (width / 1280) * 2.2;
  const headerSize = (r.num('outspacePane', 'headerSize', 12) * 4) / 3 * (width / 1280) * 2.2;
  const searchSize = (r.num('outspacePane', 'searchTextSize', 10) * 4) / 3 * (width / 1280) * 2.2;
  const inputBox = r.color('outspacePane', 'inputBoxColor', r.structural.background);
  const scale = (width / 1280) * 2.2;
  // Filter cards exist in two states: the first card is an applied filter, the others are available.
  const cardStyle = (state: 'Applied' | 'Available') => {
    const rs = r.withState(state);
    return {
      bg: withAlpha(rs.color('filterCard', 'backgroundColor', r.structural.background), rs.num('filterCard', 'transparency', 0)),
      fg: rs.color('filterCard', 'foregroundColor', r.structural.first),
      border: rs.bool('filterCard', 'border', true),
      borderColor: rs.color('filterCard', 'borderColor', r.structural.third),
      input: rs.color('filterCard', 'inputBoxColor', r.structural.background),
      family: rs.str('filterCard', 'fontFamily', r.str('outspacePane', 'fontFamily', 'Segoe UI')),
      text: ((rs.num('filterCard', 'textSize', 10) * 4) / 3) * scale,
    };
  };
  const applied = cardStyle('Applied');
  const available = cardStyle('Available');
  const cardText = applied.text;
  const applyColor = r.color('outspacePane', 'checkboxAndApplyColor', r.dataColor(0));
  const vAlign = r.str('displayArea', 'verticalAlignment', 'Top');

  const margin = Math.max(8, width * 0.04);
  const availW = width - paneW - margin * 3;
  const availH = height - margin * 2;
  let cw = availW;
  let ch = cw / ratio;
  if (ch > availH) {
    ch = availH;
    cw = ch * ratio;
  }
  const cx = margin + (availW - cw) / 2;
  const cy = vAlign === 'Middle' ? margin + (availH - ch) / 2 : margin;
  const px = width - paneW - margin;
  const paneFamily = fontSpec(r.str('outspacePane', 'fontFamily', 'Segoe UI')).family;
  const titleFont = { family: paneFamily, weight: 600, sizePx: titleSize, sizePt: 0, color: paneFg, italic: false, underline: false };
  const headerFont = { ...titleFont, weight: 400, sizePx: headerSize, color: paneFg };
  const cards: { label: string; value: string; style: typeof applied }[] = [
    { label: 'Region', value: 'ist Nord, West', style: applied },
    { label: 'Produkt', value: 'ist (Alle)', style: available },
    { label: 'Jahr', value: 'ist (Alle)', style: available },
  ];
  const cardH = cardText * 3.2;
  return (
    <g>
      <rect x={0} y={0} width={width} height={height} fill={wallpaper} />
      <rect x={cx} y={cy} width={cw} height={ch} fill={canvas} />
      {/* placeholder visuals on the canvas */}
      <g opacity={0.25} fill={r.structural.second}>
        <rect x={cx + cw * 0.04} y={cy + ch * 0.08} width={cw * 0.42} height={ch * 0.38} rx={2} />
        <rect x={cx + cw * 0.52} y={cy + ch * 0.08} width={cw * 0.44} height={ch * 0.38} rx={2} />
        <rect x={cx + cw * 0.04} y={cy + ch * 0.54} width={cw * 0.92} height={ch * 0.38} rx={2} />
      </g>
      <rect x={px} y={margin} width={paneW} height={height - margin * 2} fill={paneBg} stroke={paneBorder ? paneBorderColor : 'none'} />
      <text x={px + paneW * 0.08} y={margin + titleSize * 1.5} {...textProps(titleFont)}>Filter</text>
      <rect data-part="filter-search" x={px + paneW * 0.06} y={margin + titleSize * 1.5 + headerSize * 0.4} width={paneW * 0.88} height={searchSize * 1.8} rx={2} fill={inputBox} stroke={paneBorderColor} />
      <text x={px + paneW * 0.1} y={margin + titleSize * 1.5 + headerSize * 0.4 + searchSize * 1.25} {...textProps({ ...headerFont, sizePx: searchSize })} opacity={0.6}>Suchen</text>
      <text x={px + paneW * 0.08} y={margin + titleSize * 1.5 + headerSize * 0.6 + searchSize * 1.8 + headerSize * 1.4} {...textProps(headerFont)}>Filter für diese Seite</text>
      {cards.map((c, i) => {
        const y = margin + titleSize * 1.5 + headerSize * 0.6 + searchSize * 1.8 + headerSize * 2.2 + i * (cardH + cardText * 0.8);
        if (y + cardH > height - margin - cardH) return null;
        const font = { ...titleFont, family: fontSpec(c.style.family).family, weight: 400, sizePx: c.style.text, color: c.style.fg };
        return (
          <g key={c.label} data-filter-card={c.style === applied ? 'Applied' : 'Available'}>
            <rect x={px + paneW * 0.06} y={y} width={paneW * 0.88} height={cardH} fill={c.style.bg} stroke={c.style.border ? c.style.borderColor : 'none'} rx={2} />
            <text x={px + paneW * 0.12} y={y + c.style.text * 1.4} {...textProps(font)}>{c.label}</text>
            <text x={px + paneW * 0.12} y={y + c.style.text * 2.7} {...textProps(font)} opacity={0.7}>{c.value}</text>
          </g>
        );
      })}
      <rect x={px + paneW * 0.06} y={height - margin - cardH * 0.8} width={paneW * 0.88} height={cardH * 0.6} rx={2} fill={applyColor} />
      <text x={px + paneW / 2} y={height - margin - cardH * 0.8 + cardH * 0.4} textAnchor="middle" {...textProps({ ...titleFont, weight: 400, sizePx: cardText })} fill={r.structural.background}>Filter anwenden</text>
    </g>
  );
}
