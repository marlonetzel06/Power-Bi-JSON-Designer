/**
 * Report pages of the designer canvas. Each page is a Power BI 16:9 page (1280×720)
 * with the curated visuals placed like in a real report, so every format card can be
 * judged at a realistic size. Page order mirrors the Power BI visualizations gallery.
 */
import type { DictionaryKey } from '@/i18n/de';
import { VISUAL_CATEGORIES } from '@/pbi/curation/selection';

export const PAGE_W = 1280;
export const PAGE_H = 720;
const PAD = 24;
const GAP = 16;

export interface PlacedVisual {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CanvasPage {
  id: string;
  labelKey: DictionaryKey;
  visuals: PlacedVisual[];
}

/** Flow grid: `cols` per row, last row stretched; optional max cell height (top aligned). */
export function grid(keys: readonly string[], cols: number, maxCellH = Infinity): PlacedVisual[] {
  const rows = Math.ceil(keys.length / cols);
  const cellH = Math.min(maxCellH, (PAGE_H - PAD * 2 - GAP * (rows - 1)) / rows);
  const out: PlacedVisual[] = [];
  for (let r = 0; r < rows; r++) {
    const rowKeys = keys.slice(r * cols, r * cols + cols);
    const cellW = (PAGE_W - PAD * 2 - GAP * (rowKeys.length - 1)) / rowKeys.length;
    rowKeys.forEach((key, c) => {
      out.push({ key, x: Math.round(PAD + c * (cellW + GAP)), y: Math.round(PAD + r * (cellH + GAP)), w: Math.round(cellW), h: Math.round(cellH) });
    });
  }
  return out;
}

const cat = (id: string): readonly string[] => VISUAL_CATEGORIES.find((c) => c.id === id)?.visuals ?? [];

export const CANVAS_PAGES: readonly CanvasPage[] = [
  { id: 'bars', labelKey: 'canvasPage.bars', visuals: grid([...cat('bar'), ...cat('column')], 3) },
  { id: 'lines', labelKey: 'canvasPage.lines', visuals: grid(cat('line'), 2) },
  { id: 'combo', labelKey: 'canvasPage.combo', visuals: grid(cat('combo'), 2) },
  { id: 'distribution', labelKey: 'canvasPage.distribution', visuals: grid(cat('distribution'), 3) },
  { id: 'maps', labelKey: 'canvasPage.maps', visuals: grid(cat('map'), 2) },
  { id: 'cards', labelKey: 'canvasPage.cards', visuals: grid(cat('cards'), 3) },
  { id: 'tables', labelKey: 'canvasPage.tables', visuals: grid(cat('tables'), 2, 460) },
  { id: 'slicers', labelKey: 'canvasPage.slicers', visuals: grid(cat('slicers'), 4, 300) },
  { id: 'ai', labelKey: 'canvasPage.ai', visuals: grid(cat('ai'), 3, 520) },
  {
    id: 'elements',
    labelKey: 'canvasPage.elements',
    visuals: [
      { key: 'actionButton', x: PAD, y: PAD, w: 300, h: 80 },
      { key: 'bookmarkNavigator', x: PAD + 316, y: PAD, w: 450, h: 80 },
      { key: 'pageNavigator', x: PAD + 782, y: PAD, w: 450, h: 80 },
      { key: 'textbox', x: PAD, y: PAD + 112, w: 600, h: 180 },
      { key: 'shape', x: PAD + 616, y: PAD + 112, w: 300, h: 180 },
      { key: 'image', x: PAD + 932, y: PAD + 112, w: 300, h: 180 },
    ],
  },
];

export const SEARCH_PAGE_ID = 'search';

export function pageOfVisual(visualKey: string): CanvasPage | undefined {
  return CANVAS_PAGES.find((p) => p.visuals.some((v) => v.key === visualKey));
}

export function getPage(id: string): CanvasPage {
  return CANVAS_PAGES.find((p) => p.id === id) ?? CANVAS_PAGES[0]!;
}

/** Virtual page for a search filter: matching visuals flowed 3 per row (page grows vertically). */
export function searchPage(keys: readonly string[]): CanvasPage & { height: number } {
  const cols = keys.length <= 2 ? Math.max(1, keys.length) : 3;
  const cellW = (PAGE_W - PAD * 2 - GAP * (cols - 1)) / cols;
  const cellH = 300;
  const visuals = keys.map((key, i) => ({ key, x: Math.round(PAD + (i % cols) * (cellW + GAP)), y: PAD + Math.floor(i / cols) * (cellH + GAP), w: Math.round(cellW), h: cellH }));
  const rows = Math.ceil(keys.length / cols);
  return { id: SEARCH_PAGE_ID, labelKey: 'canvasPage.search', visuals, height: Math.max(PAGE_H, PAD * 2 + rows * cellH + (rows - 1) * GAP) };
}
