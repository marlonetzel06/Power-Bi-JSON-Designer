import { describe, expect, it } from 'vitest';
import { VISUAL_KEYS } from '@/pbi/curation/selection';
import { CANVAS_PAGES, PAGE_H, PAGE_W, pageOfVisual } from './pages';

describe('canvas pages', () => {
  it('place every curated visual exactly once', () => {
    const placed = CANVAS_PAGES.flatMap((p) => p.visuals.map((v) => v.key));
    expect([...placed].sort()).toEqual([...VISUAL_KEYS].sort());
    for (const k of VISUAL_KEYS) expect(pageOfVisual(k)?.id, k).toBeDefined();
  });
  it('keep visuals inside the 16:9 page', () => {
    for (const p of CANVAS_PAGES) for (const v of p.visuals) {
      expect(v.x, `${p.id}/${v.key}`).toBeGreaterThanOrEqual(0);
      expect(v.y).toBeGreaterThanOrEqual(0);
      expect(v.x + v.w).toBeLessThanOrEqual(PAGE_W);
      expect(v.y + v.h).toBeLessThanOrEqual(PAGE_H);
    }
  });
});
