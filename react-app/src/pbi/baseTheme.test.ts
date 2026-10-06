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
  it('resolves $id states: filter cards come from the base "*" entries per state', () => {
    expect(resolveProp(empty, 'page', 'filterCard', 'foregroundColor', undefined, 'Applied')).toBe('#252423');
    expect(getValueSource(empty, 'page', 'filterCard', 'foregroundColor', 'Applied')).toBe('base');
    expect(resolveProp(empty, 'page', 'filterCard', 'border', undefined, 'Available')).toBe(true);
    const t: ReportTheme = { name: 'x', visualStyles: { page: { '*': { filterCard: [{ $id: 'Applied', foregroundColor: solid('#AA0000') }, { $id: 'Available', foregroundColor: solid('#BB0000') }] } } } };
    expect(resolveProp(t, 'page', 'filterCard', 'foregroundColor', undefined, 'Applied')).toBe('#AA0000');
    expect(resolveProp(t, 'page', 'filterCard', 'foregroundColor', undefined, 'Available')).toBe('#BB0000');
    // no state asked: only a default entry (no $id) counts, never the first state entry
    expect(getValueSource(t, 'page', 'filterCard', 'foregroundColor')).not.toBe('visual');
  });
  it('treats $id "default" like an entry without $id and lets a state inherit from it', () => {
    const t: ReportTheme = { name: 'x', visualStyles: { actionButton: { '*': { fill: [{ $id: 'default', fillColor: solid('#111111') }, { $id: 'hover', fillColor: solid('#222222') }] } } } };
    expect(resolveProp(t, 'actionButton', 'fill', 'fillColor')).toBe('#111111');
    expect(resolveProp(t, 'actionButton', 'fill', 'fillColor', undefined, 'default')).toBe('#111111');
    expect(resolveProp(t, 'actionButton', 'fill', 'fillColor', undefined, 'hover')).toBe('#222222');
    expect(resolveProp(t, 'actionButton', 'fill', 'fillColor', undefined, 'selected')).toBe('#111111'); // inherits from default
    // the base theme stores card-visual entries with `$id: "default"`: they count as the default state
    expect(resolveProp(empty, 'cardVisual', 'label', 'position')).toBe('belowValue');
    expect(getValueSource(empty, 'cardVisual', 'label', 'position')).toBe('base');
  });
  it('reports a state value inherited from the visual\'s own default entry as "state-default"', () => {
    const t: ReportTheme = { name: 'x', visualStyles: { actionButton: { '*': { fill: [{ fillColor: solid('#111111') }, { $id: 'hover', transparency: 10 }] } } } };
    expect(getValueSource(t, 'actionButton', 'fill', 'fillColor', 'hover')).toBe('state-default');
    expect(getValueSource(t, 'actionButton', 'fill', 'transparency', 'hover')).toBe('visual');
    expect(getValueSource(t, 'actionButton', 'fill', 'fillColor')).toBe('visual');
    expect(getValueSource(t, 'actionButton', 'fill', 'fillColor', 'default')).toBe('visual');
  });
  it('derives curated colour defaults from the structural and data colours of the theme', () => {
    expect(resolveProp(empty, 'lineChart', 'trend', 'lineColor')).toBe('#252423');
    expect(resolveProp({ name: 'x', firstLevelElements: '#102030' }, 'lineChart', 'trend', 'lineColor')).toBe('#102030');
    expect(resolveProp({ name: 'x', foreground: '#302010' }, 'lineChart', 'trend', 'lineColor')).toBe('#302010');
    expect(resolveProp({ name: 'x', secondLevelElements: '#445566' }, 'barChart', 'categoryAxis', 'labelColor')).toBe('#445566');
    expect(resolveProp({ name: 'x', dataColors: ['#ABCDEF'] }, 'tableEx', 'sparklines', 'dataColor')).toBe('#ABCDEF');
    expect(resolveProp(empty, 'tableEx', 'sparklines', 'dataColor')).toBe('#118DFF');
    expect(resolveProp({ name: 'x', bad: '#FF0000' }, 'kpi', 'status', 'badColor')).toBe('#FF0000');
    // enum values that share a name with a structural colour are untouched
    expect(resolveProp(empty, 'lineChart', 'lineStyles', 'interpolationStep')).toBe('center');
    expect(resolveProp(empty, 'actionButton', 'glow', 'color')).toBe('#118DFF');
  });
  it('is never exported: an empty custom theme exports without base values and validates', async () => {
    const { buildExportTheme } = await import('./builder');
    const out = buildExportTheme(empty);
    expect(out.visualStyles ?? {}).toEqual({});
    expect((await validateTheme(out)).errorCount).toBe(0);
  });
});
