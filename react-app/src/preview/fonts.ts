/** Map Power BI font names to CSS font stacks and weights. */
export interface FontSpec {
  family: string;
  weight?: number;
}

const FALLBACK = "'Segoe UI', 'IBM Plex Sans', system-ui, sans-serif";

const FONT_MAP: Record<string, FontSpec> = {
  'Segoe UI': { family: FALLBACK },
  'Segoe UI Light': { family: FALLBACK, weight: 300 },
  'Segoe UI Semibold': { family: FALLBACK, weight: 600 },
  'Segoe UI Bold': { family: FALLBACK, weight: 700 },
  'Segoe (Bold)': { family: FALLBACK, weight: 700 },
  DIN: { family: "'DIN', 'Bahnschrift', 'Titillium Web', 'IBM Plex Sans', sans-serif", weight: 600 },
  Arial: { family: 'Arial, Helvetica, sans-serif' },
  'Arial Black': { family: "'Arial Black', Arial, sans-serif", weight: 900 },
  Calibri: { family: "Calibri, Carlito, 'Segoe UI', sans-serif" },
  Cambria: { family: 'Cambria, Georgia, serif' },
  'Century Gothic': { family: "'Century Gothic', 'URW Gothic', sans-serif" },
  Consolas: { family: "Consolas, 'IBM Plex Mono', monospace" },
  'Courier New': { family: "'Courier New', Courier, monospace" },
  Georgia: { family: 'Georgia, serif' },
  Impact: { family: 'Impact, Haettenschweiler, sans-serif' },
  'Lucida Sans Unicode': { family: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif" },
  'Palatino Linotype': { family: "'Palatino Linotype', Palatino, serif" },
  Tahoma: { family: 'Tahoma, Geneva, sans-serif' },
  'Times New Roman': { family: "'Times New Roman', Times, serif" },
  'Trebuchet MS': { family: "'Trebuchet MS', sans-serif" },
  Verdana: { family: 'Verdana, Geneva, sans-serif' },
  Aptos: { family: "Aptos, 'IBM Plex Sans', sans-serif" },
  'Aptos Display': { family: "'Aptos Display', Aptos, 'IBM Plex Sans', sans-serif" },
  'Franklin Gothic Medium': { family: "'Franklin Gothic Medium', 'Arial Narrow', sans-serif", weight: 500 },
  Garamond: { family: 'Garamond, serif' },
};

/** Power BI stores some fonts as "wf_standard-font" stacks; pick the first real name. */
export function normalizeFontName(name: string | undefined): string {
  if (!name) return 'Segoe UI';
  for (const part of name.replace(/\\"/g, '"').split(',')) {
    const c = part.trim().replace(/^['"]|['"]$/g, '');
    if (c && !c.startsWith('wf_')) return c;
  }
  return 'Segoe UI';
}

export function fontSpec(name: string | undefined): FontSpec {
  const n = normalizeFontName(name);
  return FONT_MAP[n] ?? { family: `'${n}', ${FALLBACK}` };
}

/** Power BI font sizes are points; SVG uses px. */
export function ptToPx(pt: number): number {
  return pt * (4 / 3);
}

/** Rough text width estimate (no DOM measurement, deterministic in tests). */
export function estimateTextWidth(text: string, fontSizePx: number, bold = false): number {
  let w = 0;
  for (const ch of text) {
    if (ch === ' ') w += 0.28;
    else if ('iljtf.,:;|!'.includes(ch)) w += 0.3;
    else if ('mwMW'.includes(ch)) w += 0.85;
    else if (ch >= 'A' && ch <= 'Z') w += 0.66;
    else if (ch >= '0' && ch <= '9') w += 0.56;
    else w += 0.54;
  }
  return w * fontSizePx * (bold ? 1.06 : 1);
}

export function truncate(text: string, maxWidth: number, fontSizePx: number, bold = false): string {
  if (estimateTextWidth(text, fontSizePx, bold) <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && estimateTextWidth(t + '…', fontSizePx, bold) > maxWidth) t = t.slice(0, -1);
  return t + '…';
}
