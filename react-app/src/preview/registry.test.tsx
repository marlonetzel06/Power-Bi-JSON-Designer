import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MockVisual } from './MockVisual';
import { VISUAL_RENDERERS } from './registry';
import { THEME_INITIAL } from '@/pbi/defaults';
import { VISUAL_KEYS } from '@/pbi/curation/selection';
import { solid, type ReportTheme } from '@/pbi/types';
import schemaKeys from '@/pbi/generated/schemaKeys.json';
import { createResolver } from './resolver';
import { VisualFrame } from './VisualFrame';
import { PagePreview } from './PagePreview';

describe('mock renderers', () => {
  it('has a renderer for every curated visual', () => {
    for (const key of VISUAL_KEYS) expect(VISUAL_RENDERERS[key], key).toBeDefined();
  });

  it.each([...VISUAL_KEYS, '*', 'page'])('renders %s with the initial theme', (key) => {
    const { container } = render(<MockVisual theme={THEME_INITIAL} visualKey={key} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.querySelectorAll('*').length).toBeGreaterThan(3);
  });

  it('reflects theme changes in the SVG', () => {
    const theme: ReportTheme = structuredClone(THEME_INITIAL);
    theme.visualStyles!['*']!['*']!.title = [{ show: true, fontColor: solid('#ABCDEF'), fontSize: 20, text: 'Mein Titel' }];
    theme.visualStyles!.barChart!['*']!.valueAxis = [{ show: true, gridlineShow: true, gridlineColor: solid('#123456') }];
    theme.visualStyles!.barChart!['*']!.legend = [{ show: false }];
    theme.dataColors = ['#FF0000', '#00FF00', '#0000FF'];
    const { container } = render(<MockVisual theme={theme} visualKey="barChart" />);
    const html = container.innerHTML;
    expect(html).toContain('Mein Titel');
    expect(html).toContain('#ABCDEF');
    expect(html).toContain('#123456');
    expect(html).toContain('#FF0000');
    expect(container.querySelector('[data-part="legend"]')).toBeNull();
    const title = container.querySelector('text');
    expect(title?.getAttribute('font-size')).toBe(String(20 * (4 / 3)));
  });

  it('hides the title when the theme turns it off', () => {
    const theme: ReportTheme = structuredClone(THEME_INITIAL);
    theme.visualStyles!['*']!['*']!.title = [{ show: false }];
    const { container } = render(<MockVisual theme={theme} visualKey="pieChart" />);
    expect(container.innerHTML).not.toContain('Umsatz nach Produkt');
  });

  it('inherits container formatting from * into a specific visual', () => {
    const theme: ReportTheme = structuredClone(THEME_INITIAL);
    theme.visualStyles!['*']!['*']!.border = [{ show: true, color: solid('#0F0F0F'), width: 3, radius: 6 }];
    const { container } = render(<MockVisual theme={theme} visualKey="gauge" />);
    const rect = container.querySelector('svg > g > rect');
    expect(rect?.getAttribute('stroke')).toBe('#0F0F0F');
    expect(rect?.getAttribute('stroke-width')).toBe('3');
  });
});

describe('$id states in the preview', () => {
  const theme: ReportTheme = {
    name: 'states',
    visualStyles: {
      actionButton: { '*': { fill: [{ show: true, fillColor: solid('#0000AA') }, { $id: 'hover', fillColor: solid('#AA0000') }, { $id: 'disabled', fillColor: solid('#00AA00') }] } },
      advancedSlicerVisual: { '*': { fillCustom: [{ show: true, fillColor: solid('#0000BB') }, { $id: 'selection:selected', fillColor: solid('#BB0000') }] } },
    },
  };
  it('draws the default state unless a state is requested', () => {
    const html = render(<MockVisual theme={theme} visualKey="actionButton" />).container.innerHTML;
    expect(html).toContain('#0000AA');
    expect(html).not.toContain('#AA0000');
  });
  it('draws the requested state and inherits unset properties from the default state', () => {
    const hover = render(<MockVisual theme={theme} visualKey="actionButton" stateId="hover" />).container.innerHTML;
    expect(hover).toContain('#AA0000');
    expect(hover).not.toContain('#0000AA');
    const selected = render(<MockVisual theme={theme} visualKey="actionButton" stateId="selected" />).container.innerHTML;
    expect(selected).toContain('#0000AA'); // no selected entry → default
    const slicer = render(<MockVisual theme={theme} visualKey="advancedSlicerVisual" stateId="selection:selected" />).container.innerHTML;
    expect(slicer).toContain('#BB0000');
  });
  it('renders filter cards per state on the page', () => {
    const t: ReportTheme = { name: 'p', visualStyles: { page: { '*': { filterCard: [{ $id: 'Applied', backgroundColor: solid('#CC0001') }, { $id: 'Available', backgroundColor: solid('#CC0002') }] } } } };
    const { container } = render(<MockVisual theme={t} visualKey="page" width={800} height={450} />);
    expect(container.querySelector('[data-filter-card="Applied"] rect')?.getAttribute('fill')).toBe('#CC0001');
    expect(container.querySelector('[data-filter-card="Available"] rect')?.getAttribute('fill')).toBe('#CC0002');
  });
});

describe('text classes', () => {
  it('feed title, labels and callout values when the cards do not set fonts', () => {
    const t: ReportTheme = { name: 'tc', textClasses: { title: { fontFace: 'Georgia', fontSize: 20, color: '#AB0001', fontWeight: 'bold' }, label: { color: '#AB0002', fontSize: 7 }, callout: { fontFace: 'Impact', color: '#AB0003' } } };
    const bar = render(<MockVisual theme={t} visualKey="barChart" />).container;
    const title = bar.querySelector('text')!;
    expect(title.getAttribute('fill')).toBe('#AB0001');
    expect(title.getAttribute('font-size')).toBe(String(20 * (4 / 3)));
    expect(title.getAttribute('font-weight')).toBe('700');
    expect(title.getAttribute('font-family')).toContain('Georgia');
    expect(bar.innerHTML).toContain('#AB0002'); // axis labels / legend
    const card = render(<MockVisual theme={t} visualKey="card" />).container.innerHTML;
    expect(card).toContain('#AB0003');
    expect(card).toContain('Impact');
  });
  it('are overridden by explicit card values', () => {
    const t: ReportTheme = { name: 'tc', textClasses: { title: { color: '#AB0001', fontSize: 20 } }, visualStyles: { '*': { '*': { title: [{ fontColor: solid('#CD0001'), fontSize: 11 }] } } } };
    const title = render(<MockVisual theme={t} visualKey="pieChart" />).container.querySelector('text')!;
    expect(title.getAttribute('fill')).toBe('#CD0001');
    expect(title.getAttribute('font-size')).toBe(String(11 * (4 / 3)));
  });
  it('fall back to the base theme text classes (DIN 12 for titles) for an empty theme', () => {
    const title = render(<MockVisual theme={{ name: 'empty' }} visualKey="lineChart" />).container.querySelector('text')!;
    expect(title.getAttribute('font-family')).toContain('DIN');
    expect(title.getAttribute('font-size')).toBe(String(12 * (4 / 3)));
  });
});

/**
 * Every (card, property) a renderer reads must exist for that visual in the official schema.
 * Guards against made-up property names (e.g. reading `goalFontSize` where the schema has `fontSize`).
 */
describe('renderer property usage against the schema', () => {
  type Keys = { common: Record<string, number>; page: Record<string, number>; visuals: Record<string, Record<string, number>>; propSets: string[][] };
  const keys = schemaKeys as unknown as Keys;
  const allowed = (visualKey: string, card: string): Set<string> | undefined => {
    const own = visualKey === 'page' ? keys.page : visualKey === '*' ? {} : keys.visuals[visualKey];
    const id = own?.[card] ?? (visualKey === 'page' ? undefined : keys.common[card]);
    return id === undefined ? undefined : new Set(keys.propSets[id]);
  };
  const states = ['default', 'hover', 'selected', 'disabled'];
  it.each([...VISUAL_KEYS, '*', 'page'])('%s reads only schema properties', (visualKey) => {
    const bad = new Set<string>();
    const onRead = (card: string, prop: string) => {
      const set = allowed(visualKey, card);
      if (!set) bad.add(`${card} (card does not exist)`);
      else if (!set.has(prop)) bad.add(`${card}.${prop}`);
    };
    const themes: ReportTheme[] = [THEME_INITIAL, { name: 'empty' }];
    for (const theme of themes) {
      for (const stateId of states) {
        const r = createResolver(theme, visualKey, { stateId: stateId === 'default' ? undefined : stateId, onRead });
        if (visualKey === 'page') {
          render(<svg><PagePreview r={r} width={800} height={450} /></svg>);
        } else {
          const entry = VISUAL_RENDERERS[visualKey];
          render(<svg><VisualFrame r={r} width={600} height={400} uid="t" defaultTitle="t">{(rect) => (entry ? entry.body({ r, rect, uid: 't' }) : null)}</VisualFrame></svg>);
        }
      }
    }
    expect([...bad].sort()).toEqual([]);
  });
});
