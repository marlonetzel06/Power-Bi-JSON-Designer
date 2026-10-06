/** No renderer may emit NaN/undefined attribute values at any size (they surface as browser console errors). */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MockVisual } from './MockVisual';
import { THEME_INITIAL } from '@/pbi/defaults';
import { VISUAL_KEYS } from '@/pbi/curation/selection';
import { getVisualStates } from '@/pbi/catalog';
import { solid, type ReportTheme } from '@/pbi/types';

/** A theme that switches on the optional features every renderer offers (labels, lines, icons, …). */
const FEATURE_RICH: ReportTheme = {
  ...THEME_INITIAL,
  visualStyles: {
    ...THEME_INITIAL.visualStyles,
    '*': {
      '*': {
        ...THEME_INITIAL.visualStyles?.['*']?.['*'],
        labels: [{ show: true, enableBackground: true, labelPosition: 'OutsideEnd', showSeries: true }],
        totals: [{ show: true, enableBackground: true }],
        error: [{ enabled: true, labelShow: true, shadeShow: true }],
        y1AxisReferenceLine: [{ show: true, value: 0, shadeShow: true, shadeRegion: 'before', dataLabelShow: true }],
        xAxisReferenceLine: [{ show: true, value: 'West', dataLabelShow: true }],
        trend: [{ show: true }],
        forecast: [{ show: true }],
        anomalyDetection: [{ show: true }],
        lineStyles: [{ showMarker: true, lineChartType: 'smooth', interpolationSmooth: 'cardinal', interpolationSmoothParam: 100 }],
        seriesLabels: [{ show: true, enableBackground: true }],
        zoom: [{ show: true }],
        valueAxis: [{ start: 10, end: 60, switchAxisPosition: true, invertAxis: true, showAxisTitle: true, secShow: true, secStart: 20, secEnd: 10 }],
        categoryAxis: [{ invertAxis: true, showAxisTitle: true, gridlineShow: true, start: 5, end: 1 }],
        sparklines: [{ markers: 1 }],
        blankRows: [{ showBlankRows: true, showBorder: true }],
        subheader: [{ show: true, position: 'bottom' }],
        dropShadow: [{ show: true, position: 'Inner', shadowSpread: 3 }],
        shadowCustom: [{ show: true }],
        glowCustom: [{ show: true }],
        shadow: [{ show: true }],
        glow: [{ show: true }],
        icon: [{ show: true, shapeType: 'help' }],
        image: [{ show: true }],
        referenceLabelDetail: [{ show: true }],
        referenceLabelLayout: [{ position: 'right' }],
        selectionIcon: [{ show: true }],
        searchBox: [{ background: solid('#EEEEEE') }],
        lastDate: [{ show: true }],
        goals: [{ labelPrecision: -3 }],
        heatMapLayer: [{ show: true }],
        plotAreaShading: [{ show: true }],
        ratioLine: [{ show: true }],
        colorByCategory: [{ show: true }],
        layout: [{ clusteredGapOverlaps: true, clusteredGapOverlapReverse: true, seriesOrderReversed: true }],
        percentBarLabel: [{ show: true }],
      },
    },
  },
};

const BAD = /NaN|undefined|Infinity/;
function check(container: HTMLElement, label: string, bad: string[]): void {
  for (const el of container.querySelectorAll('*')) {
    for (const a of el.getAttributeNames()) {
      const v = el.getAttribute(a) ?? '';
      if (BAD.test(v)) bad.push(`${label} <${el.tagName}> ${a}=${v}`);
      // negative sizes are invalid SVG (the browser drops the element and logs an error)
      if ((a === 'width' || a === 'height' || a === 'r' || a === 'rx' || a === 'ry') && v !== '' && !v.endsWith('%') && Number(v) < 0) bad.push(`${label} <${el.tagName}> ${a}=${v}`);
    }
    if (el.tagName === 'text' && BAD.test(el.textContent ?? '')) bad.push(`${label} <text> "${el.textContent}"`);
  }
}

describe('renderer attribute sanity', () => {
  it.each([...VISUAL_KEYS, '*', 'page'])('%s has no NaN, Infinity, undefined or negative sizes at common sizes', (key) => {
    const bad: string[] = [];
    for (const [w, h] of [[600, 400], [240, 150], [220, 80], [1280, 720], [60, 40]] as const) {
      check(render(<MockVisual theme={THEME_INITIAL} visualKey={key} width={w} height={h} />).container, `${w}x${h}`, bad);
    }
    expect(bad).toEqual([]);
  });
  it.each([...VISUAL_KEYS, '*', 'page'])('%s stays sane with every optional feature switched on', (key) => {
    const bad: string[] = [];
    for (const [w, h] of [[600, 400], [220, 80]] as const) check(render(<MockVisual theme={FEATURE_RICH} visualKey={key} width={w} height={h} />).container, `${w}x${h}`, bad);
    expect(bad).toEqual([]);
  });
  it.each(VISUAL_KEYS.filter((k) => getVisualStates(k)))('%s renders every $id state without invalid attributes', (key) => {
    const bad: string[] = [];
    for (const state of getVisualStates(key) ?? []) check(render(<MockVisual theme={FEATURE_RICH} visualKey={key} width={400} height={120} stateId={state} />).container, state, bad);
    expect(bad).toEqual([]);
  });
});
