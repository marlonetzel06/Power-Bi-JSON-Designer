import { describe, expect, it } from 'vitest';
import { normalizePageName, resolvePage } from './pageMap';

describe('resolvePage', () => {
  const pages = [
    { name: 'p1', displayName: 'Grouped Coulmn chart', visualTypes: ['clusteredColumnChart'] },
    { name: 'p2', displayName: 'KPI Card', visualTypes: ['cardVisual'] },
    { name: 'p3', displayName: 'Line  Chart ', visualTypes: [] },
  ];
  it('prefers pages that contain the visual type', () => {
    expect(resolvePage('cardVisual', pages)?.name).toBe('p2');
    expect(resolvePage('clusteredColumnChart', pages)?.name).toBe('p1');
  });
  it('falls back to the static display-name map with normalisation', () => {
    expect(resolvePage('lineChart', pages)?.name).toBe('p3');
    expect(normalizePageName('  Line  Chart ')).toBe('line chart');
  });
  it('returns undefined for visuals the report does not show', () => {
    expect(resolvePage('kpi', pages)).toBeUndefined();
    expect(resolvePage('shape', pages)).toBeUndefined();
  });
});

describe('static page map against the shipped .pbix', () => {
  // Regenerate with `python3 scripts/pbix-pages.py` after editing the sample report.
  it('every mapped page exists in the report and shows the visual type', async () => {
    const fixture = (await import('./pbixPages.fixture.json')).default as { name: string; displayName: string; visualTypes: string[] }[];
    const { STATIC_PAGE_MAP } = await import('./pageMap');
    for (const [visual, pageName] of Object.entries(STATIC_PAGE_MAP)) {
      const page = fixture.find((p) => normalizePageName(p.displayName) === normalizePageName(pageName));
      expect(page, `page "${pageName}" for ${visual}`).toBeDefined();
      expect(page!.visualTypes, `${pageName} contains ${visual}`).toContain(visual);
    }
  });
  it('resolves every visual the report contains, by type', async () => {
    const fixture = (await import('./pbixPages.fixture.json')).default as { name: string; displayName: string; visualTypes: string[] }[];
    const types = new Set(fixture.flatMap((p) => p.visualTypes));
    for (const t of types) expect(resolvePage(t, fixture), t).toBeDefined();
  });
});
