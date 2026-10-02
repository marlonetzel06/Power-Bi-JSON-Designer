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
