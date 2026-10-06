/**
 * Fallback values used when neither the visual nor the global `*` style defines a
 * property. They approximate the Power BI base theme so the mock renderer and the
 * property controls show what Power BI would render.
 */
import type { CatalogProp } from '../catalog';

type Defaults = Record<string, Record<string, string | number | boolean>>;

/** Per card key (shared across visuals). */
export const CARD_DEFAULTS: Defaults = {
  title: { show: true, fontFamily: 'Segoe UI', fontSize: 12, fontColor: '#252423', bold: false, italic: false, underline: false, alignment: 'left', titleWrap: true, heading: 'Heading3' },
  subTitle: { show: false, fontFamily: 'Segoe UI', fontSize: 10, fontColor: '#605E5C', bold: false, italic: false, underline: false, alignment: 'left', titleWrap: true, heading: 'Heading4' },
  background: { show: true, color: '#FFFFFF', transparency: 0, wrapContent: false },
  border: { show: false, color: '#E6E6E6', width: 1, radius: 0, style: 'solid', transparency: 0 },
  dropShadow: { show: false, color: '#000000', preset: 'BottomRight', position: 'Outer', shadowBlur: 4, shadowDistance: 2, shadowSpread: 0, angle: 45, transparency: 60 },
  visualHeader: { show: true, background: '#FFFFFF', border: '#E6E6E6', foreground: '#252423', transparency: 0 },
  padding: { top: 5, bottom: 5, left: 5, right: 5, paddingSelection: 'Normal', topMargin: 5, bottomMargin: 5, leftMargin: 5, rightMargin: 5 },
  spacing: { customizeSpacing: false, spaceBelowTitle: 0, spaceBelowSubTitle: 0, spaceBelowTitleArea: 0, verticalSpacing: 0 },
  divider: { show: false, color: '#E6E6E6', style: 'solid', width: 1, ignorePadding: false, dividerColor: '#E6E6E6', dividerLineStyle: 'solid', dividerWidth: 1, dividerTransparency: 0, dividerIgnorePadding: false },
  visualTooltip: { show: true, type: 'Default', fontFamily: 'Segoe UI', fontSize: 10, titleFontColor: '#252423', valueFontColor: '#252423', background: '#FFFFFF', transparency: 0 },

  legend: { show: true, position: 'Top', showTitle: false, titleText: '', labelColor: '#605E5C', fontFamily: 'Segoe UI', fontSize: 8, bold: false, italic: false, underline: false, legendMarkerRendering: 'markerCircleDefault', matchLineColor: true, showGradientLegend: true },
  categoryAxis: { show: true, axisType: 'Categorical', axisStyle: 'showTitleOnly', labelColor: '#605E5C', fontFamily: 'Segoe UI', fontSize: 9, bold: false, italic: false, underline: false, showAxisTitle: false, titleColor: '#605E5C', titleFontFamily: 'Segoe UI', titleFontSize: 9, gridlineShow: false, gridlineColor: '#E6E6E6', gridlineStyle: 'solid', gridlineDashArray: '', gridlineDashCap: 'flat', gridlineThickness: 1, gridlineTransparency: 0, gridlineAutoScale: true, labelDisplayUnits: 0, labelPrecision: 0, invertAxis: false, concatenateLabels: false, innerPadding: 20, switchAxisPosition: false, preferredCategoryWidth: 20, maxMarginFactor: 25, logAxisScale: false, color: '#605E5C' },
  valueAxis: { show: true, secShow: true, alignZeros: false, secAxisStyle: 'showTitleOnly', secLabelColor: '#605E5C', secFontFamily: 'Segoe UI', secFontSize: 9, secBold: false, secItalic: false, secUnderline: false, secShowAxisTitle: false, secTitleText: '', secTitleColor: '#605E5C', secTitleFontFamily: 'Segoe UI', secTitleFontSize: 9, secTitleBold: false, secTitleItalic: false, secTitleUnderline: false, secLabelDisplayUnits: 0, secLabelPrecision: 0, secLogAxisScale: false, axisStyle: 'showTitleOnly', labelColor: '#605E5C', fontFamily: 'Segoe UI', fontSize: 9, bold: false, italic: false, underline: false, showAxisTitle: false, titleColor: '#605E5C', titleFontFamily: 'Segoe UI', titleFontSize: 9, gridlineShow: true, gridlineColor: '#E6E6E6', gridlineStyle: 'solid', gridlineDashArray: '', gridlineDashCap: 'flat', gridlineThickness: 1, gridlineTransparency: 0, gridlineAutoScale: true, labelDisplayUnits: 0, labelPrecision: 0, invertAxis: false, logAxisScale: false, scaleToFit: false, sharedAxis: true, switchAxisPosition: false },
  labels: { show: false, color: '#605E5C', fontFamily: 'Segoe UI', fontSize: 9, bold: false, italic: false, underline: false, labelDisplayUnits: 0, labelPrecision: 0, labelPosition: 'Auto', labelOrientation: 0, labelDensity: 50, labelOverflow: false, labelContentLayout: 'SingleLine', horizontalAlignment: 'center', showAll: false, showSeries: false, showBlankAs: '', enableBackground: false, backgroundColor: '#FFFFFF', backgroundTransparency: 90, optimizeLabelDisplay: true, labelContainerMaxWidth: 0, transparency: 0, wordWrap: false, leaderLines: true, leaderLineColor: '#B3B0AD', leaderLinePattern: 'solid', leaderLineWidth: 1, leaderLineTransparency: 0, titleTransparency: 0, detailTransparency: 0, detailLabelDisplayUnits: 0, detailLabelPrecision: 0, labelStyle: 'Category', position: 'preferOutside', percentageLabelPrecision: 0, background: 'auto', overflow: false, funnelLabelStyle: 'Data' },
  dataPoint: { defaultColor: '', fillTransparency: 0, borderShow: false, borderColor: '#FFFFFF', borderSize: 1, borderTransparency: 0, borderColorMatchFill: false, borderOutlineOnly: false, showAllDataPoints: false, transparency: 0 },
  plotArea: { transparency: 0 },
  trend: { show: false, lineColor: '#252423', style: 'dashed', dashArray: '', dashCap: 'flat', width: 2, transparency: 0, combineSeries: true, useHighlightValues: false, displayName: 'Trend line' },
  zoom: { show: false, showOnCategoryAxis: true, showOnValueAxis: true, showLabels: false, showTooltip: true },
  totals: { show: false, color: '#252423', fontFamily: 'Segoe UI', fontSize: 9, bold: false, italic: false, underline: false, labelDisplayUnits: 0, labelPrecision: 0, enableBackground: false, backgroundColor: '#FFFFFF', backgroundTransparency: 90, showPositiveAndNegative: false },
  smallMultiplesLayout: { layoutType: 'auto', rowCount: 2, columnCount: 2, gridLineShow: true, gridLineType: 'all', gridLineColor: '#E6E6E6', gridLineStyle: 'solid', gridLineWidth: 1, gridLineTransparency: 0, backgroundColor: '#FFFFFF', backgroundTransparency: 100, gridPadding: 8, rowPaddingInner: 8, rowPaddingOuter: 8, columnPaddingInner: 8, columnPaddingOuter: 8 },
  y1AxisReferenceLine: { show: false, value: 0, displayName: 'Reference line', lineColor: '#252423', style: 'solid', width: 2, transparency: 0, position: 'back', dataLabelShow: false, dataLabelColor: '#252423', dataLabelText: 'Value', dataLabelHorizontalPosition: 'left', dataLabelVerticalPosition: 'above', dataLabelDisplayUnits: 0, dataLabelDecimalPoints: 0, shadeShow: false, shadeColor: '#252423', shadeRegion: 'none', shadeTransparency: 90 },
  xAxisReferenceLine: { show: false, displayName: 'Reference line', lineColor: '#252423', style: 'solid', width: 2, transparency: 0, position: 'back', dataLabelShow: false, dataLabelColor: '#252423', dataLabelText: 'Value', dataLabelHorizontalPosition: 'left', dataLabelVerticalPosition: 'above', shadeShow: false, shadeColor: '#252423', shadeRegion: 'none', shadeTransparency: 90 },
  referenceLine: { show: false, value: 0, displayName: 'Reference line', lineColor: '#252423', style: 'solid', width: 2, transparency: 0, position: 'back', dataLabelShow: false, dataLabelColor: '#252423', dataLabelText: 'Value', dataLabelHorizontalPosition: 'left', dataLabelVerticalPosition: 'above', dataLabelDisplayUnits: 0, dataLabelDecimalPoints: 0, shadeShow: false, shadeColor: '#252423', shadeRegion: 'none', shadeTransparency: 90 },
  ribbonBands: { show: true, fillColor: '', fillMatchColor: true, fillTransparency: 70, borderShow: false, borderColor: '#FFFFFF', borderSize: 1, borderTransparency: 0, borderColorMatchFill: false },
  layout: { seriesOrderReversed: false, seriesOrderSorted: false, stackedGapExplodes: false, stackedGapSize: 0, ribbonGapSize: 0, clusteredGapSize: 20, clusteredGapOverlaps: 0, clusteredGapOverlapReverse: false, customizePadding: false, rowPadding: 8, columnPadding: 8, topOuterMargin: 0, bottomOuterMargin: 0, leftOuterMargin: 0, rightOuterMargin: 0, rectangleRoundedCurveCustomStyle: false, customizeLines: false, lineColor: '#E6E6E6', lineStyle: 'solid', lineWidth: 1, lineTransparency: 0, gridlineColor: '#E6E6E6', gridlineStyle: 'solid', gridlineWidth: 1, gridlineTransparency: 0, calloutSize: 32, maxTiles: 0 },
  lineStyles: { lineChartType: 'linear', interpolationSmooth: 'monotoneX', interpolationSmoothParam: 50, interpolationStep: 'center', segmentAlignment: 'center', strokeShow: true, strokeColor: '', lineStyle: 'solid', strokeDashArray: '', strokeWidth: 2, strokeTransparency: 0, strokeLineJoin: 'round', strokeDashCap: 'round', showSeries: true, showMarker: false, markerShape: 'circle', markerSize: 5, markerColor: '', areaShow: false, areaColor: '', areaMatchStrokeColor: true, segmentGradient: false },
  error: { enabled: false, barShow: true, barColor: '#605E5C', barMatchSeriesColor: false, barWidth: 1, barBorderColor: '#FFFFFF', barBorderSize: 0, markerShow: true, markerShape: 'shortDash', markerSize: 6, labelShow: false, labelColor: '#605E5C', labelMatchSeriesColor: false, labelFontFamily: 'Segoe UI', labelFontSize: 9, labelBold: false, labelItalic: false, labelUnderline: false, labelBackground: false, labelBackgroundColor: '#FFFFFF', labelBackgroundTransparency: 90, shadeShow: false, shadeColor: '#605E5C', shadeMatchSeriesColor: true, shadeTransparency: 80, shadeBandStyle: 'fill' },
  anomalyDetection: { show: false, displayName: 'Anomalie', markerShow: true, markerShape: 'circle', markerShapeSize: 8, markerColor: '#D64554', markerTransparency: 0, markerRotation: 0, markerBorderShow: true, markerBorderColor: '#FFFFFF', markerBorderWidth: 1, markerBorderTransparency: 0, markerBorderColorMatchFill: false, confidenceBandShow: true, confidenceBandColor: '#B3B0AD', confidenceBandStyle: 'fill', transparency: 70, isAnomalyHighlighted: true },
  subheader: { show: false, position: 'below', fontColor: '#605E5C', fontFamily: 'Segoe UI', fontSize: 10, bold: false, italic: false, underline: false, alignment: 'left', titleWrap: true },
  shadowCustom: { show: false, color: '#000000', shadowPositionPreset: 'bottomRight', position: 'Outer', shadowBlur: 4, shadowDistance: 2, shadowSpread: 0, angle: 45, transparency: 60 },
  glowCustom: { show: false, color: '#118DFF', glowPositionPreset: 'center', position: 'Outer', shadowBlur: 4, glowDistance: 0, glowSpread: 0, angle: 0, transparency: 60 },
  referenceLabelLayout: { style: 'sentence', position: 'below', arrangement: 'rows', horizontalAlignment: 'left', verticalAlignment: 'bottom', textWrap: true, labelSpace: 50, valueArea: 50, customizePadding: false, outerPadding: 0, paddingBeforeDivider: 0, paddingAfterDivider: 0 },
  referenceLabelDetail: { show: false, detailFontColor: '#605E5C', detailFontFamily: 'Segoe UI', detailFontSize: 9, detailBold: false, detailItalic: false, detailUnderline: false, detailTransparency: 0, detailBackgroundColor: '#FFFFFF', detailDisplayUnits: 0, detailPrecision: 0, showBlankAs: '' },
  image: { show: false, imageType: 'image', imageUrl: '', position: 'left', horizontalAlignment: 'left', verticalAlignment: 'top', fixedSize: false, size: 24, imageAreaSize: 30, padding: 4, transparency: 0 },
  expansionIcon: { color: '#252423', position: 'Left', verticalAlignment: 'middle', size: 12, spacing: 6, transparency: 0 },
  sparklines: { chartType: 'line', dataColor: '#118DFF', strokeWidth: 1, markers: false, markerColor: '#118DFF', markerShape: 'circle', markerSize: 2 },
  blankRows: { showBlankRows: false, blankRowColor: '#FFFFFF', blankRowTransparency: 0, showBorder: false, borderColor: '#E6E6E6', borderPosition: 'Top', borderWidth: 1, borderTransparency: 0 },
  heatMap: { show: false, color0: '#DEEFFF', color50: '#118DFF', color100: '#12239E', filterRadius: 20, unit: 'pixels', transparency: 0 },
  pendingChangesIcon: { show: true, color: '#252423', position: 'right', size: 12, transparency: 0, showTooltip: true, tooltipLabel: '', tooltipText: '' },
  visualHeaderTooltip: { text: '', type: 'Default', fontFamily: 'Segoe UI', fontSize: 10, bold: false, italic: false, underline: false, titleFontColor: '#252423', background: '#FFFFFF', transparency: 0, themedTitleFontColor: '#252423', themedBackground: '#FFFFFF' },
  markers: { borderShow: false, borderColor: '#FFFFFF', borderWidth: 1, borderTransparency: 0, borderColorMatchFill: false, rotation: 0, transparency: 0 },
  forecast: { show: false, displayName: 'Forecast', lineColor: '#252423', style: 'dashed', width: 2, strokeTransparency: 0, interpolation: 'linear', bandAreaShow: true, bandAreaColor: '#252423', bandAreaMatchColor: true, bandAreaTransparency: 80, bandLineShow: true, bandLineColor: '#252423', bandLinePattern: 'solid', bandLineWidth: 1 },
  seriesLabels: { show: false, seriesPosition: 'Right', seriesColor: '#605E5C', seriesFontFamily: 'Segoe UI', textSize: 9, bold: false, italic: false, underline: false, seriesMaximumWidth: 25, seriesWordWrap: false, enableBackground: false, backgroundColor: '#FFFFFF', backgroundTransparency: 90, showAll: false },
  y2Axis: { show: false, secAxisStyle: 'showTitleOnly', secLabelColor: '#605E5C', secFontFamily: 'Segoe UI', secFontSize: 9, secBold: false, secItalic: false, secUnderline: false, secShowAxisTitle: false, secTitleText: '', secTitleColor: '#605E5C', secTitleFontFamily: 'Segoe UI', secTitleFontSize: 9, secTitleBold: false, secLabelDisplayUnits: 0, secLabelPrecision: 0, secLogAxisScale: false },
  bubbles: { bubbleSize: 0, markerShape: 'circle', markerRangeType: 'auto' },
  fillPoint: { style: 'Fill only' },
  categoryLabels: { show: true, color: '#605E5C', fontFamily: 'Segoe UI', fontSize: 9, bold: false, italic: false, underline: false, enableBackground: false, backgroundColor: '#FFFFFF', backgroundTransparency: 90 },
  plotAreaShading: { show: false, upperShadingColor: '#118DFF', lowerShadingColor: '#E66C37', transparency: 90 },
  ratioLine: { show: false, lineColor: '#252423', style: 'dashed', width: 1, transparency: 0 },
  colorByCategory: { show: false },
  sentimentColors: { increaseFill: '#1AAB40', decreaseFill: '#D64554', totalFill: '#118DFF', otherFill: '#605E5C' },
  breakdown: { maxBreakdowns: 5 },
  slices: { innerRadiusRatio: 60, startAngle: 0 },
  percentBarLabel: { show: true, color: '#605E5C', fontFamily: 'Segoe UI', fontSize: 9, bold: false, italic: false, underline: false },
  axis: { min: 0, max: 100, target: 75 },
  calloutValue: { show: true, color: '#252423', fontFamily: 'DIN', bold: false, italic: false, underline: false, labelDisplayUnits: 0, labelPrecision: 0 },
  target: { show: true, color: '#605E5C', fontFamily: 'Segoe UI', fontSize: 9, bold: false, italic: false, underline: false, labelDisplayUnits: 0, labelPrecision: 0 },
  wordWrap: { show: true },
  value: { show: true, fontColor: '#252423', fontFamily: 'DIN', fontSize: 32, bold: false, italic: false, underline: false, horizontalAlignment: 'left', verticalAlignment: 'middle', labelDisplayUnits: 0, labelPrecision: 0, textWrap: true, transparency: 0 },
  label: { show: true, text: '', position: 'aboveValue', fontColor: '#605E5C', fontFamily: 'Segoe UI', fontSize: 12, bold: false, italic: false, underline: false, horizontalAlignment: 'left', textWrap: true, transparency: 0 },
  accentBar: { show: false, color: '#118DFF', position: 'Left', width: 4, transparency: 0 },
  referenceLabelValue: { show: true, valueFontColor: '#252423', valueFontFamily: 'Segoe UI', valueFontSize: 12, valueBold: true, valueItalic: false },
  referenceLabelTitle: { show: true, titleFontColor: '#605E5C', titleFontFamily: 'Segoe UI', titleFontSize: 10, titleBold: false },
  fillCustom: { show: true, fillColor: '#FFFFFF', transparency: 0 },
  outline: { show: false, lineColor: '#E6E6E6', weight: 1, transparency: 0 },
  shapeCustomRectangle: { tileShape: 'rectangleRounded', rectangleRoundedCurve: 8 },
  grid: { show: false, color: '#E6E6E6', style: 'solid', width: 1, transparency: 0, gridVertical: false, gridVerticalColor: '#E6E6E6', gridVerticalWeight: 1, gridHorizontal: true, gridHorizontalColor: '#E6E6E6', gridHorizontalWeight: 1, outlineColor: '#E6E6E6', outlineStyle: 0, outlineWeight: 1, rowPadding: 3, textSize: 10, imageHeight: 75, imageWidth: 75 },
  card: { barShow: true, barColor: '#118DFF', barWeight: 4, cardBackground: '#FFFFFF', cardPadding: 8, outlineColor: '#E6E6E6', outlineStyle: 0, outlineWeight: 1 },
  cardTitle: { color: '#605E5C', fontFamily: 'Segoe UI', fontSize: 12, bold: false, italic: false, underline: false },
  dataLabels: { color: '#252423', fontFamily: 'Segoe UI', fontSize: 12, bold: false, italic: false, underline: false },
  indicator: { fontColor: '#252423', fontFamily: 'DIN', fontSize: 32, bold: false, italic: false, underline: false, horizontalAlignment: 'left', verticalAlignment: 'middle', showIcon: true, iconSize: 20, indicatorDisplayUnits: 0, indicatorPrecision: 0 },
  trendline: { show: true, transparency: 20 },
  goals: { showGoal: true, goalText: 'Ziel', goalFontColor: '#605E5C', goalFontFamily: 'Segoe UI', showDistance: true, distanceLabel: 'Percent', distanceFontColor: '#605E5C', distanceFontFamily: 'Segoe UI', direction: 'High is good', fontSize: 9, bold: false, italic: false, underline: false, labelPrecision: 0 },
  status: { direction: 'Positive', goodColor: '#1AAB40', neutralColor: '#D9B300', badColor: '#D64554' },
  lastDate: { show: false, lastDateFontColor: '#605E5C', lastDateFontFamily: 'Segoe UI', fontSize: 9, bold: false, italic: false, underline: false },
  header: { show: true, text: '', fontColor: '#252423', fontFamily: 'Segoe UI', textSize: 10, bold: false, italic: false, underline: false, background: '#FFFFFF', outlineStyle: 0, showRestatement: false },
  items: { fontColor: '#605E5C', fontFamily: 'Segoe UI', textSize: 10, bold: false, italic: false, underline: false, background: '#FFFFFF', outlineStyle: 0, padding: 4, steppedLayoutIndentation: 20, expandCollapseToggleType: 0 },
  data: { mode: 'Basic' },
  selection: { singleSelect: false, strictSingleSelect: false, selectAllCheckboxEnabled: false, restrictToLeafNodes: false },
  slider: { show: true, color: '#118DFF', handleFillColor: '#FFFFFF', handleBorderColor: '#118DFF', secondaryLineColor: '#E6E6E6' },
  searchBox: { background: '#FFFFFF', borderColor: '#E6E6E6', outlineStyle: 0 },
  date: { fontColor: '#252423', fontFamily: 'Segoe UI', textSize: 10, bold: false, italic: false, underline: false, background: '#FFFFFF', hideDatePickerButton: false },
  numericInputStyle: { fontColor: '#252423', fontFamily: 'Segoe UI', textSize: 10, bold: false, italic: false, underline: false, background: '#FFFFFF' },
  selectionIcon: { show: true, color: '#252423', position: 'Left', size: 16, spacing: 8, transparency: 0 },
  columnHeaders: { fontColor: '#252423', fontFamily: 'Segoe UI', fontSize: 10, bold: false, italic: false, underline: false, backColor: '#FFFFFF', alignment: 'Auto', titleAlignment: 'Auto', outlineColor: '#E6E6E6', outlineStyle: 0, outlineWeight: 1, wordWrap: true, autoSizeColumnWidth: true, show: true, foregroundColor: '#605E5C' },
  values: { fontColor: '#252423', fontFamily: 'Segoe UI', fontSize: 10, bold: false, italic: false, underline: false, backColor: '#FFFFFF', backColorPrimary: '#FFFFFF', backColorSecondary: '#FFFFFF', fontColorPrimary: '#252423', fontColorSecondary: '#252423', bandedRowHeaders: true, valuesOnRow: false, outlineColor: '#E6E6E6', outlineStyle: 0, outlineWeight: 1, wordWrap: false, urlIcon: false },
  total: { totals: true, label: 'Total', fontColor: '#252423', fontFamily: 'Segoe UI', fontSize: 10, bold: true, italic: false, underline: false, backColor: '#FFFFFF', outlineColor: '#E6E6E6', outlineStyle: 0, outlineWeight: 1, applyToHeaders: false },
  columnFormatting: { alignment: 'Auto', fontColor: '#252423', backColor: '#FFFFFF', labelDisplayUnits: 1, labelPrecision: 0, styleHeader: true, styleValues: true, styleTotal: true },
  rowHeaders: { fontColor: '#252423', fontFamily: 'Segoe UI', fontSize: 10, bold: false, italic: false, underline: false, backColor: '#FFFFFF', alignment: 'Auto', outlineColor: '#E6E6E6', outlineStyle: 0, outlineWeight: 1, stepped: true, steppedLayoutIndentation: 10, showExpandCollapseButtons: true, expandCollapseButtonsColor: '#252423', expandCollapseButtonsSize: 10, wordWrap: true, repeatRowHeaders: false },
  subTotals: { rowSubtotals: true, rowSubtotalsLabel: 'Total', rowSubtotalsPosition: 'Bottom', columnSubtotals: true, columnSubtotalsLabel: 'Total', perRowLevel: false, perColumnLevel: false, applyToHeaders: false, fontColor: '#252423', fontFamily: 'Segoe UI', fontSize: 10, bold: true, italic: false, underline: false, backColor: '#FFFFFF' },
  columnTotal: { applyToHeaders: false, fontColor: '#252423', fontFamily: 'Segoe UI', fontSize: 10, bold: true, italic: false, underline: false, backColor: '#FFFFFF' },
  rowTotal: { applyToHeaders: false, fontColor: '#252423', fontFamily: 'Segoe UI', fontSize: 10, bold: true, italic: false, underline: false, backColor: '#FFFFFF' },
  levelHeader: { showSubtitles: true, levelHeaderBackgroundColor: '#FFFFFF', levelTitleFontColor: '#252423', levelTitleFontFamily: 'Segoe UI', levelTitleFontSize: 12, levelTitleBold: true, levelTitleItalic: false, levelTitleUnderline: false, levelSubtitleFontColor: '#605E5C', levelSubtitleFontFamily: 'Segoe UI', levelSubtitleFontSize: 10, levelSubtitleBold: false },
  tree: { accentColor: '#118DFF', connectorDefaultColor: '#C8C6C4', connectorType: 'curve', barsPerLevel: 10, density: 'default', responsiveLayout: true },
  dataBars: { dataBarColor: '#118DFF', dataBarBackgroundColor: '#F3F2F1', positiveBarColor: '#1AAB40', negativeBarColor: '#D64554', dataBarWidthPercent: 100, dataBarScalingType: 'topNode' },
  scorecard: { displayMode: 'list', fontFamily: 'Segoe UI', backgroundColor: '#FFFFFF', foregroundColor: '#252423', tableBackgroundColor: '#FFFFFF', showCommandBar: true },
  text: { show: true, text: '', fontColor: '#252423', fontFamily: 'Segoe UI', fontSize: 12, bold: false, italic: false, underline: false, horizontalAlignment: 'center', verticalAlignment: 'middle', topMargin: 0, bottomMargin: 0, leftMargin: 0, rightMargin: 0, color: '#252423' },
  fill: { show: true, fillColor: '#FFFFFF', transparency: 0 },
  shadow: { show: false, color: '#000000', shadowPositionPreset: 'bottomRight', shadowBlur: 4, shadowDistance: 2, angle: 45, transparency: 60 },
  glow: { show: false, color: '#118DFF', shadowBlur: 4, transparency: 60 },
  icon: { show: false, shapeType: 'blank', placement: 'left', lineColor: '#252423', lineWeight: 1, lineTransparency: 0, iconSize: 20, horizontalAlignment: 'center', verticalAlignment: 'middle' },
  shape: { tileShape: 'rectangle', rectangleRoundedCurve: 0, roundEdge: 0, linecapType: 'flat', projectionEnum: 'mercator' },
  rotation: { angle: 0, shapeAngle: 0, textAngle: 0 },
  pages: { showHiddenPages: false, showTooltipPages: false },
  imageScaling: { imageScalingType: 'Normal' },
  mapStyles: { mapTheme: 'road', showLabels: true },
  mapControls: { autoZoom: true, showZoomButtons: true, showLassoButton: true, defaultStyle: 'road', showLabels: true, showNavigationControls: true, showStylePicker: true, showSelectionControl: true },
  stroke: { show: true, strokeColor: '#FFFFFF', strokeWidth: 1 },
  defaultColors: { defaultShow: true, defaultColor: '#C8C6C4', borderColor: '#FFFFFF', borderThickness: 1 },
  bubbleLayer: { show: true, bubbleRadius: 10, minBubbleRadius: 2, maxRadius: 50, strokeColor: '#FFFFFF', bubbleStrokeWidth: 1, strokeTransparency: 0, matchFillColor: false, autoStrokeColor: true, clusteringEnabled: false, clusteredBubbleFillColor: '#118DFF', clusteredBubbleStrokeColor: '#FFFFFF' },
  filledMap: { show: true, defaultColor: '#118DFF', strokeColor: '#FFFFFF', strokeWidth: 1, strokeTransparency: 0 },
  heatMapLayer: { show: false, heatMapColorLow: '#DEEFFF', heatMapColorCenter: '#118DFF', heatMapColorHigh: '#12239E', heatMapRadius: 20, heatMapIntensity: 1 },
  // text slicer
  inputText: { fontColor: '#252423', fontFamily: 'Segoe UI', fontSize: 10, bold: false, italic: false, underline: false, fontTransparency: 0, placeholder: '', backColor: '#FFFFFF', backTransparency: 0, borderShow: false, borderColor: '#E6E6E6', borderWidth: 1, borderTransparency: 0, dismissColor: '#605E5C', dismissSize: 12, dismissSpacing: 4, dismissTransparency: 0, paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8 },
  inputTextBox: { backShow: true, backColor: '#FFFFFF', backTransparency: 0, borderShow: true, borderColor: '#B3B0AD', borderWidth: 1, borderTransparency: 0, accentBarShow: false, accentBarColor: '#118DFF', accentBarPosition: 'Bottom', accentBarWidth: 3, accentBarTransparency: 0, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
  applyButton: { backShow: true, backColor: '#118DFF', backTransparency: 0, borderShow: false, borderColor: '#B3B0AD', borderWidth: 1, borderTransparency: 0, iconColor: '#FFFFFF', iconSize: 12, iconTransparency: 0, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, spacing: 6 },
  slicerSettings: { multiselect: false },
  outspace: { color: '#F3F2F1', transparency: 0 },
  outspacePane: { backgroundColor: '#FFFFFF', transparency: 0, foregroundColor: '#252423', fontFamily: 'Segoe UI', titleSize: 14, headerSize: 12, searchTextSize: 10, inputBoxColor: '#FFFFFF', checkboxAndApplyColor: '#118DFF', border: true, borderColor: '#E6E6E6', width: 240 },
  filterCard: { backgroundColor: '#FFFFFF', transparency: 0, foregroundColor: '#252423', fontFamily: 'Segoe UI', textSize: 10, inputBoxColor: '#FFFFFF', border: true, borderColor: '#E6E6E6' },
  pageSize: { pageSizeTypes: 'Widescreen', pageSizeWidth: 1280, pageSizeHeight: 720 },
  displayArea: { verticalAlignment: 'Top' },
};

/** Per-visual overrides of CARD_DEFAULTS (Power BI defaults differ per visual). */
export const VISUAL_DEFAULTS: Record<string, Defaults> = {
  pieChart: { legend: { position: 'Right' }, labels: { show: true, fontSize: 9, labelStyle: 'Category' } },
  donutChart: { legend: { position: 'Right' }, labels: { show: true, fontSize: 9, labelStyle: 'Category' } },
  treemap: { labels: { show: false, color: '#FFFFFF' }, categoryLabels: { color: '#FFFFFF' } },
  funnel: { legend: { show: false }, labels: { show: true, funnelLabelStyle: 'Data', color: '#FFFFFF' } },
  waterfallChart: { labels: { show: true } },
  scatterChart: { categoryAxis: { gridlineShow: true }, categoryLabels: { show: false } },
  hundredPercentStackedBarChart: { labels: { show: true, color: '#FFFFFF' } },
  hundredPercentStackedColumnChart: { labels: { show: true, color: '#FFFFFF' } },
  gauge: { labels: { show: true, fontSize: 9 } },
  card: { labels: { fontSize: 45, color: '#252423', fontFamily: 'DIN' }, categoryLabels: { fontSize: 12, color: '#605E5C' } },
  cardVisual: { label: { position: 'belowValue' } },
  multiRowCard: { categoryLabels: { fontSize: 10 }, dataLabels: { fontSize: 14 } },
  kpi: { goals: { showGoal: true } },
  textbox: { text: { fontSize: 14, color: '#252423', fontFamily: 'Segoe UI' } },
  actionButton: { fill: { fillColor: '#FFFFFF', transparency: 0 }, outline: { show: true, lineColor: '#605E5C' } },
  bookmarkNavigator: { fill: { fillColor: '#F3F2F1' }, outline: { show: false } },
  pageNavigator: { fill: { fillColor: '#F3F2F1' }, outline: { show: false } },
  shape: { fill: { fillColor: '#118DFF' }, outline: { show: false, lineColor: '#252423' }, text: { show: false } },
  advancedSlicerVisual: { fillCustom: { fillColor: '#FFFFFF' }, outline: { show: true, lineColor: '#605E5C' }, label: { show: false, fontSize: 9 }, value: { fontSize: 10, fontColor: '#252423', horizontalAlignment: 'center' }, layout: { rectangleRoundedCurve: 4 }, selectionIcon: { show: false } },
  listSlicer: { fillCustom: { fillColor: '#FFFFFF' }, outline: { show: false }, label: { show: false, fontSize: 9 }, value: { fontSize: 10, fontColor: '#252423', horizontalAlignment: 'left' } },
  azureMap: { legend: { position: 'Right' } },
  page: { background: { color: '#FFFFFF', transparency: 0 } },
};

/** Fallback by property type when no explicit default exists. */
export function typeDefault(prop: CatalogProp): string | number | boolean | undefined {
  switch (prop.type) {
    case 'boolean':
      return prop.key === 'show' || prop.key.startsWith('show');
    case 'number':
    case 'integer':
      return prop.min ?? 0;
    case 'enum':
      return prop.options?.[0]?.value;
    case 'string':
      return '';
    case 'color':
      return undefined;
    default:
      return undefined;
  }
}

export function getDefault(visualKey: string, cardKey: string, propKey: string, prop?: CatalogProp): string | number | boolean | undefined {
  const perVisual = VISUAL_DEFAULTS[visualKey]?.[cardKey]?.[propKey];
  if (perVisual !== undefined) return perVisual;
  const shared = CARD_DEFAULTS[cardKey]?.[propKey];
  if (shared !== undefined) return shared;
  return prop ? typeDefault(prop) : undefined;
}
