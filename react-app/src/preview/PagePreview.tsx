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
  const cardBg = withAlpha(r.color('filterCard', 'backgroundColor', r.structural.background), r.num('filterCard', 'transparency', 0));
  const cardFg = r.color('filterCard', 'foregroundColor', r.structural.first);
  const cardBorder = r.bool('filterCard', 'border', true);
  const cardBorderColor = r.color('filterCard', 'borderColor', r.structural.third);
  const cardText = (r.num('filterCard', 'textSize', 10) * 4) / 3 * (width / 1280) * 2.2;
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
  const titleFont = { family: "'Segoe UI', 'IBM Plex Sans', sans-serif", weight: 600, sizePx: titleSize, sizePt: 0, color: paneFg, italic: false, underline: false };
  const headerFont = { ...titleFont, weight: 400, sizePx: headerSize, color: paneFg };
  const cardFont = { ...titleFont, weight: 400, sizePx: cardText, color: cardFg };
  const cards = ['Region', 'Produkt', 'Jahr'];
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
      <text x={px + paneW * 0.08} y={margin + titleSize * 1.5 + headerSize * 1.8} {...textProps(headerFont)}>Filter für diese Seite</text>
      {cards.map((c, i) => {
        const y = margin + titleSize * 1.5 + headerSize * 2.6 + i * (cardH + cardText * 0.8);
        if (y + cardH > height - margin - cardH) return null;
        return (
          <g key={c}>
            <rect x={px + paneW * 0.06} y={y} width={paneW * 0.88} height={cardH} fill={cardBg} stroke={cardBorder ? cardBorderColor : 'none'} rx={2} />
            <text x={px + paneW * 0.12} y={y + cardText * 1.4} {...textProps(cardFont)}>{c}</text>
            <text x={px + paneW * 0.12} y={y + cardText * 2.7} {...textProps(cardFont)} opacity={0.7}>ist (Alle)</text>
          </g>
        );
      })}
      <rect x={px + paneW * 0.06} y={height - margin - cardH * 0.8} width={paneW * 0.88} height={cardH * 0.6} rx={2} fill={applyColor} />
      <text x={px + paneW / 2} y={height - margin - cardH * 0.8 + cardH * 0.4} textAnchor="middle" {...textProps(cardFont)} fill={r.structural.background}>Filter anwenden</text>
    </g>
  );
}
