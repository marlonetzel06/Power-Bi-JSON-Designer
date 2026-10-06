/**
 * Targeted assertions for the Power BI format features the mock renderers implement
 * (attributes, positions and texts — not just "the colour appears somewhere").
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MockVisual } from './MockVisual';
import { solid, type CardEntry, type ReportTheme } from '@/pbi/types';

function themed(visual: string, cards: Record<string, CardEntry>, extra: Partial<ReportTheme> = {}): ReportTheme {
  return { name: 't', dataColors: ['#111111', '#222222', '#333333'], visualStyles: { [visual]: { '*': Object.fromEntries(Object.entries(cards).map(([k, v]) => [k, [v]])) } }, ...extra };
}
const svg = (visual: string, cards: Record<string, CardEntry>, size: [number, number] = [600, 400], stateId?: string) =>
  render(<MockVisual theme={themed(visual, cards)} visualKey={visual} width={size[0]} height={size[1]} stateId={stateId} />).container;

describe('lines and markers', () => {
  it('draws stepped, smooth and custom-dashed lines', () => {
    const step = svg('lineChart', { lineStyles: { lineChartType: 'step', interpolationStep: 'before' } }).querySelector('[data-part="line"]')!.getAttribute('d')!;
    expect(step).toMatch(/V[\d.]+ H/);
    const smooth = svg('lineChart', { lineStyles: { lineChartType: 'smooth', interpolationSmooth: 'cardinal', interpolationSmoothParam: 30 } }).querySelector('[data-part="line"]')!.getAttribute('d')!;
    expect(smooth).toContain('C');
    const dashed = svg('lineChart', { lineStyles: { lineStyle: 'custom', strokeDashArray: '2 4', strokeWidth: 2 } }).querySelector('[data-part="line"]')!;
    expect(dashed.getAttribute('stroke-dasharray')).toBe('4,8');
    expect(svg('lineChart', { lineStyles: { strokeShow: false } }).querySelector('[data-part="line"]')).toBeNull();
  });
  it('draws markers with the markers card border and legend line+marker', () => {
    const c = svg('lineChart', { lineStyles: { showMarker: true, markerShape: 'diamond', markerSize: 6 }, markers: { borderShow: true, borderColor: solid('#ABCDEF'), borderWidth: 2 }, legend: { show: true, legendMarkerRendering: 'lineAndMarker' } });
    const m = c.querySelector('[data-part="cartesian"] > polygon')!;
    expect(m.getAttribute('stroke')).toBe('#ABCDEF');
    expect(m.getAttribute('stroke-width')).toBe('2');
    expect(c.querySelector('[data-legend-marker="lineMarker"]')).not.toBeNull();
  });
  it('shows series labels at the line end and data labels above/under', () => {
    const c = svg('lineChart', { seriesLabels: { show: true, seriesPosition: 'Right', seriesColor: solid('#AB0000') }, labels: { show: true, labelPosition: 'Under', showSeries: true } });
    expect(c.querySelector('[data-part="series-label"] text')?.getAttribute('fill')).toBe('#AB0000');
    expect(c.querySelector('[data-part="data-label"] text')?.textContent).toMatch(/^Umsatz: /);
  });
  it('adds error bars, anomalies and a forecast when enabled', () => {
    const c = svg('lineChart', { error: { enabled: true, barColor: solid('#AB0001') }, anomalyDetection: { show: true, markerColor: solid('#AB0002') }, forecast: { show: true, lineColor: solid('#AB0003') } });
    expect(c.querySelectorAll('[data-part="error-bar"]').length).toBeGreaterThan(0);
    expect(c.querySelector('[data-part="anomaly-band"]')).not.toBeNull();
    expect(c.querySelector('[data-part="forecast"]')?.getAttribute('stroke')).toBe('#AB0003');
  });
});

describe('axes', () => {
  it('uses one display unit for all ticks and no axis lines', () => {
    const c = svg('clusteredColumnChart', {});
    const labels = [...c.querySelectorAll('[data-part="axis-label"]')].map((t) => t.textContent);
    expect(labels).toContain('0 Tsd.');
    expect(labels.filter((l) => l?.endsWith('Tsd.')).length).toBeGreaterThan(3);
    expect(c.querySelector('[data-part="axis-line"]')).toBeNull();
  });
  it('honours fixed start/end, custom gridline dashes and switched axis position', () => {
    const c = svg('clusteredColumnChart', { valueAxis: { start: 20, end: 100, gridlineShow: true, gridlineDashArray: '1 3', switchAxisPosition: true, labelDisplayUnits: 1000 } });
    const labels = [...c.querySelectorAll('[data-part="axis-label"]')].map((t) => t.textContent);
    expect(labels).toContain('20 Tsd.');
    expect(labels).toContain('100 Tsd.');
    expect(labels).not.toContain('0 Tsd.');
    expect(c.querySelector('[data-part="gridline"]')?.getAttribute('stroke-dasharray')).toBe('1,3');
    const tick = [...c.querySelectorAll('[data-part="axis-label"]')].find((t) => t.textContent === '100 Tsd.')!;
    expect(tick.getAttribute('text-anchor')).toBe('start'); // labels on the right
  });
  it('renders the combo secondary axis with its own scale', () => {
    const c = svg('lineClusteredColumnComboChart', { valueAxis: { secShow: true, secLabelColor: solid('#AB0004') } });
    const sec = c.querySelectorAll('[data-part="secondary-axis"]');
    expect(sec.length).toBeGreaterThan(2);
    expect(sec[0]!.getAttribute('fill')).toBe('#AB0004');
    expect(svg('lineClusteredColumnComboChart', { valueAxis: { secShow: false } }).querySelector('[data-part="secondary-axis"]')).toBeNull();
  });
});

describe('reference lines', () => {
  it('shades, labels and layers value reference lines', () => {
    const c = svg('clusteredColumnChart', { y1AxisReferenceLine: { show: true, value: 50, lineColor: solid('#AB0005'), position: 'front', shadeShow: true, shadeRegion: 'before', shadeColor: solid('#AB0006'), dataLabelShow: true, dataLabelText: 'ValueAndName', displayName: 'Ziel', dataLabelHorizontalPosition: 'right' } });
    const line = c.querySelector('[data-part="reference-line"]')!;
    expect(line.getAttribute('y1')).toBe(line.getAttribute('y2'));
    expect(line.getAttribute('stroke')).toBe('#AB0005');
    expect(c.querySelector('[data-part="reference-shade"]')?.getAttribute('fill')).toMatch(/^#AB0006/);
    const label = c.querySelector('[data-part="reference-label"]')!;
    expect(label.textContent).toMatch(/^Ziel /);
    expect(label.getAttribute('text-anchor')).toBe('end');
  });
  it('draws a vertical category reference line', () => {
    const line = svg('clusteredColumnChart', { xAxisReferenceLine: { show: true, value: 2 } }).querySelector('[data-part="reference-line"]')!;
    expect(line.getAttribute('x1')).toBe(line.getAttribute('x2'));
  });
});

describe('bars, waterfall, scatter', () => {
  it('applies clustered gap size, stacked totals and bar data labels', () => {
    const tight = svg('clusteredColumnChart', { layout: { clusteredGapSize: 0 } }).querySelector('[data-part="bar"]')!;
    const wide = svg('clusteredColumnChart', { layout: { clusteredGapSize: 60 } }).querySelector('[data-part="bar"]')!;
    expect(Number(wide.getAttribute('width'))).toBeLessThan(Number(tight.getAttribute('width')));
    const totals = svg('columnChart', { totals: { show: true, color: solid('#AB0007'), labelDisplayUnits: 1000 } }).querySelectorAll('[data-part="total-label"] text');
    expect(totals.length).toBe(5);
    expect(totals[0]!.getAttribute('fill')).toBe('#AB0007');
    expect(totals[0]!.textContent).toMatch(/Tsd\./);
    const labels = svg('clusteredColumnChart', { labels: { show: true, labelPosition: 'InsideBase' } }).querySelectorAll('[data-part="data-label"]');
    expect(labels.length).toBeGreaterThan(5);
  });
  it('waterfall ends with a total bar and the scatter chart shades and colours by category', () => {
    expect(svg('waterfallChart', {}).querySelectorAll('[data-part="bar"]').length).toBe(6);
    const sc = svg('scatterChart', { plotAreaShading: { show: true, upperShadingColor: solid('#AB0008') }, colorByCategory: { show: true } });
    expect(sc.querySelector('[data-part="shade-upper"]')?.getAttribute('fill')).toMatch(/^#AB0008/);
    const fills = new Set([...sc.querySelectorAll('[data-part="cartesian"] circle')].map((c) => c.getAttribute('fill')));
    expect(fills.size).toBeGreaterThan(1);
    const xLabels = [...sc.querySelectorAll('[data-part="axis-label"]')].map((t) => t.textContent);
    expect(xLabels).toContain('100');
  });
});

describe('container', () => {
  it('wraps long titles, draws inner shadows and a subheader', () => {
    const c = svg('barChart', { title: { show: true, text: 'Ein sehr langer Titel, der auf jeden Fall über die verfügbare Breite hinausgeht und umgebrochen werden muss', titleWrap: true }, dropShadow: { show: true, position: 'Inner' }, subheader: { show: true, fontColor: solid('#AB0009') } }, [300, 300]);
    expect(c.querySelectorAll('[data-part="title"] tspan').length).toBe(2);
    expect(c.querySelector('filter feComponentTransfer')).not.toBeNull();
    expect(c.querySelector('[data-part="subheader"]')?.getAttribute('fill')).toBe('#AB0009');
    expect(svg('barChart', { title: { show: true, text: 'Ein sehr langer Titel, der auf jeden Fall über die verfügbare Breite hinausgeht', titleWrap: false } }, [300, 300]).querySelectorAll('[data-part="title"] tspan').length).toBe(0);
  });
});

describe('tables', () => {
  it('alternates row text colours, shows sparklines, blank rows and a column total', () => {
    const t = svg('tableEx', { values: { fontColorPrimary: solid('#AB0010'), fontColorSecondary: solid('#AB0011') }, sparklines: { dataColor: solid('#AB0012'), chartType: 'column' } });
    const values = [...t.querySelectorAll('[data-part="value"]')].map((v) => v.getAttribute('fill'));
    expect(values).toContain('#AB0010');
    expect(values).toContain('#AB0011');
    expect(t.querySelector('[data-part="sparkline"]')?.getAttribute('fill')).toBe('#AB0012');
    const m = svg('pivotTable', { blankRows: { showBlankRows: true, blankRowColor: solid('#AB0013') }, subTotals: { columnSubtotals: true, rowSubtotalsPosition: 'Top' }, columnTotal: { backColor: solid('#AB0014') } });
    expect(m.querySelector('[data-part="blank-row"]')?.getAttribute('fill')).toBe('#AB0013');
    expect(m.innerHTML).toContain('#AB0014');
  });
});

describe('cards, KPI, slicers, buttons', () => {
  it('card visual: tile shape, label text, reference label detail and value units', () => {
    const c = svg('cardVisual', { shapeCustomRectangle: { tileShape: 'pill' }, label: { show: true, text: 'Kennzahl' }, referenceLabelDetail: { show: true, detailFontColor: solid('#AB0015') }, value: { labelDisplayUnits: 1000000, labelPrecision: 2 } }, [320, 220]);
    expect(c.querySelector('[data-part="card-fill"] rect')?.getAttribute('rx')).not.toBe('7');
    expect(c.querySelector('[data-part="card-label"]')?.textContent).toBe('Kennzahl');
    expect(c.querySelector('[data-part="card-value"]')?.textContent).toBe('4,74 Mio.');
    expect([...c.querySelectorAll('[data-part="reference-label"] text')].some((t) => t.getAttribute('fill') === '#AB0015')).toBe(true);
  });
  it('KPI: status direction flips the colour, distance label shows value and percent, last date appears', () => {
    const neg = svg('kpi', { status: { direction: 'Negative', badColor: solid('#AB0016') }, goals: { distanceLabel: 'Value, percent' }, lastDate: { show: true } });
    expect(neg.querySelector('[data-part="kpi-icon"]')?.getAttribute('fill')).toBe('#AB0016');
    expect(neg.querySelector('[data-part="kpi-distance"]')?.textContent).toMatch(/\(\+/);
    expect(neg.querySelector('[data-part="kpi-date"]')).not.toBeNull();
  });
  it('button slicer: selected tile uses the selection state, label and selection icon render', () => {
    const c = svg('advancedSlicerVisual', { label: { show: true }, selectionIcon: { show: true, color: solid('#AB0017') } });
    const theme: ReportTheme = { name: 's', visualStyles: { advancedSlicerVisual: { '*': { fillCustom: [{ show: true, fillColor: solid('#0000BB') }, { $id: 'selection:selected', fillColor: solid('#BB0000') }] } } } };
    const sel = render(<MockVisual theme={theme} visualKey="advancedSlicerVisual" width={320} height={160} />).container;
    expect(sel.querySelector('[data-part="slicer-tile"][data-selected]')?.getAttribute('fill')).toBe('#BB0000');
    expect(sel.querySelector('[data-part="slicer-tile"]:not([data-selected])')?.getAttribute('fill')).toBe('#0000BB');
    expect(c.querySelector('[data-part="slicer-label"]')).not.toBeNull();
    expect(c.querySelector('[data-part="selection-icon"]')?.getAttribute('stroke')).toBe('#AB0017');
  });
  it('classic slicer: search box, select-all item and relative date mode', () => {
    expect(svg('slicer', { searchBox: { background: solid('#AB0018') } }).querySelector('[data-part="slicer-search"]')?.getAttribute('fill')).toBe('#AB0018');
    expect(svg('slicer', { selection: { selectAllCheckboxEnabled: true } }).innerHTML).toContain('Alle auswählen');
    expect(svg('slicer', { data: { mode: 'Relative' }, date: { background: solid('#AB0019') } }).querySelector('[data-part="slicer-date"]')?.getAttribute('fill')).toBe('#AB0019');
  });
  it('buttons: icon, shadow preset, rotation and tile shapes', () => {
    const c = svg('actionButton', { icon: { show: true, shapeType: 'rightArrow', lineColor: solid('#AB0020') }, shadow: { show: true, shadowPositionPreset: 'topLeft', shadowDistance: 4 }, rotation: { angle: 10 }, shape: { tileShape: 'hexagon' } });
    expect(c.querySelector('[data-part="button-icon"] path')?.getAttribute('stroke')).toBe('#AB0020');
    expect(c.querySelector('feDropShadow')?.getAttribute('dx')).toBe('-4');
    expect(c.innerHTML).toContain('rotate(10 ');
    expect(c.querySelector('[data-part="button-face"] polygon')).not.toBeNull();
  });
});

describe('remaining visuals', () => {
  it('treemap squarified tiles with a fill override, map heat layer, funnel outside labels, page search box', () => {
    const tm = svg('treemap', { layout: { tilingMethod: 'stableSquarified' }, dataPoint: { fill: solid('#AB0021') } });
    const tiles = tm.querySelectorAll('[data-part="treemap-tile"]');
    expect(tiles.length).toBe(5);
    expect(tiles[0]!.getAttribute('fill')).toBe('#AB0021');
    expect(svg('map', { heatMap: { show: true } }).querySelector('[data-part="heat-map"]')).not.toBeNull();
    expect(svg('funnel', { labels: { show: true, labelPosition: 'OutsideEnd' } }).querySelector('[data-part="data-label"] text')?.getAttribute('text-anchor')).toBe('start');
    expect(svg('page', { outspacePane: { inputBoxColor: solid('#AB0022') } }, [800, 450]).querySelector('[data-part="filter-search"]')?.getAttribute('fill')).toBe('#AB0022');
  });
});
