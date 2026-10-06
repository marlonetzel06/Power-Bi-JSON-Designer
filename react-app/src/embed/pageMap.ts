/**
 * Which report page shows which visual type. The report is inspected at runtime
 * (page.getVisuals()) and this static map is only a fallback for the shipped
 * powerbi/All_visuals_template.pbix.
 */
export const STATIC_PAGE_MAP: Record<string, string> = {
  barChart: 'Stacked Bar chart',
  clusteredBarChart: 'Grouped Bar chart',
  hundredPercentStackedBarChart: 'Stacked Barchart 100%',
  columnChart: 'Stacked Column Chart',
  clusteredColumnChart: 'Grouped Coulmn chart',
  hundredPercentStackedColumnChart: 'Stacked Column Chart 100%',
  lineChart: 'Line Chart',
  areaChart: 'Area Chart',
  stackedAreaChart: 'Stacked Area Chart',
  hundredPercentStackedAreaChart: 'Stacked Area Chart 100%',
  lineStackedColumnComboChart: 'Stacked Column chart with Line',
  lineClusteredColumnComboChart: 'Grouped Column Chart with Line',
  ribbonChart: 'Ribbon Chart',
  waterfallChart: 'Waterfall chart',
  funnel: 'Funnel Chart',
  scatterChart: 'Scatter Chart',
  pieChart: 'Pie chart',
  donutChart: 'Donut Chart',
  treemap: 'Heatmap',
  azureMap: 'Azure Maps',
  gauge: 'Gauge Chart',
  cardVisual: 'KPI Card',
  slicer: 'Slicer',
  advancedSlicerVisual: 'Button Slicer',
  listSlicer: 'List Slicer',
  textSlicer: 'Text slicer',
  tableEx: 'Table',
  pivotTable: 'Matrix',
};

export const normalizePageName = (name: string): string => name.trim().toLowerCase().replace(/\s+/g, ' ');

export interface ReportPageInfo {
  name: string;
  displayName: string;
  /** visual types found on the page (from page.getVisuals()) */
  visualTypes: string[];
}

/**
 * Pick the page for a visual: first a page that actually contains the visual type,
 * then the static map by (normalised) display name.
 */
export function resolvePage(visualKey: string, pages: ReportPageInfo[]): ReportPageInfo | undefined {
  const byType = pages.find((p) => p.visualTypes.includes(visualKey));
  if (byType) return byType;
  const wanted = STATIC_PAGE_MAP[visualKey];
  if (!wanted) return undefined;
  const target = normalizePageName(wanted);
  return pages.find((p) => normalizePageName(p.displayName) === target);
}
