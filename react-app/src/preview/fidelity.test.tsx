/**
 * Every curated visual must reflect the theme: container cards (title, background, border),
 * data colours and one visual-specific card each.
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MockVisual } from './MockVisual';
import { THEME_INITIAL } from '@/pbi/defaults';
import { VISUAL_KEYS } from '@/pbi/curation/selection';
import { solid, type CardEntry, type ReportTheme } from '@/pbi/types';

// Slicers and the scorecard use their own header card instead of the visual title (as in Power BI).
const NO_TITLE = new Set(['actionButton', 'bookmarkNavigator', 'pageNavigator', 'shape', 'image', 'textbox', 'slicer', 'scorecard']);
const NO_DATA_COLORS = new Set(['tableEx', 'pivotTable', 'textbox', 'image', 'shape', 'actionButton', 'bookmarkNavigator', 'pageNavigator', 'slicer', 'listSlicer', 'textSlicer', 'advancedSlicerVisual', 'card', 'cardVisual', 'multiRowCard', 'keyDriversVisual', 'scorecard', 'filledMap', 'shapeMap', 'decompositionTreeVisual', 'waterfallChart', 'kpi', 'gauge']);

/** One visual-specific property per visual whose colour must show up in the SVG. */
const SPECIFIC: Record<string, [card: string, prop: string, extra?: Record<string, unknown>]> = {
  barChart: ['categoryAxis', 'labelColor'], clusteredBarChart: ['valueAxis', 'gridlineColor', { gridlineShow: true }], hundredPercentStackedBarChart: ['labels', 'color', { show: true }],
  columnChart: ['legend', 'labelColor', { show: true }], clusteredColumnChart: ['valueAxis', 'labelColor'], hundredPercentStackedColumnChart: ['categoryAxis', 'labelColor'],
  lineChart: ['legend', 'labelColor', { show: true }], areaChart: ['valueAxis', 'labelColor'], stackedAreaChart: ['categoryAxis', 'labelColor'], hundredPercentStackedAreaChart: ['valueAxis', 'labelColor'],
  lineClusteredColumnComboChart: ['y2Axis', 'secLabelColor', { show: true }], lineStackedColumnComboChart: ['valueAxis', 'labelColor'], ribbonChart: ['categoryAxis', 'labelColor'], waterfallChart: ['sentimentColors', 'increaseFill'],
  scatterChart: ['valueAxis', 'labelColor'], funnel: ['percentBarLabel', 'color', { show: true }], pieChart: ['labels', 'color', { show: true }], donutChart: ['legend', 'labelColor', { show: true }], treemap: ['categoryLabels', 'color', { show: true }],
  map: ['legend', 'labelColor', { show: true }], filledMap: ['legend', 'labelColor', { show: true }], shapeMap: ['legend', 'labelColor', { show: true }], azureMap: ['legend', 'labelColor', { show: true }],
  cardVisual: ['value', 'fontColor'], card: ['labels', 'color'], multiRowCard: ['dataLabels', 'color'], kpi: ['indicator', 'fontColor'], gauge: ['calloutValue', 'color', { show: true }],
  tableEx: ['columnHeaders', 'fontColor'], pivotTable: ['rowHeaders', 'fontColor'],
  slicer: ['items', 'fontColor'], advancedSlicerVisual: ['value', 'fontColor'], listSlicer: ['value', 'fontColor'], textSlicer: ['inputTextBox', 'borderColor'],
  decompositionTreeVisual: ['levelHeader', 'levelTitleFontColor'], keyDriversVisual: ['keyInfluencersVisual', 'primaryColor'], scorecard: ['scorecard', 'foregroundColor'],
  actionButton: ['text', 'fontColor', { show: true }], bookmarkNavigator: ['text', 'fontColor', { show: true }], pageNavigator: ['text', 'fontColor', { show: true }], textbox: ['text', 'color'], shape: ['fill', 'fillColor', { show: true }],
};

function withChanges(key: string): ReportTheme {
  const theme: ReportTheme = structuredClone(THEME_INITIAL);
  theme.dataColors = ['#AA0001', '#AA0002', '#AA0003', '#AA0004', '#AA0005'];
  const vs = (theme.visualStyles![key] ??= { '*': {} });
  const cards = (vs['*'] ??= {});
  cards.title = [{ show: true, text: 'Testtitel XYZ', fontColor: solid('#BB0001'), fontSize: 21 }];
  cards.background = [{ show: true, color: solid('#BB0002'), transparency: 0 }];
  cards.border = [{ show: true, color: solid('#BB0003'), width: 3 }];
  const spec = SPECIFIC[key];
  if (spec) cards[spec[0]] = [{ ...(spec[2] ?? {}), [spec[1]]: solid('#BB0004') } as CardEntry];
  return theme;
}

describe('theme fidelity per visual', () => {
  it.each(VISUAL_KEYS)('%s reflects title, background, border, data colours and a visual card', (key) => {
    const { container } = render(<MockVisual theme={withChanges(key)} visualKey={key} width={600} height={400} />);
    const html = container.innerHTML.toUpperCase();
    if (!NO_TITLE.has(key)) {
      expect(html, 'title text').toContain('TESTTITEL XYZ');
      expect(html, 'title colour').toContain('#BB0001');
      expect(container.querySelector('text')?.getAttribute('font-size'), 'title size 21pt').toBe(String(21 * (4 / 3)));
    }
    expect(html, 'background colour').toContain('#BB0002');
    expect(html, 'border colour').toContain('#BB0003');
    if (!NO_DATA_COLORS.has(key)) expect(html, 'first data colour').toContain('#AA0001');
    if (SPECIFIC[key]) expect(html, `${SPECIFIC[key][0]}.${SPECIFIC[key][1]}`).toContain('#BB0004');
  });

  it('renders deterministically (same theme → same markup)', () => {
    const a = render(<MockVisual theme={THEME_INITIAL} visualKey="lineChart" />).container.innerHTML;
    const b = render(<MockVisual theme={THEME_INITIAL} visualKey="lineChart" />).container.innerHTML;
    const norm = (h: string) => h.replace(/_r_[0-9a-z]+_/g, 'uid');
    expect(norm(a)).toBe(norm(b));
  });
});
