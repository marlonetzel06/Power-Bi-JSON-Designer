/**
 * Mapping from visual type (key in VISUAL_LABELS) to Power BI report page DISPLAY name.
 *
 * The display name must match the tab name in Power BI exactly (case-sensitive).
 * After the report loads, the app navigates to the correct page via report.setPage().
 */
export const VISUAL_PAGE_MAP = {
  'barChart':                      'Bar Chart',
  'columnChart':                   'Column Chart',
  'stackedBarChart':               'Stacked Bar chart',
  'stackedColumnChart':            'Stacked Column Chart',
  'clusteredBarChart':             'Grouped Bar chart',
  'clusteredColumnChart':          'Grouped Coulmn chart',
  'hundredPercentStackedBarChart': 'Stacked Barchart 100%',
  'hundredPercentStackedColumnChart': 'Stacked Column Chart 100%',
  'lineChart':                     'Line Chart',
  'areaChart':                     'Area Chart',
  'stackedAreaChart':              'Stacked Area Chart',
  'hundredPercentStackedAreaChart': 'Stacked Area Chart 100%',
  'lineStackedColumnComboChart':   'Stacked Column chart with Line',
  'lineClusteredColumnComboChart': 'Grouped Column Chart with Line',
  'ribbonChart':                   'Ribbon Chart',
  'waterfallChart':                'Waterfall chart',
  'funnel':                        'Funnel Chart',
  'scatterChart':                  'Scatter Chart',
  'pieChart':                      'Pie chart',
  'donutChart':                    'Donut Chart',
  'azureMap':                      'Azure Maps',
  'gauge':                         'Gauge Chart',
  'kpi':                           'KPI Card',
  'card':                          'KPI Card',
  'cardVisual':                    'KPI Card',
  'multiRowCard':                  'KPI Card (muiliticard view)',
  'slicer':                        'Slicer',
  'actionButton':                  'Button Slicer',
  'tableEx':                       'Table',
  'pivotTable':                    'Matrix',
  'listSlicer':                    'List Slicer',
  'textbox':                       'Text slicer',
  'treemap':                       'Heatmap',
};
