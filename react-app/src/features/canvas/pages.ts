/**
 * Layout of the designer canvas: ONE long report page (1280 px wide, Power BI custom
 * page size) with all curated visuals grouped in sections per category, so every
 * format card can be judged at a realistic size and everything is visible at once.
 */
import type { DictionaryKey } from '@/i18n/de';
import { VISUAL_CATEGORIES } from '@/pbi/curation/selection';

export const PAGE_W = 1280;
const PAD = 24;
const GAP = 16;
export const SECTION_HEADING_H = 36;
const SECTION_GAP = 28;

export interface PlacedVisual {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Section {
  id: string;
  labelKey: DictionaryKey;
  keys: readonly string[];
  cols: number;
  /** Cell height; an array gives a height per row. */
  cellH: number | readonly number[];
}

export interface PlacedSection {
  id: string;
  labelKey: DictionaryKey;
  /** Top of the section heading. */
  y: number;
  visuals: PlacedVisual[];
}

export interface CanvasLayout {
  sections: PlacedSection[];
  height: number;
}

const cat = (id: string): readonly string[] => VISUAL_CATEGORIES.find((c) => c.id === id)?.visuals ?? [];

export const SECTIONS: readonly Section[] = [
  { id: 'bars', labelKey: 'canvasPage.bars', keys: [...cat('bar'), ...cat('column')], cols: 3, cellH: 300 },
  { id: 'lines', labelKey: 'canvasPage.lines', keys: cat('line'), cols: 2, cellH: 320 },
  { id: 'combo', labelKey: 'canvasPage.combo', keys: cat('combo'), cols: 2, cellH: 320 },
  { id: 'distribution', labelKey: 'canvasPage.distribution', keys: cat('distribution'), cols: 3, cellH: 300 },
  { id: 'maps', labelKey: 'canvasPage.maps', keys: cat('map'), cols: 2, cellH: 320 },
  { id: 'cards', labelKey: 'canvasPage.cards', keys: cat('cards'), cols: 3, cellH: 240 },
  { id: 'tables', labelKey: 'canvasPage.tables', keys: cat('tables'), cols: 2, cellH: 420 },
  { id: 'slicers', labelKey: 'canvasPage.slicers', keys: cat('slicers'), cols: 4, cellH: 300 },
  { id: 'ai', labelKey: 'canvasPage.ai', keys: cat('ai'), cols: 3, cellH: 460 },
  { id: 'elements', labelKey: 'canvasPage.elements', keys: cat('elements'), cols: 3, cellH: [80, 180] },
];

/** Flow grid below `top`: `cols` per row, last row stretched. Returns visuals and bottom edge. */
export function flow(keys: readonly string[], cols: number, cellH: number | readonly number[], top: number): { visuals: PlacedVisual[]; bottom: number } {
  const visuals: PlacedVisual[] = [];
  const rows = Math.ceil(keys.length / cols);
  let y = top;
  for (let r = 0; r < rows; r++) {
    const rowKeys = keys.slice(r * cols, r * cols + cols);
    const h = typeof cellH === 'number' ? cellH : (cellH[Math.min(r, cellH.length - 1)] ?? 300);
    const cellW = (PAGE_W - PAD * 2 - GAP * (rowKeys.length - 1)) / rowKeys.length;
    rowKeys.forEach((key, c) => visuals.push({ key, x: Math.round(PAD + c * (cellW + GAP)), y, w: Math.round(cellW), h }));
    y += h + (r < rows - 1 ? GAP : 0);
  }
  return { visuals, bottom: y };
}

/** Lay out all sections (optionally only the visuals in `keep`); empty sections are dropped. */
export function layoutCanvas(keep?: ReadonlySet<string>): CanvasLayout {
  const sections: PlacedSection[] = [];
  let y = PAD;
  for (const s of SECTIONS) {
    const keys = keep ? s.keys.filter((k) => keep.has(k)) : s.keys;
    if (keys.length === 0) continue;
    const { visuals, bottom } = flow(keys, s.cols, s.cellH, y + SECTION_HEADING_H);
    sections.push({ id: s.id, labelKey: s.labelKey, y, visuals });
    y = bottom + SECTION_GAP;
  }
  return { sections, height: Math.max(360, y - SECTION_GAP + PAD) };
}

export function sectionOfVisual(visualKey: string): Section | undefined {
  return SECTIONS.find((s) => s.keys.includes(visualKey));
}
