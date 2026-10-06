import { describe, expect, it } from 'vitest';
import { VISUAL_KEYS } from '@/pbi/curation/selection';
import { layoutCanvas, PAGE_W, sectionOfVisual } from './pages';

describe('canvas layout', () => {
  const layout = layoutCanvas();
  const placed = layout.sections.flatMap((s) => s.visuals);

  it('places every curated visual exactly once', () => {
    expect(placed.map((v) => v.key).sort()).toEqual([...VISUAL_KEYS].sort());
    for (const k of VISUAL_KEYS) expect(sectionOfVisual(k)?.id, k).toBeDefined();
  });

  it('keeps visuals inside the page width and free of overlaps', () => {
    for (const v of placed) {
      expect(v.x).toBeGreaterThanOrEqual(0);
      expect(v.x + v.w).toBeLessThanOrEqual(PAGE_W);
      expect(v.y + v.h).toBeLessThanOrEqual(layout.height);
    }
    for (const a of placed) for (const b of placed) {
      if (a === b) continue;
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      expect(overlap, `${a.key} overlaps ${b.key}`).toBe(false);
    }
  });

  it('drops empty sections when filtering', () => {
    const filtered = layoutCanvas(new Set(['kpi', 'gauge']));
    expect(filtered.sections.map((s) => s.id)).toEqual(['cards']);
    expect(filtered.height).toBeLessThan(layout.height);
  });
});
