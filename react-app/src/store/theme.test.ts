import { beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore } from './theme';
import { THEME_INITIAL } from '@/pbi/defaults';
import { computeModified, stateModified } from '@/pbi/modified';
import { resolveProp } from '@/pbi/resolve';
import { solid } from '@/pbi/types';

describe('theme store', () => {
  beforeEach(() => {
    useThemeStore.getState().loadTheme(THEME_INITIAL);
    useThemeStore.temporal.getState().clear();
  });

  it('updates with structural sharing', () => {
    const before = useThemeStore.getState().theme;
    useThemeStore.getState().setCardProp('barChart', 'legend', 'show', false);
    const after = useThemeStore.getState().theme;
    expect(after).not.toBe(before);
    expect(after.visualStyles!.barChart).not.toBe(before.visualStyles!.barChart);
    expect(after.visualStyles!.lineChart).toBe(before.visualStyles!.lineChart);
    expect(after.visualStyles!.barChart!['*']!.legend![0]!.show).toBe(false);
  });

  it('tracks modified cards per visual and resets them', () => {
    const s = useThemeStore.getState();
    s.setCardProp('barChart', 'legend', 'show', false);
    s.setCardProp('barChart', 'labels', 'color', solid('#FF0000'));
    s.setCardProp('page', 'background', 'color', solid('#EEEEEE'));
    let m = computeModified(useThemeStore.getState().theme, useThemeStore.getState().baseline);
    expect(m.cardCounts.barChart).toBe(2);
    expect(m.cardCounts.page).toBe(1);
    useThemeStore.getState().resetCard('barChart', 'legend');
    m = computeModified(useThemeStore.getState().theme, useThemeStore.getState().baseline);
    expect(m.cardCounts.barChart).toBe(1);
    useThemeStore.getState().resetVisual('barChart');
    m = computeModified(useThemeStore.getState().theme, useThemeStore.getState().baseline);
    expect(m.cardCounts.barChart).toBeUndefined();
  });

  it('resolves values through visual → global → default', () => {
    const s = useThemeStore.getState();
    expect(resolveProp(s.theme, 'barChart', 'title', 'fontSize')).toBe(14); // from '*'
    s.setCardProp('barChart', 'title', 'fontSize', 20);
    expect(resolveProp(useThemeStore.getState().theme, 'barChart', 'title', 'fontSize')).toBe(20);
    expect(resolveProp(useThemeStore.getState().theme, 'lineChart', 'title', 'fontSize')).toBe(14);
    expect(resolveProp(useThemeStore.getState().theme, 'lineChart', 'legend', 'position')).toBe('Top');
    expect(resolveProp(useThemeStore.getState().theme, 'pieChart', 'slices', 'startAngle')).toBe(0); // curated default
  });

  it('writes $id states into their own entry and never splits the default entry', () => {
    const s = useThemeStore.getState();
    s.setCardProp('page', 'filterCard', 'foregroundColor', solid('#AA0000'), 'Applied');
    s.setCardProp('page', 'filterCard', 'border', false, 'Available');
    s.setCardProp('page', 'filterCard', 'transparency', 10);
    let entries = useThemeStore.getState().theme.visualStyles!.page!['*']!.filterCard!;
    expect(entries).toEqual([{ transparency: 10 }, { $id: 'Applied', foregroundColor: solid('#AA0000') }, { $id: 'Available', border: false }]);
    s.setCardProp('page', 'filterCard', 'foregroundColor', undefined, 'Applied');
    entries = useThemeStore.getState().theme.visualStyles!.page!['*']!.filterCard!;
    expect(entries).toEqual([{ transparency: 10 }, { $id: 'Available', border: false }]);
    // a card that only has a `$id: "default"` entry receives default-state writes in that entry
    useThemeStore.getState().loadTheme({ name: 'd', visualStyles: { actionButton: { '*': { fill: [{ $id: 'default', show: true }] } } } });
    useThemeStore.getState().setCardProp('actionButton', 'fill', 'fillColor', solid('#010101'));
    useThemeStore.getState().setCardProp('actionButton', 'fill', 'fillColor', solid('#020202'), 'hover');
    expect(useThemeStore.getState().theme.visualStyles!.actionButton!['*']!.fill).toEqual([{ $id: 'default', show: true, fillColor: solid('#010101') }, { $id: 'hover', fillColor: solid('#020202') }]);
  });

  it('writes default-state values into the entry that already holds the property and clears from every default entry', () => {
    useThemeStore.getState().loadTheme({ name: 'd', visualStyles: { cardVisual: { '*': { layout: [{ maxTiles: 3 }, { $id: 'default', cellPadding: 12 }] } } } });
    const s = useThemeStore.getState();
    s.setCardProp('cardVisual', 'layout', 'cellPadding', 20);
    s.setCardProp('cardVisual', 'layout', 'orientation', 1);
    expect(useThemeStore.getState().theme.visualStyles!.cardVisual!['*']!.layout).toEqual([{ maxTiles: 3, orientation: 1 }, { $id: 'default', cellPadding: 20 }]);
    expect(resolveProp(useThemeStore.getState().theme, 'cardVisual', 'layout', 'cellPadding')).toBe(20);
    useThemeStore.getState().setCardProp('cardVisual', 'layout', 'cellPadding', undefined);
    useThemeStore.getState().setCardProp('cardVisual', 'layout', 'maxTiles', undefined);
    expect(useThemeStore.getState().theme.visualStyles!.cardVisual!['*']!.layout).toEqual([{ orientation: 1 }]);
  });

  it('resets one $id state without touching the others', () => {
    useThemeStore.getState().loadTheme({ name: 'r', visualStyles: { page: { '*': { filterCard: [{ transparency: 5 }, { $id: 'Applied', border: true }] } } } });
    const s = useThemeStore.getState();
    s.setCardProp('page', 'filterCard', 'border', false, 'Applied');
    s.setCardProp('page', 'filterCard', 'border', false, 'Available');
    s.setCardProp('page', 'filterCard', 'transparency', 50);
    const { theme, baseline } = useThemeStore.getState();
    expect(stateModified(theme, baseline, 'page', 'filterCard', 'Applied')).toBe(true);
    expect(stateModified(theme, baseline, 'page', 'filterCard', 'Available')).toBe(true);
    expect(stateModified(theme, baseline, 'page', 'filterCard', undefined)).toBe(true);
    useThemeStore.getState().resetCard('page', 'filterCard', 'Applied');
    let entries = useThemeStore.getState().theme.visualStyles!.page!['*']!.filterCard!;
    expect(entries).toEqual([{ transparency: 50 }, { $id: 'Available', border: false }, { $id: 'Applied', border: true }]);
    expect(stateModified(useThemeStore.getState().theme, baseline, 'page', 'filterCard', 'Applied')).toBe(false);
    expect(stateModified(useThemeStore.getState().theme, baseline, 'page', 'filterCard', 'Available')).toBe(true);
    useThemeStore.getState().resetCard('page', 'filterCard', 'Available'); // not in the baseline → entry removed
    entries = useThemeStore.getState().theme.visualStyles!.page!['*']!.filterCard!;
    expect(entries).toEqual([{ transparency: 50 }, { $id: 'Applied', border: true }]);
    useThemeStore.getState().resetCard('page', 'filterCard');
    expect(useThemeStore.getState().theme.visualStyles!.page!['*']!.filterCard).toEqual([{ transparency: 5 }, { $id: 'Applied', border: true }]);
  });

  it('supports undo and redo', async () => {
    // edits within 400 ms of the previous recorded change are coalesced into one undo step
    await new Promise((r) => setTimeout(r, 450));
    const s = useThemeStore.getState();
    s.setColor('good', '#111111');
    await new Promise((r) => setTimeout(r, 450));
    s.setColor('good', '#222222');
    expect(useThemeStore.getState().theme.good).toBe('#222222');
    useThemeStore.temporal.getState().undo();
    expect(useThemeStore.getState().theme.good).toBe('#111111');
    useThemeStore.temporal.getState().undo();
    expect(useThemeStore.getState().theme.good).toBe(THEME_INITIAL.good);
    useThemeStore.temporal.getState().redo();
    expect(useThemeStore.getState().theme.good).toBe('#111111');
  });

  it('loadTheme replaces the theme and sets the baseline', () => {
    useThemeStore.getState().loadTheme({ name: 'Imported', dataColors: ['#010101'] });
    const s = useThemeStore.getState();
    expect(s.theme.name).toBe('Imported');
    expect(s.baseline.name).toBe('Imported');
    expect(computeModified(s.theme, s.baseline).cardCounts).toEqual({});
  });
});
