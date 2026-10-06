import { describe, expect, it } from 'vitest';
import { useThemeStore } from '@/store/theme';
import { visualThemeEqual } from './themeSlice';

describe('visualThemeEqual', () => {
  it('ignores edits to other visuals but sees own, global, colour and text changes', () => {
    const s = useThemeStore.getState();
    const t0 = s.theme;
    s.setCardProp('pieChart', 'legend', 'show', false);
    const t1 = useThemeStore.getState().theme;
    expect(visualThemeEqual(t0, t1, 'barChart')).toBe(true);
    expect(visualThemeEqual(t0, t1, 'pieChart')).toBe(false);
    s.setCardProp('*', 'title', 'fontSize', 20);
    const t2 = useThemeStore.getState().theme;
    expect(visualThemeEqual(t1, t2, 'barChart')).toBe(false);
    s.setColor('foreground', '#123456');
    const t3 = useThemeStore.getState().theme;
    expect(visualThemeEqual(t2, t3, 'barChart')).toBe(false);
    s.setDataColor(0, '#FF0000');
    const t4 = useThemeStore.getState().theme;
    expect(visualThemeEqual(t3, t4, 'gauge')).toBe(false);
    s.setName('neu');
    const t5 = useThemeStore.getState().theme;
    expect(visualThemeEqual(t4, t5, 'gauge')).toBe(true);
  });
});
