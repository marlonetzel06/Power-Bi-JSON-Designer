import { describe, expect, it } from 'vitest';
import { BASE_THEME } from './baseTheme';
import { getValueSource, resolveProp } from './resolve';
import { solid, type ReportTheme } from './types';
import { validateTheme } from './validate';

const empty: ReportTheme = { name: 'leer' };

describe('base theme layering (CY26SU02)', () => {
  it('ships Microsoft defaults', () => {
    expect(BASE_THEME.name).toBe('CY26SU02');
    expect(BASE_THEME.textClasses?.callout?.fontSize).toBe(24);
    expect(BASE_THEME.foregroundNeutralSecondary).toBe('#605E5C');
  });
  it('falls back to base visual and base "*" values', () => {
    expect(resolveProp(empty, 'pieChart', 'legend', 'position')).toBe('RightCenter');
    expect(resolveProp(empty, 'barChart', 'valueAxis', 'gridlineStyle')).toBe('dotted');
    expect(resolveProp(empty, 'actionButton', 'background', 'show')).toBe(false);
    expect(getValueSource(empty, 'pieChart', 'legend', 'position')).toBe('base');
  });
  it('lets the custom theme override the base at the same level', () => {
    const t: ReportTheme = { name: 'x', visualStyles: { '*': { '*': { valueAxis: [{ gridlineStyle: 'solid' }] } }, pieChart: { '*': { legend: [{ position: 'Top' }] } } } };
    expect(resolveProp(t, 'barChart', 'valueAxis', 'gridlineStyle')).toBe('solid');
    expect(resolveProp(t, 'pieChart', 'legend', 'position')).toBe('Top');
    expect(getValueSource(t, 'pieChart', 'legend', 'position')).toBe('visual');
  });
  it('keeps base visual entries above the custom "*" entries, like the merged theme in Power BI', () => {
    const t: ReportTheme = { name: 'x', visualStyles: { '*': { '*': { legend: [{ position: 'Top' }] } } } };
    expect(resolveProp(t, 'pieChart', 'legend', 'position')).toBe('RightCenter');
    expect(resolveProp(t, 'barChart', 'legend', 'position')).toBe('Top');
  });
  it('resolves named structural colours from the custom theme, then the base', () => {
    const t: ReportTheme = { name: 'x', backgroundLight: '#ABCDEF', visualStyles: { cardVisual: { '*': { outline: [{ lineColor: solid('backgroundLight') }] } } } };
    expect(resolveProp(t, 'cardVisual', 'outline', 'lineColor')).toBe('#ABCDEF');
    expect(resolveProp(empty, 'cardVisual', 'outline', 'lineColor')).toBe('#F3F2F1');
  });
  it('is never exported: an empty custom theme exports without base values and validates', async () => {
    const { buildExportTheme } = await import('./builder');
    const out = buildExportTheme(empty);
    expect(out.visualStyles ?? {}).toEqual({});
    expect((await validateTheme(out)).errorCount).toBe(0);
  });
});
