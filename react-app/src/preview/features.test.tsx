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
    const m = c.querySelector('[data-part="cartesian"] g[clip-path] > polygon')!; // markers are clipped to the plot
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
  it('clips values to a fixed range and ignores an end at or below the start', () => {
    // range 20…60 cuts the bars (sample values go up to 81): no bar may leave the plot
    const c = svg('clusteredColumnChart', { valueAxis: { start: 20, end: 60 } });
    const grid = [...c.querySelectorAll('[data-part="gridline"]')].map((g) => Number(g.getAttribute('y1')));
    const plotTop = Math.min(...grid);
    for (const bar of c.querySelectorAll('[data-part="bar"]')) expect(Number(bar.getAttribute('y'))).toBeGreaterThanOrEqual(plotTop - 0.01);
    const labels = [...c.querySelectorAll('[data-part="axis-label"]')].map((t) => t.textContent);
    expect(labels).not.toContain('80 Tsd.');
    // lines are clipped via clipPath instead of being cut point by point
    const line = svg('lineChart', { valueAxis: { start: 30, end: 60 } });
    expect(line.querySelector('clipPath rect')).not.toBeNull();
    expect(line.querySelector('g[clip-path] [data-part="line"]')).not.toBeNull();
    // end <= start: the end is dropped, the axis stays automatic above the start
    const bad = [...svg('clusteredColumnChart', { valueAxis: { start: 20, end: 10 } }).querySelectorAll('[data-part="axis-label"]')].map((t) => t.textContent);
    expect(bad).toContain('80 Tsd.');
    expect(bad).not.toContain('0 Tsd.');
  });
  it('keeps the secondary axis inside its range and the switched primary axis on the left', () => {
    // the secondary axis never shows ticks below its start / above its end
    const sec = [...svg('lineClusteredColumnComboChart', { valueAxis: { secShow: true, secStart: 40, secEnd: 70 } }).querySelectorAll('[data-part="secondary-axis"]')].map((t) => t.textContent);
    expect(sec[0]).toBe('40 Tsd.');
    expect(sec[sec.length - 1]).toBe('70 Tsd.');
    // a switched primary axis stays left when a secondary axis occupies the right
    const c = svg('lineClusteredColumnComboChart', { valueAxis: { secShow: true, switchAxisPosition: true } });
    const tick = [...c.querySelectorAll('[data-part="axis-label"]')].find((t) => t.textContent === '0 Tsd.')!;
    expect(tick.getAttribute('text-anchor')).toBe('end');
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
  it('draws a vertical category reference line, by index or by category name', () => {
    const byIndex = svg('clusteredColumnChart', { xAxisReferenceLine: { show: true, value: 2 } }).querySelector('[data-part="reference-line"]')!;
    expect(byIndex.getAttribute('x1')).toBe(byIndex.getAttribute('x2'));
    const byName = svg('clusteredColumnChart', { xAxisReferenceLine: { show: true, value: 'West' } }).querySelector('[data-part="reference-line"]')!;
    expect(byName.getAttribute('x1')).toBe(byIndex.getAttribute('x1'));
  });
  it('treats a reference value of 0 as a value and shades towards lower values from the scale', () => {
    const zero = svg('clusteredColumnChart', { valueAxis: { start: -20 }, y1AxisReferenceLine: { show: true, value: 0, shadeShow: true, shadeRegion: 'before' } });
    const line = zero.querySelector('[data-part="reference-line"]')!;
    const shade = zero.querySelector('[data-part="reference-shade"]')!;
    // "before" = below the line in a column chart: the shade starts at the line
    expect(Number(shade.getAttribute('y'))).toBeCloseTo(Number(line.getAttribute('y1')), 3);
    const inv = svg('clusteredColumnChart', { valueAxis: { invertAxis: true }, y1AxisReferenceLine: { show: true, value: 40, shadeShow: true, shadeRegion: 'before' } });
    const invLine = inv.querySelector('[data-part="reference-line"]')!;
    const invShade = inv.querySelector('[data-part="reference-shade"]')!;
    // inverted axis: lower values are above the line
    expect(Number(invShade.getAttribute('y')) + Number(invShade.getAttribute('height'))).toBeCloseTo(Number(invLine.getAttribute('y1')), 3);
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
  it('overlaps clustered bars only when clusteredGapOverlaps is on, and flips labels with invertAxis', () => {
    const bars = (layout: CardEntry) => [...svg('clusteredColumnChart', { layout }).querySelectorAll('[data-part="bar"]')].map((b) => ({ x: Number(b.getAttribute('x')), w: Number(b.getAttribute('width')) }));
    const plain = bars({ clusteredGapSize: 40 });
    const overlapped = bars({ clusteredGapSize: 40, clusteredGapOverlaps: true });
    // the second bar of a cluster starts inside the first one only with the overlap switch on
    expect(plain[1]!.x).toBeGreaterThanOrEqual(plain[0]!.x + plain[0]!.w - 0.01);
    expect(overlapped[1]!.x).toBeLessThan(overlapped[0]!.x + overlapped[0]!.w);
    const normal = svg('clusteredColumnChart', { labels: { show: true, labelPosition: 'OutsideEnd' } });
    const inverted = svg('clusteredColumnChart', { valueAxis: { invertAxis: true }, labels: { show: true, labelPosition: 'OutsideEnd' } });
    const barEnd = (c: Element, inv: boolean) => { const b = c.querySelector('[data-part="bar"]')!; return Number(b.getAttribute('y')) + (inv ? Number(b.getAttribute('height')) : 0); };
    expect(Number(normal.querySelector('[data-part="data-label"] text')!.getAttribute('y'))).toBeLessThan(barEnd(normal, false));
    expect(Number(inverted.querySelector('[data-part="data-label"] text')!.getAttribute('y'))).toBeGreaterThan(barEnd(inverted, true));
    // vertical labels are centred on the column and anchored at the column end
    const vertical = svg('clusteredColumnChart', { labels: { show: true, labelPosition: 'OutsideEnd', labelOrientation: 0 } }).querySelector('[data-part="data-label"]')!;
    expect(vertical.getAttribute('transform')).toMatch(/^rotate\(-90/);
    expect(vertical.querySelector('text')!.getAttribute('text-anchor')).toBe('start');
  });
  it('scatter: fixed X range, decimals from the tick step and the waterfall keeps negative labels', () => {
    const sc = svg('scatterChart', { categoryAxis: { start: 10, end: 30 }, valueAxis: { start: 20 } });
    const labels = [...sc.querySelectorAll('[data-part="axis-label"]')].map((t) => t.textContent);
    expect(labels).toContain('10');
    expect(labels).toContain('30');
    expect(labels).not.toContain('0'); // Y starts at 20, X at 10
    const fine = [...svg('scatterChart', { categoryAxis: { start: 0, end: 1 } }).querySelectorAll('[data-part="axis-label"]')].map((t) => t.textContent);
    expect(fine).toContain('0,2');
    const wf = [...svg('waterfallChart', { labels: { show: true } }).querySelectorAll('[data-part="data-label"] text')].map((t) => t.textContent);
    expect(wf.some((t) => t?.startsWith('-'))).toBe(true);
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
    // the container shadow is painted from an opaque stand-in, so a transparent background still casts it
    const faint = svg('barChart', { background: { show: true, transparency: 100 }, dropShadow: { show: true } }, [300, 300]);
    expect(faint.querySelector('[data-part="shadow"]')?.getAttribute('fill')).toBe('#000000');
    expect(faint.querySelector('[data-part="frame"]')?.getAttribute('filter')).toBeNull();
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
    const pill = c.querySelector('[data-part="card-fill"] rect')!;
    expect(pill).not.toBeNull();
    expect(Number(pill.getAttribute('rx'))).toBeCloseTo(Math.min(Number(pill.getAttribute('width')), Number(pill.getAttribute('height'))) / 2, 3);
    expect(c.querySelector('[data-part="card-label"]')?.textContent).toBe('Kennzahl');
    expect(c.querySelector('[data-part="card-value"]')?.textContent).toBe('4,74 Mio.');
    expect([...c.querySelectorAll('[data-part="reference-label"] text')].some((t) => t.getAttribute('fill') === '#AB0015')).toBe(true);
  });
  it('KPI: status direction flips the colour, distance label shows value and percent, last date appears', () => {
    const neg = svg('kpi', { status: { direction: 'Negative', badColor: solid('#AB0016') }, goals: { distanceLabel: 'Value, percent' }, lastDate: { show: true } });
    expect(neg.querySelector('[data-part="kpi-icon"]')?.getAttribute('fill')).toBe('#AB0016');
    expect(neg.querySelector('[data-part="kpi-distance"]')?.textContent).toMatch(/\(\+/);
    expect(neg.querySelector('[data-part="kpi-date"]')).not.toBeNull();
    // the status colour follows status.direction only; goals.direction flips the sign of the distance
    const low = svg('kpi', { status: { direction: 'Positive', goodColor: solid('#AB0030') }, goals: { direction: 'Low is good', distanceLabel: 'Percent' } });
    expect(low.querySelector('[data-part="kpi-icon"]')?.getAttribute('fill')).toBe('#AB0030');
    expect(low.querySelector('[data-part="kpi-distance"]')?.textContent).toMatch(/^-/);
    expect(svg('kpi', { goals: { direction: 'High is good' } }).querySelector('[data-part="kpi-distance"]')?.textContent).toMatch(/^\+/);
  });
  it('card visual: shadow and glow render in one filter, centred reference block on flat tiles', () => {
    const c = svg('cardVisual', { shadowCustom: { show: true }, glowCustom: { show: true, color: solid('#AB0031') }, referenceLabelLayout: { position: 'right' } }, [560, 90]);
    const filter = c.querySelector('[data-part="card-fill"]')!.getAttribute('filter')!;
    expect(filter).toMatch(/^url\(#/);
    const def = c.querySelector(`filter[id="${filter.slice(5, -1)}"]`)!;
    expect(def.querySelectorAll('feFlood').length).toBe(2);
    expect([...def.querySelectorAll('feFlood')].some((f) => f.getAttribute('flood-color') === '#AB0031')).toBe(true);
    const tile = c.querySelector('[data-part="card-fill"] rect')!;
    const ref = [...c.querySelectorAll('[data-part="reference-label"] text')];
    expect(ref.length).toBeGreaterThan(0);
    const ys = ref.map((t) => Number(t.getAttribute('y')));
    const tileMid = Number(tile.getAttribute('y')) + Number(tile.getAttribute('height')) / 2;
    expect(Math.min(...ys)).toBeLessThan(tileMid);
    expect(Math.max(...ys)).toBeGreaterThan(tileMid - 2);
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
    // the horizontal list has no search box and is limited by the width, not the height
    const horizontal = svg('slicer', { data: { mode: 'HorizontalList' }, searchBox: { background: solid('#AB0018') } }, [600, 60]);
    expect(horizontal.querySelector('[data-part="slicer-search"]')).toBeNull();
    expect(horizontal.querySelectorAll('[data-part="slicer-item"]').length).toBeGreaterThan(1);
  });
  it('button slicer: the fallback highlight yields to a theme font colour and a selected-state fill', () => {
    const own = svg('advancedSlicerVisual', { value: { fontColor: solid('#AB0032') } });
    const selectedText = [...own.querySelectorAll('[data-part="slicer-value"]')][1]!;
    expect(selectedText.getAttribute('fill')).toBe('#AB0032');
    const theme: ReportTheme = { name: 's', visualStyles: { advancedSlicerVisual: { '*': { fillCustom: [{ $id: 'selection:selected', fillColor: solid('#BB0001') }] } } } };
    const sel = render(<MockVisual theme={theme} visualKey="advancedSlicerVisual" width={320} height={160} />).container;
    expect(sel.querySelector('[data-part="slicer-tile"][data-selected]')?.getAttribute('fill')).toBe('#BB0001');
  });
  it('navigators render the current page in the selected state', () => {
    const theme: ReportTheme = { name: 'n', visualStyles: { pageNavigator: { '*': { fill: [{ fillColor: solid('#0000CC') }, { $id: 'selected', fillColor: solid('#CC0000') }] } } } };
    const c = render(<MockVisual theme={theme} visualKey="pageNavigator" width={400} height={60} />).container;
    const faces = [...c.querySelectorAll('[data-part="button-face"]')];
    expect(faces[0]!.getAttribute('fill')).toBe('#CC0000');
    expect(faces[1]!.getAttribute('fill')).toBe('#0000CC');
    // explicit state: every tile shows it
    const hover = render(<MockVisual theme={theme} visualKey="pageNavigator" width={400} height={60} stateId="hover" />).container;
    expect(new Set([...hover.querySelectorAll('[data-part="button-face"]')].map((f) => f.getAttribute('fill'))).size).toBe(1);
  });
  it('buttons: shadow and glow together produce one filter with both effects', () => {
    const c = svg('actionButton', { shadow: { show: true }, glow: { show: true, color: solid('#AB0033') } });
    const face = c.querySelector('[data-part="button-face"]')!;
    const def = c.querySelector(`filter[id="${face.getAttribute('filter')!.slice(5, -1)}"]`)!;
    expect(def.querySelectorAll('feFlood').length).toBe(2);
    expect([...def.querySelectorAll('feFlood')].some((f) => f.getAttribute('flood-color') === '#AB0033')).toBe(true);
  });
  it('buttons: icon, shadow preset, rotation and tile shapes', () => {
    const c = svg('actionButton', { icon: { show: true, shapeType: 'rightArrow', lineColor: solid('#AB0020') }, shadow: { show: true, shadowPositionPreset: 'topLeft', shadowDistance: 4 }, rotation: { angle: 10 }, shape: { tileShape: 'hexagon' } });
    expect(c.querySelector('[data-part="button-icon"] path')?.getAttribute('stroke')).toBe('#AB0020');
    expect(c.querySelector('filter feOffset[dx="-4"]')).not.toBeNull();
    expect(c.innerHTML).toContain('rotate(10 ');
    expect(c.querySelector('[data-part="button-face"] polygon')).not.toBeNull();
  });
});

describe('page', () => {
  it('shows all three filter cards above the apply button at 16:9', () => {
    for (const size of [[640, 360], [1280, 720], [320, 180]] as [number, number][]) {
      const c = svg('page', {}, size);
      expect(c.querySelectorAll('[data-filter-card]').length, `${size[0]}x${size[1]}`).toBe(3);
    }
    expect(svg('page', {}, [640, 360]).querySelectorAll('[data-filter-card="Available"]').length).toBe(2);
  });
});

describe('remaining visuals', () => {
  it('treemap squarified tiles with a fill override, map heat layer, funnel outside labels, page search box', () => {
    const tm = svg('treemap', { layout: { tilingMethod: 'stableSquarified' }, dataPoint: { fill: solid('#AB0021') } });
    const tiles = tm.querySelectorAll('[data-part="treemap-tile"]');
    expect(tiles.length).toBe(5);
    expect(tiles[0]!.getAttribute('fill')).toBe('#AB0021');
    expect(svg('map', { heatMap: { show: true } }).querySelector('[data-part="heat-map"]')).not.toBeNull();
    const funnelLabels = [...svg('funnel', { labels: { show: true, labelPosition: 'OutsideEnd' } }).querySelectorAll('[data-part="data-label"] text')];
    expect(funnelLabels[funnelLabels.length - 1]?.getAttribute('text-anchor')).toBe('start');
    expect(funnelLabels[0]?.getAttribute('text-anchor')).toBe('middle'); // the widest bar has no room outside → inside
    expect(svg('page', { outspacePane: { inputBoxColor: solid('#AB0022') } }, [800, 450]).querySelector('[data-part="filter-search"]')?.getAttribute('fill')).toBe('#AB0022');
  });
});
