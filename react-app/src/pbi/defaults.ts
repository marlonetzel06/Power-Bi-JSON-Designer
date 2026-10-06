import type { ReportTheme } from './types';
import { solid } from './types';

const FONT = 'Segoe UI';
const FONT_SEMI = 'Segoe UI Semibold';
const PRIMARY = '#0F4C81';
const MUTED = '#666666';
const LINE = '#E0E0E0';
const BG_ALT = '#F0F6FB';

const legend = (position = 'Top') => [{ show: true, position, showTitle: false, labelColor: solid('#444444'), fontFamily: FONT, fontSize: 10 }];
const categoryAxis = (gridlineShow = false) => [{ show: true, fontSize: 11, fontFamily: FONT, showAxisTitle: false, labelColor: solid(MUTED), gridlineShow, gridlineColor: solid(LINE) }];
const valueAxis = () => [{ show: true, fontSize: 11, fontFamily: FONT, showAxisTitle: false, labelColor: solid(MUTED), gridlineShow: true, gridlineColor: solid(LINE) }];
const labels = (show = false, extra: Record<string, unknown> = {}) => [{ show, fontSize: 9, fontFamily: FONT, color: solid('#333333'), ...extra }];
const cartesian = (opts: { labels?: boolean; categoryGrid?: boolean; legendPos?: string } = {}) => ({
  legend: legend(opts.legendPos),
  categoryAxis: categoryAxis(opts.categoryGrid),
  valueAxis: valueAxis(),
  labels: labels(opts.labels ?? false),
});

/**
 * The designer's starting theme. Uses the real Power BI card and property names
 * (validated against the schema in builder.test.ts).
 */
export const THEME_INITIAL: ReportTheme = {
  name: 'Custom Theme',
  dataColors: ['#0F4C81', '#1F8AC0', '#3BBFCE', '#70C1B3', '#F4A261', '#E76F51', '#264653', '#2A9D8F'],
  foreground: '#252423',
  background: '#FFFFFF',
  firstLevelElements: '#252423',
  secondLevelElements: '#605E5C',
  thirdLevelElements: '#F3F2F1',
  fourthLevelElements: '#B3B0AD',
  secondaryBackground: '#C8C6C4',
  tableAccent: '#1F8AC0',
  good: '#1AAB40',
  neutral: '#D9B300',
  bad: '#D64554',
  maximum: '#1F8AC0',
  center: '#FFFFFF',
  minimum: '#E76F51',
  null: '#A0A0A0',
  textClasses: {
    label: { fontFace: FONT, fontSize: 10, color: '#252423' },
    title: { fontFace: FONT, fontSize: 12, color: PRIMARY },
    callout: { fontFace: 'DIN', fontSize: 45, color: '#252423' },
    header: { fontFace: FONT_SEMI, fontSize: 12, color: '#252423' },
  },
  visualStyles: {
    '*': {
      '*': {
        background: [{ show: false, color: solid('#FFFFFF'), transparency: 0 }],
        border: [{ show: false, color: solid(LINE), width: 1, radius: 0 }],
        dropShadow: [{ show: false }],
        visualHeader: [{ show: true }],
        title: [{ show: true, fontFamily: FONT, fontSize: 14, fontColor: solid(PRIMARY), alignment: 'left', bold: true }],
        subTitle: [{ show: false, fontFamily: FONT, fontSize: 11, fontColor: solid(MUTED) }],
      },
    },
    barChart: { '*': cartesian({ categoryGrid: false }) },
    clusteredBarChart: { '*': cartesian() },
    hundredPercentStackedBarChart: { '*': { ...cartesian(), labels: labels(true, { color: solid('#FFFFFF') }) } },
    columnChart: { '*': cartesian() },
    clusteredColumnChart: { '*': cartesian() },
    hundredPercentStackedColumnChart: { '*': { ...cartesian(), labels: labels(true, { color: solid('#FFFFFF') }) } },
    lineChart: { '*': { ...cartesian(), lineStyles: [{ strokeWidth: 2, showMarker: false, markerSize: 3 }] } },
    areaChart: { '*': cartesian() },
    stackedAreaChart: { '*': cartesian() },
    hundredPercentStackedAreaChart: { '*': cartesian() },
    ribbonChart: { '*': cartesian() },
    waterfallChart: {
      '*': {
        legend: legend(),
        categoryAxis: [{ show: true, fontSize: 11, fontFamily: FONT, labelColor: solid(MUTED) }],
        valueAxis: valueAxis(),
        labels: labels(true),
        sentimentColors: [{ increaseFill: solid('#2A9D8F'), decreaseFill: solid('#E76F51'), totalFill: solid(PRIMARY) }],
      },
    },
    scatterChart: {
      '*': {
        legend: legend(),
        categoryAxis: categoryAxis(true),
        valueAxis: valueAxis(),
        categoryLabels: [{ show: false, fontSize: 9, fontFamily: FONT, color: solid('#333333') }],
        fillPoint: [{ style: 'Fill only' }],
      },
    },
    pieChart: { '*': { legend: legend('Right'), labels: labels(true, { fontSize: 10, labelStyle: 'Category' }) } },
    donutChart: { '*': { legend: legend('Right'), labels: labels(true, { fontSize: 10, labelStyle: 'Category' }), slices: [{ innerRadiusRatio: 50 }] } },
    treemap: { '*': { legend: legend(), categoryLabels: [{ show: true, fontSize: 10, fontFamily: FONT, color: solid('#FFFFFF') }], labels: labels(true, { fontSize: 10, color: solid('#FFFFFF') }) } },
    funnel: { '*': { labels: labels(true, { fontSize: 10, funnelLabelStyle: 'Data', color: solid('#FFFFFF') }) } },
    gauge: {
      '*': {
        calloutValue: [{ show: true, fontFamily: FONT, color: solid(PRIMARY) }],
        target: [{ show: true, fontSize: 12, fontFamily: FONT, color: solid(MUTED) }],
        dataPoint: [{ fill: solid('#1F8AC0'), target: solid('#E76F51') }],
      },
    },
    card: {
      '*': {
        labels: [{ fontSize: 32, fontFamily: 'Segoe UI Light', color: solid(PRIMARY), labelDisplayUnits: 0 }],
        categoryLabels: [{ show: true, fontSize: 12, fontFamily: FONT, color: solid(MUTED) }],
        wordWrap: [{ show: false }],
      },
    },
    cardVisual: {
      '*': {
        value: [{ fontSize: 32, fontFamily: 'Segoe UI Light', fontColor: solid(PRIMARY) }],
        label: [{ show: true, fontSize: 12, fontFamily: FONT, fontColor: solid(MUTED) }],
      },
    },
    multiRowCard: {
      '*': {
        dataLabels: [{ fontSize: 14, fontFamily: FONT, color: solid(PRIMARY) }],
        categoryLabels: [{ show: true, fontSize: 10, fontFamily: FONT, color: solid(MUTED) }],
        cardTitle: [{ fontSize: 12, fontFamily: FONT_SEMI, color: solid(PRIMARY) }],
        card: [{ outlineColor: solid(LINE), outlineWeight: 1, barShow: true, barColor: solid('#1F8AC0'), barWeight: 4 }],
      },
    },
    kpi: {
      '*': {
        indicator: [{ fontSize: 28, fontFamily: 'Segoe UI Light', fontColor: solid(PRIMARY) }],
        trendline: [{ show: true }],
        goals: [{ showGoal: true, showDistance: true, fontSize: 12 }],
        status: [{ goodColor: solid('#1AAB40'), neutralColor: solid('#D9B300'), badColor: solid('#D64554') }],
      },
    },
    slicer: {
      '*': {
        header: [{ show: true, fontFamily: FONT_SEMI, fontColor: solid(PRIMARY), background: solid('#FFFFFF'), textSize: 12 }],
        items: [{ fontFamily: FONT, fontColor: solid('#333333'), background: solid('#FFFFFF'), textSize: 11 }],
        selection: [{ selectAllCheckboxEnabled: false, singleSelect: true }],
      },
    },
    tableEx: {
      '*': {
        grid: [{ outlineColor: solid(LINE), outlineWeight: 1, gridVertical: false, gridHorizontal: true, gridHorizontalColor: solid(LINE), gridHorizontalWeight: 1, rowPadding: 4 }],
        columnHeaders: [{ fontFamily: FONT_SEMI, fontSize: 11, fontColor: solid('#FFFFFF'), alignment: 'Left', backColor: solid(PRIMARY) }],
        values: [{ fontFamily: FONT, fontSize: 11, fontColor: solid('#333333'), backColor: solid('#FFFFFF'), backColorSecondary: solid(BG_ALT) }],
        total: [{ totals: true, fontFamily: FONT_SEMI, fontSize: 11, fontColor: solid(PRIMARY), backColor: solid('#E8F0F7') }],
      },
    },
    pivotTable: {
      '*': {
        grid: [{ outlineColor: solid(LINE), outlineWeight: 1, gridVertical: false, gridHorizontal: true, gridHorizontalColor: solid(LINE), gridHorizontalWeight: 1, rowPadding: 4 }],
        rowHeaders: [{ fontFamily: FONT, fontSize: 11, fontColor: solid('#333333'), stepped: true, steppedLayoutIndentation: 20, backColor: solid('#FFFFFF') }],
        columnHeaders: [{ fontFamily: FONT_SEMI, fontSize: 11, fontColor: solid('#FFFFFF'), alignment: 'Left', backColor: solid(PRIMARY) }],
        values: [{ fontFamily: FONT, fontSize: 11, fontColor: solid('#333333'), backColor: solid('#FFFFFF'), backColorSecondary: solid(BG_ALT) }],
        subTotals: [{ rowSubtotals: true, columnSubtotals: true, fontFamily: FONT_SEMI, fontSize: 11, fontColor: solid(PRIMARY), backColor: solid('#E8F0F7') }],
      },
    },
    lineClusteredColumnComboChart: { '*': cartesian() },
    lineStackedColumnComboChart: { '*': cartesian() },
    decompositionTreeVisual: {
      '*': {
        levelHeader: [{ levelTitleFontFamily: FONT_SEMI, levelTitleFontSize: 11, levelTitleFontColor: solid(PRIMARY) }],
        dataLabels: [{ dataLabelFontSize: 11, dataLabelFontFamily: FONT, dataLabelFontColor: solid('#333333') }],
        tree: [{ accentColor: solid('#1F8AC0') }],
      },
    },
    shape: {
      '*': {
        fill: [{ show: true, fillColor: solid('#1F8AC0'), transparency: 0 }],
        outline: [{ show: false, lineColor: solid(PRIMARY), weight: 1 }],
      },
    },
    textbox: { '*': { background: [{ show: false }], border: [{ show: false }] } },
    image: { '*': { imageScaling: [{ imageScalingType: 'Fit' }], background: [{ show: false }] } },
    actionButton: {
      '*': {
        text: [{ show: true, fontFamily: FONT, fontSize: 12, fontColor: solid('#FFFFFF'), horizontalAlignment: 'center', verticalAlignment: 'middle', bold: false }],
        fill: [{ show: true, transparency: 0, fillColor: solid('#1F8AC0') }],
        outline: [{ show: false }],
        shadow: [{ show: false }],
      },
    },
    page: {
      '*': {
        pageSize: [{ pageSizeTypes: 'Widescreen', pageSizeWidth: 1280, pageSizeHeight: 720 }],
        background: [{ color: solid('#FFFFFF'), transparency: 0 }],
        outspace: [{ color: solid('#F2F2F2'), transparency: 0 }],
      },
    },
  },
};
