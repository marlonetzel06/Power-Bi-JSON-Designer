import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MockVisual } from './MockVisual';
import { VISUAL_RENDERERS } from './registry';
import { THEME_INITIAL } from '@/pbi/defaults';
import { VISUAL_KEYS } from '@/pbi/curation/selection';
import { solid, type ReportTheme } from '@/pbi/types';

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
