/**
 * Editor curation: WHICH visuals, format cards and properties the designer offers,
 * and in which order. Every key must exist in the official Power BI theme schema —
 * `npm run generate:catalog` fails otherwise.
 *
 * This file is pure data (no imports) so the catalog generator can load it with tsx.
 * Labels live in labels.de.ts (German) and come from the schema titles for English.
 */

export type PropList = readonly string[] | '*';

/** Default property selection per card key, shared by every visual that has the card. */
export const CARD_PROPS: Record<string, PropList> = {
  // ---- common container cards ("Allgemein" tab in Power BI) ----
  title: ['show', 'text', 'fontFamily', 'fontSize', 'fontColor', 'bold', 'italic', 'underline', 'alignment', 'titleWrap', 'background', 'heading'],
  subTitle: ['show', 'text', 'fontFamily', 'fontSize', 'fontColor', 'bold', 'italic', 'underline', 'alignment', 'titleWrap', 'heading'],
  background: ['show', 'color', 'transparency'],
  border: ['show', 'color', 'width', 'radius'],
  dropShadow: ['show', 'color', 'preset', 'position', 'shadowBlur', 'shadowDistance', 'shadowSpread', 'angle', 'transparency'],
  visualHeader: ['show', 'background', 'border', 'foreground', 'transparency'],
  padding: ['top', 'bottom', 'left', 'right'],
  spacing: ['customizeSpacing', 'spaceBelowTitle', 'spaceBelowSubTitle', 'spaceBelowTitleArea', 'verticalSpacing'],
  divider: ['show', 'color', 'style', 'width', 'ignorePadding'],
  visualTooltip: ['show', 'type', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'titleFontColor', 'valueFontColor', 'actionFontColor', 'background', 'transparency', 'themedTitleFontColor', 'themedValueFontColor', 'themedBackground'],
  visualHeaderTooltip: ['text', 'type', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'titleFontColor', 'background', 'transparency', 'themedTitleFontColor', 'themedBackground'],

  // ---- cartesian charts ----
  legend: ['show', 'position', 'showTitle', 'titleText', 'labelColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'legendMarkerRendering', 'matchLineColor', 'showGradientLegend'],
  categoryAxis: [
    'show', 'axisType', 'axisStyle', 'labelColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline',
    'showAxisTitle', 'titleText', 'titleColor', 'titleFontFamily', 'titleFontSize', 'titleBold', 'titleItalic', 'titleUnderline',
    'gridlineShow', 'gridlineColor', 'gridlineStyle', 'gridlineDashArray', 'gridlineDashCap', 'gridlineThickness', 'gridlineTransparency', 'gridlineAutoScale',
    'start', 'end', 'labelDisplayUnits', 'labelPrecision', 'invertAxis', 'concatenateLabels', 'innerPadding', 'switchAxisPosition', 'preferredCategoryWidth', 'maxMarginFactor', 'logAxisScale',
  ],
  valueAxis: [
    'show', 'axisStyle', 'labelColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline',
    'showAxisTitle', 'titleText', 'titleColor', 'titleFontFamily', 'titleFontSize', 'titleBold', 'titleItalic', 'titleUnderline',
    'gridlineShow', 'gridlineColor', 'gridlineStyle', 'gridlineDashArray', 'gridlineDashCap', 'gridlineThickness', 'gridlineTransparency', 'gridlineAutoScale',
    'start', 'end', 'labelDisplayUnits', 'labelPrecision', 'invertAxis', 'logAxisScale', 'scaleToFit', 'sharedAxis', 'switchAxisPosition',
  ],
  labels: [
    'show', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'labelDisplayUnits', 'labelPrecision',
    'labelPosition', 'labelOrientation', 'labelDensity', 'labelOverflow', 'labelContentLayout', 'horizontalAlignment', 'showAll', 'showSeries', 'showBlankAs',
    'transparency', 'wordWrap', 'enableBackground', 'backgroundColor', 'backgroundTransparency', 'optimizeLabelDisplay', 'labelContainerMaxWidth',
    'leaderLines', 'leaderLineColor', 'leaderLinePattern', 'leaderLineWidth', 'leaderLineTransparency',
    'enableTitleDataLabel', 'titleColor', 'titleFontFamily', 'titleFontSize', 'titleBold', 'titleItalic', 'titleUnderline', 'titleTransparency',
    'enableDetailDataLabel', 'detailContentType', 'detailColor', 'detailFontFamily', 'detailFontSize', 'detailBold', 'detailItalic', 'detailUnderline', 'detailTransparency', 'detailLabelDisplayUnits', 'detailLabelPrecision',
  ],
  dataPoint: ['defaultColor', 'fillTransparency', 'borderShow', 'borderColor', 'borderSize', 'borderTransparency', 'borderColorMatchFill', 'borderOutlineOnly'],
  plotArea: ['transparency'],
  trend: ['show', 'lineColor', 'style', 'dashArray', 'dashCap', 'width', 'transparency', 'combineSeries', 'useHighlightValues', 'displayName'],
  zoom: ['show', 'showOnCategoryAxis', 'showOnValueAxis', 'showLabels', 'showTooltip'],
  totals: ['show', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'labelDisplayUnits', 'labelPrecision', 'enableBackground', 'backgroundColor', 'backgroundTransparency', 'showPositiveAndNegative'],
  smallMultiplesLayout: [
    'layoutType', 'rowCount', 'columnCount', 'gridLineShow', 'gridLineType', 'gridLineColor', 'gridLineStyle', 'gridLineWidth', 'gridLineTransparency',
    'backgroundColor', 'backgroundTransparency', 'gridPadding', 'rowPaddingInner', 'rowPaddingOuter', 'columnPaddingInner', 'columnPaddingOuter',
  ],
  y1AxisReferenceLine: ['show', 'value', 'displayName', 'lineColor', 'style', 'dashArray', 'dashCap', 'width', 'transparency', 'position', 'dataLabelShow', 'dataLabelColor', 'dataLabelText', 'dataLabelHorizontalPosition', 'dataLabelVerticalPosition', 'dataLabelDisplayUnits', 'dataLabelDecimalPoints', 'shadeShow', 'shadeColor', 'shadeColorMatchStroke', 'shadeRegion', 'shadeTransparency'],
  xAxisReferenceLine: ['show', 'value', 'displayName', 'lineColor', 'style', 'dashArray', 'dashCap', 'width', 'transparency', 'position', 'dataLabelShow', 'dataLabelColor', 'dataLabelText', 'dataLabelHorizontalPosition', 'dataLabelVerticalPosition', 'dataLabelDisplayUnits', 'dataLabelDecimalPoints', 'shadeShow', 'shadeColor', 'shadeColorMatchStroke', 'shadeRegion', 'shadeTransparency'],
  referenceLine: ['show', 'value', 'displayName', 'lineColor', 'style', 'dashArray', 'dashCap', 'width', 'transparency', 'position', 'dataLabelShow', 'dataLabelColor', 'dataLabelText', 'dataLabelHorizontalPosition', 'dataLabelVerticalPosition', 'dataLabelDisplayUnits', 'dataLabelDecimalPoints', 'shadeShow', 'shadeColor', 'shadeColorMatchStroke', 'shadeRegion', 'shadeTransparency'],
  ribbonBands: ['show', 'fillColor', 'fillMatchColor', 'fillTransparency', 'borderShow', 'borderColor', 'borderSize', 'borderTransparency', 'borderColorMatchFill'],
  layout: ['seriesOrderReversed', 'seriesOrderSorted', 'stackedGapExplodes', 'stackedGapSize', 'ribbonGapSize'],
  lineStyles: ['lineChartType', 'interpolationSmooth', 'interpolationSmoothParam', 'interpolationStep', 'segmentAlignment', 'strokeShow', 'strokeColor', 'lineStyle', 'strokeDashArray', 'strokeWidth', 'strokeTransparency', 'strokeLineJoin', 'strokeDashCap', 'showSeries', 'showMarker', 'markerShape', 'markerSize', 'markerColor', 'areaShow', 'areaColor', 'areaMatchStrokeColor', 'segmentGradient'],
  markers: ['borderShow', 'borderColor', 'borderWidth', 'borderTransparency', 'borderColorMatchFill', 'rotation', 'transparency'],
  forecast: ['show', 'displayName', 'lineColor', 'style', 'dashArray', 'dashCap', 'width', 'strokeTransparency', 'interpolation', 'matchSeriesInterpolation', 'interpolationSmooth', 'interpolationSmoothParam', 'interpolationStep', 'bandAreaShow', 'bandAreaColor', 'bandAreaMatchColor', 'bandAreaTransparency', 'bandLineShow', 'bandLineColor', 'bandLineMatchColor', 'bandLinePattern', 'bandLineWidth', 'bandLineTransparency'],
  error: ['enabled', 'barShow', 'barColor', 'barMatchSeriesColor', 'barWidth', 'barBorderColor', 'barBorderSize', 'markerShow', 'markerShape', 'markerSize', 'labelShow', 'labelColor', 'labelMatchSeriesColor', 'labelFontFamily', 'labelFontSize', 'labelBold', 'labelItalic', 'labelUnderline', 'labelBackground', 'labelBackgroundColor', 'labelBackgroundTransparency', 'shadeShow', 'shadeColor', 'shadeMatchSeriesColor', 'shadeTransparency', 'shadeBandStyle'],
  anomalyDetection: ['show', 'displayName', 'markerShow', 'markerShape', 'markerShapeSize', 'markerColor', 'markerTransparency', 'markerRotation', 'markerBorderShow', 'markerBorderColor', 'markerBorderWidth', 'markerBorderTransparency', 'markerBorderColorMatchFill', 'confidenceBandShow', 'confidenceBandColor', 'confidenceBandStyle', 'transparency', 'isAnomalyHighlighted'],
  subheader: ['show', 'position', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'alignment', 'titleWrap'],
  seriesLabels: ['show', 'seriesPosition', 'seriesColor', 'seriesFontFamily', 'textSize', 'bold', 'italic', 'underline', 'seriesMaximumWidth', 'seriesWordWrap', 'enableBackground', 'backgroundColor', 'backgroundTransparency', 'showAll'],
  y2Axis: ['show', 'secAxisStyle', 'secLabelColor', 'secFontFamily', 'secFontSize', 'secBold', 'secItalic', 'secUnderline', 'secShowAxisTitle', 'secTitleText', 'secTitleColor', 'secTitleFontFamily', 'secTitleFontSize', 'secTitleBold', 'secLabelDisplayUnits', 'secLabelPrecision', 'secLogAxisScale'],

  // ---- scatter ----
  bubbles: ['bubbleSize', 'markerShape', 'markerRangeType'],
  fillPoint: ['style'],
  categoryLabels: ['show', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'enableBackground', 'backgroundColor', 'backgroundTransparency'],
  plotAreaShading: ['show', 'upperShadingColor', 'lowerShadingColor', 'transparency'],
  ratioLine: ['show', 'lineColor', 'style', 'dashArray', 'dashCap', 'width', 'transparency'],
  colorByCategory: ['show'],

  // ---- waterfall ----
  sentimentColors: ['increaseFill', 'decreaseFill', 'totalFill', 'otherFill'],
  breakdown: ['maxBreakdowns'],

  // ---- pie / donut / treemap / funnel ----
  slices: ['innerRadiusRatio', 'startAngle'],
  percentBarLabel: ['show', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline'],

  // ---- gauge ----
  axis: ['min', 'max', 'target'],
  calloutValue: ['show', 'color', 'fontFamily', 'bold', 'italic', 'underline', 'labelDisplayUnits', 'labelPrecision'],
  target: ['show', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'labelDisplayUnits', 'labelPrecision'],

  // ---- cards / KPI ----
  wordWrap: ['show'],
  value: ['show', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'horizontalAlignment', 'labelDisplayUnits', 'labelPrecision', 'textWrap', 'transparency'],
  label: ['show', 'text', 'position', 'heading', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'horizontalAlignment', 'alignBaselines', 'matchValueAlignment', 'textWrap', 'transparency'],
  accentBar: ['show', 'color', 'position', 'width', 'transparency'],
  referenceLabelValue: ['show', 'valueFontColor', 'valueFontFamily', 'valueFontSize', 'valueBold', 'valueItalic', 'valueUnderline', 'valueTransparency', 'valueDisplayUnits', 'valuePrecision'],
  referenceLabelTitle: ['show', 'titleText', 'titleContentType', 'titleFontColor', 'titleFontFamily', 'titleFontSize', 'titleBold', 'titleItalic', 'titleUnderline', 'titleTransparency'],
  referenceLabelDetail: ['show', 'detailFontColor', 'detailFontFamily', 'detailFontSize', 'detailBold', 'detailItalic', 'detailUnderline', 'detailTransparency', 'detailBackgroundColor', 'detailDisplayUnits', 'detailPrecision', 'showBlankAs'],
  referenceLabelLayout: ['style', 'position', 'arrangement', 'horizontalAlignment', 'verticalAlignment', 'textWrap', 'labelSpace', 'valueArea', 'customizePadding', 'outerPadding', 'paddingBeforeDivider', 'paddingAfterDivider'],
  shadowCustom: ['show', 'color', 'shadowPositionPreset', 'position', 'shadowBlur', 'shadowDistance', 'shadowSpread', 'angle', 'transparency'],
  glowCustom: ['show', 'color', 'glowPositionPreset', 'position', 'shadowBlur', 'glowDistance', 'glowSpread', 'angle', 'transparency'],
  image: ['show', 'imageType', 'imageUrl', 'position', 'horizontalAlignment', 'verticalAlignment', 'fixedSize', 'size', 'imageAreaSize', 'padding', 'transparency'],
  expansionIcon: ['color', 'position', 'verticalAlignment', 'size', 'spacing', 'transparency'],
  fillCustom: ['show', 'fillColor', 'transparency'],
  outline: ['show', 'lineColor', 'weight', 'transparency'],
  shapeCustomRectangle: ['tileShape', 'rectangleRoundedCurve', 'rectangleRoundedCurveCustomStyle', 'rectangleRoundedCurveLeftTop', 'rectangleRoundedCurveRightTop', 'rectangleRoundedCurveLeftBottom', 'rectangleRoundedCurveRightBottom'],
  grid: ['show', 'color', 'style', 'width', 'transparency'],
  card: ['barShow', 'barColor', 'barWeight', 'cardBackground', 'cardPadding', 'outlineColor', 'outlineStyle', 'outlineWeight'],
  cardTitle: ['color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline'],
  dataLabels: ['color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline'],
  indicator: ['fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'horizontalAlignment', 'verticalAlignment', 'showIcon', 'iconSize', 'indicatorDisplayUnits', 'indicatorPrecision'],
  trendline: ['show', 'transparency'],
  goals: ['showGoal', 'goalText', 'goalFontColor', 'goalFontFamily', 'showDistance', 'distanceLabel', 'distanceFontColor', 'distanceFontFamily', 'direction', 'fontSize', 'bold', 'italic', 'underline', 'labelPrecision', 'titleFontSize', 'titleBold', 'titleItalic', 'titleUnderline'],
  status: ['direction', 'goodColor', 'neutralColor', 'badColor'],
  lastDate: ['show', 'lastDateFontColor', 'lastDateFontFamily', 'fontSize', 'bold', 'italic', 'underline'],

  // ---- slicer (classic) ----
  header: ['show', 'text', 'fontColor', 'fontFamily', 'textSize', 'bold', 'italic', 'underline', 'background', 'outlineStyle', 'showRestatement'],
  items: ['fontColor', 'fontFamily', 'textSize', 'bold', 'italic', 'underline', 'background', 'outlineStyle', 'padding', 'steppedLayoutIndentation', 'expandCollapseToggleType'],
  data: ['mode'],
  selection: ['singleSelect', 'strictSingleSelect', 'selectAllCheckboxEnabled'],
  slider: ['show', 'color', 'handleFillColor', 'handleBorderColor', 'secondaryLineColor'],
  searchBox: ['background', 'borderColor', 'outlineStyle'],
  date: ['fontColor', 'fontFamily', 'textSize', 'bold', 'italic', 'underline', 'background', 'hideDatePickerButton'],
  numericInputStyle: ['fontColor', 'fontFamily', 'textSize', 'bold', 'italic', 'underline', 'background'],
  pendingChangesIcon: ['show', 'color', 'position', 'size', 'transparency', 'showTooltip', 'tooltipLabel', 'tooltipText'],
  selectionIcon: ['show', 'color', 'position', 'verticalAlignment', 'size', 'spacing', 'transparency', 'overlayToggle', 'overlayPosition', 'showIconByState'],

  // ---- table / matrix ----
  columnHeaders: ['fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'backColor', 'alignment', 'outlineColor', 'outlineStyle', 'outlineWeight', 'wordWrap', 'autoSizeColumnWidth'],
  values: ['fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'backColor', 'backColorPrimary', 'backColorSecondary', 'fontColorPrimary', 'fontColorSecondary', 'outlineColor', 'outlineStyle', 'outlineWeight', 'wordWrap', 'urlIcon'],
  total: ['totals', 'label', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'backColor', 'outlineColor', 'outlineStyle', 'outlineWeight'],
  sparklines: ['chartType', 'dataColor', 'strokeWidth', 'markers', 'markerColor', 'markerShape', 'markerSize'],
  blankRows: ['showBlankRows', 'blankRowColor', 'blankRowTransparency', 'showBorder', 'borderColor', 'borderPosition', 'borderWidth', 'borderTransparency'],
  columnFormatting: ['alignment', 'fontColor', 'backColor', 'labelDisplayUnits', 'labelPrecision', 'styleHeader', 'styleValues', 'styleTotal'],
  rowHeaders: ['fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'backColor', 'alignment', 'outlineColor', 'outlineStyle', 'outlineWeight', 'stepped', 'steppedLayoutIndentation', 'showExpandCollapseButtons', 'expandCollapseButtonsColor', 'expandCollapseButtonsSize', 'wordWrap', 'repeatRowHeaders'],
  subTotals: ['rowSubtotals', 'rowSubtotalsLabel', 'rowSubtotalsPosition', 'columnSubtotals', 'columnSubtotalsLabel', 'perRowLevel', 'perColumnLevel', 'applyToHeaders', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'backColor'],
  columnTotal: ['applyToHeaders', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'backColor'],
  rowTotal: ['applyToHeaders', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'backColor'],

  // ---- decomposition tree / key influencers / scorecard ----
  levelHeader: ['showSubtitles', 'levelHeaderBackgroundColor', 'levelTitleFontColor', 'levelTitleFontFamily', 'levelTitleFontSize', 'levelTitleBold', 'levelTitleItalic', 'levelTitleUnderline', 'levelSubtitleFontColor', 'levelSubtitleFontFamily', 'levelSubtitleFontSize', 'levelSubtitleBold'],
  tree: ['accentColor', 'connectorDefaultColor', 'connectorType', 'barsPerLevel', 'density', 'responsiveLayout'],
  dataBars: ['dataBarColor', 'dataBarBackgroundColor', 'positiveBarColor', 'negativeBarColor', 'dataBarWidthPercent', 'dataBarScalingType'],
  keyInfluencersVisual: '*',
  keyDriversDrillVisual: '*',
  scorecard: ['displayMode', 'fontFamily', 'backgroundColor', 'foregroundColor', 'tableBackgroundColor', 'showCommandBar'],
  detailsPane: '*',

  // ---- buttons / navigators / shapes ----
  text: ['show', 'text', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'horizontalAlignment', 'verticalAlignment', 'topMargin', 'bottomMargin', 'leftMargin', 'rightMargin'],
  fill: ['show', 'fillColor', 'transparency'],
  shadow: ['show', 'color', 'shadowPositionPreset', 'shadowBlur', 'shadowDistance', 'angle', 'transparency'],
  glow: ['show', 'color', 'shadowBlur', 'transparency'],
  icon: ['show', 'shapeType', 'placement', 'lineColor', 'lineWeight', 'lineTransparency', 'iconSize', 'horizontalAlignment', 'verticalAlignment', 'topMargin', 'bottomMargin', 'leftMargin', 'rightMargin'],
  shape: ['tileShape', 'rectangleRoundedCurve', 'roundEdge'],
  rotation: ['angle', 'shapeAngle', 'textAngle'],
  pages: ['showHiddenPages', 'showTooltipPages'],
  imageScaling: ['imageScalingType'],

  // ---- maps ----
  mapStyles: ['mapTheme', 'showLabels'],
  heatMap: ['show', 'color0', 'color50', 'color100', 'filterRadius', 'unit', 'transparency'],
  mapControls: ['autoZoom', 'showZoomButtons', 'showLassoButton'],
  stroke: ['show', 'strokeColor', 'strokeWidth'],
  defaultColors: ['defaultShow', 'defaultColor', 'borderColor', 'borderThickness'],
  bubbleLayer: ['show', 'bubbleRadius', 'minBubbleRadius', 'maxRadius', 'strokeColor', 'bubbleStrokeWidth', 'strokeTransparency', 'matchFillColor', 'autoStrokeColor', 'clusteringEnabled', 'clusteredBubbleFillColor', 'clusteredBubbleStrokeColor'],
  filledMap: ['show', 'defaultColor', 'strokeColor', 'strokeWidth', 'strokeTransparency'],
  heatMapLayer: ['show', 'heatMapColorLow', 'heatMapColorCenter', 'heatMapColorHigh', 'heatMapRadius', 'heatMapIntensity'],

  // ---- text slicer ----
  inputText: '*',
  inputTextBox: '*',
  applyButton: '*',
  slicerSettings: '*',

  // ---- page ----
  outspace: ['color', 'transparency'],
  outspacePane: ['backgroundColor', 'transparency', 'foregroundColor', 'fontFamily', 'titleSize', 'headerSize', 'searchTextSize', 'inputBoxColor', 'checkboxAndApplyColor', 'border', 'borderColor', 'width'],
  filterCard: ['backgroundColor', 'transparency', 'foregroundColor', 'fontFamily', 'textSize', 'inputBoxColor', 'border', 'borderColor'],
  pageSize: ['pageSizeTypes', 'pageSizeWidth', 'pageSizeHeight'],
  displayArea: ['verticalAlignment'],
};

/** Combo charts: the secondary Y axis is part of `valueAxis` (sec* properties) — there is no y2Axis card. */
const VALUE_AXIS_COMBO: readonly string[] = [
  ...(CARD_PROPS.valueAxis as readonly string[]),
  'secShow', 'secAxisStyle', 'secLabelColor', 'secFontFamily', 'secFontSize', 'secBold', 'secItalic', 'secUnderline',
  'secShowAxisTitle', 'secTitleText', 'secTitleColor', 'secTitleFontFamily', 'secTitleFontSize', 'secTitleBold', 'secTitleItalic', 'secTitleUnderline',
  'secStart', 'secEnd', 'secLabelDisplayUnits', 'secLabelPrecision', 'secLogAxisScale', 'alignZeros',
];

/** Card-visual / button-slicer variants of the common container cards (different property sets than the shared cards). */
const CARD_VISUAL_PADDING: readonly string[] = ['paddingSelection', 'topMargin', 'bottomMargin', 'leftMargin', 'rightMargin'];
const CARD_VISUAL_SPACING: readonly string[] = ['verticalSpacing'];
const SLICER_BACKGROUND: readonly string[] = ['show', 'color', 'transparency', 'wrapContent'];

/** Common container cards shown on the "Allgemein" tab, in Power BI order. */
export const COMMON_CARDS: readonly string[] = ['title', 'subTitle', 'background', 'border', 'dropShadow', 'visualHeader', 'visualHeaderTooltip', 'padding', 'spacing', 'divider', 'visualTooltip'];

/** Page-level cards (visualStyles.page["*"]). */
export const PAGE_CARDS: readonly string[] = ['pageSize', 'background', 'outspace', 'displayArea', 'outspacePane', 'filterCard'];

const CARTESIAN_BAR: readonly string[] = ['legend', 'categoryAxis', 'valueAxis', 'labels', 'totals', 'dataPoint', 'layout', 'plotArea', 'error', 'trend', 'y1AxisReferenceLine', 'xAxisReferenceLine', 'zoom', 'smallMultiplesLayout', 'subheader', 'ribbonBands'];
const CARTESIAN_CLUSTERED: readonly string[] = ['legend', 'categoryAxis', 'valueAxis', 'labels', 'dataPoint', 'layout', 'plotArea', 'error', 'trend', 'y1AxisReferenceLine', 'xAxisReferenceLine', 'referenceLine', 'zoom', 'smallMultiplesLayout', 'subheader'];
const CARTESIAN_LINE: readonly string[] = ['legend', 'categoryAxis', 'valueAxis', 'y2Axis', 'labels', 'dataPoint', 'lineStyles', 'markers', 'seriesLabels', 'plotArea', 'error', 'trend', 'forecast', 'anomalyDetection', 'y1AxisReferenceLine', 'xAxisReferenceLine', 'referenceLine', 'zoom', 'smallMultiplesLayout', 'subheader'];
const CARTESIAN_AREA: readonly string[] = ['legend', 'categoryAxis', 'valueAxis', 'y2Axis', 'labels', 'dataPoint', 'lineStyles', 'markers', 'seriesLabels', 'plotArea', 'trend', 'y1AxisReferenceLine', 'xAxisReferenceLine', 'referenceLine', 'zoom', 'smallMultiplesLayout', 'subheader'];
const CARTESIAN_STACKED_AREA: readonly string[] = ['legend', 'categoryAxis', 'valueAxis', 'labels', 'totals', 'dataPoint', 'lineStyles', 'markers', 'seriesLabels', 'plotArea', 'trend', 'y1AxisReferenceLine', 'xAxisReferenceLine', 'zoom', 'smallMultiplesLayout', 'subheader'];
const COMBO_STACKED: readonly string[] = ['legend', 'categoryAxis', 'valueAxis', 'labels', 'totals', 'dataPoint', 'lineStyles', 'markers', 'seriesLabels', 'layout', 'plotArea', 'error', 'y1AxisReferenceLine', 'xAxisReferenceLine', 'zoom', 'smallMultiplesLayout', 'subheader'];
const COMBO: readonly string[] = ['legend', 'categoryAxis', 'valueAxis', 'labels', 'dataPoint', 'lineStyles', 'markers', 'seriesLabels', 'layout', 'plotArea', 'error', 'trend', 'y1AxisReferenceLine', 'xAxisReferenceLine', 'referenceLine', 'zoom', 'smallMultiplesLayout', 'subheader'];
const NAVIGATOR: readonly string[] = ['text', 'fill', 'outline', 'shadow', 'glow', 'layout', 'accentBar', 'shape', 'rotation'];
const BUTTON_SLICER: readonly string[] = ['label', 'value', 'selection', 'layout', 'fillCustom', 'outline', 'accentBar', 'selectionIcon', 'icon', 'shapeCustomRectangle', 'shadowCustom', 'glowCustom'];

/** Visual-specific cards per visual type, in display order. */
export const VISUAL_CARDS: Record<string, readonly string[]> = {
  barChart: CARTESIAN_BAR,
  clusteredBarChart: CARTESIAN_CLUSTERED,
  hundredPercentStackedBarChart: CARTESIAN_BAR,
  columnChart: CARTESIAN_BAR,
  clusteredColumnChart: CARTESIAN_CLUSTERED,
  hundredPercentStackedColumnChart: CARTESIAN_BAR,
  lineChart: CARTESIAN_LINE,
  areaChart: CARTESIAN_AREA,
  stackedAreaChart: CARTESIAN_STACKED_AREA,
  hundredPercentStackedAreaChart: CARTESIAN_STACKED_AREA,
  lineClusteredColumnComboChart: COMBO,
  lineStackedColumnComboChart: COMBO_STACKED,
  ribbonChart: ['legend', 'categoryAxis', 'valueAxis', 'labels', 'totals', 'dataPoint', 'ribbonBands', 'layout', 'plotArea', 'error', 'trend', 'y1AxisReferenceLine', 'xAxisReferenceLine', 'zoom', 'subheader'],
  waterfallChart: ['legend', 'categoryAxis', 'valueAxis', 'labels', 'sentimentColors', 'breakdown', 'plotArea', 'y1AxisReferenceLine'],
  scatterChart: ['legend', 'categoryAxis', 'valueAxis', 'bubbles', 'fillPoint', 'markers', 'dataPoint', 'categoryLabels', 'plotArea', 'plotAreaShading', 'ratioLine', 'trend', 'referenceLine', 'colorByCategory', 'zoom'],
  pieChart: ['legend', 'labels', 'slices', 'dataPoint'],
  donutChart: ['legend', 'labels', 'slices', 'dataPoint'],
  treemap: ['legend', 'categoryLabels', 'labels', 'layout', 'dataPoint'],
  funnel: ['categoryAxis', 'labels', 'percentBarLabel', 'dataPoint'],
  gauge: ['axis', 'calloutValue', 'target', 'labels', 'dataPoint'],
  card: ['labels', 'categoryLabels', 'wordWrap'],
  cardVisual: ['value', 'label', 'accentBar', 'layout', 'referenceLabelLayout', 'referenceLabelValue', 'referenceLabelTitle', 'referenceLabelDetail', 'image', 'fillCustom', 'outline', 'shapeCustomRectangle', 'shadowCustom', 'glowCustom', 'grid'],
  multiRowCard: ['card', 'cardTitle', 'categoryLabels', 'dataLabels'],
  kpi: ['indicator', 'trendline', 'goals', 'status', 'lastDate'],
  slicer: ['header', 'items', 'data', 'selection', 'slider', 'searchBox', 'date', 'numericInputStyle', 'pendingChangesIcon'],
  advancedSlicerVisual: BUTTON_SLICER,
  listSlicer: [...BUTTON_SLICER, 'expansionIcon'],
  textSlicer: ['inputText', 'inputTextBox', 'applyButton', 'slicerSettings'],
  tableEx: ['grid', 'columnHeaders', 'values', 'total', 'columnFormatting', 'sparklines'],
  pivotTable: ['grid', 'rowHeaders', 'columnHeaders', 'values', 'subTotals', 'columnTotal', 'rowTotal', 'total', 'blankRows', 'sparklines'],
  decompositionTreeVisual: ['levelHeader', 'tree', 'dataBars', 'categoryLabels', 'dataLabels'],
  keyDriversVisual: ['keyInfluencersVisual', 'keyDriversDrillVisual'],
  scorecard: ['scorecard', 'header', 'columnHeaders', 'goals', 'detailsPane'],
  actionButton: ['text', 'fill', 'outline', 'shadow', 'glow', 'icon', 'shape', 'rotation'],
  bookmarkNavigator: NAVIGATOR,
  pageNavigator: [...NAVIGATOR, 'pages'],
  shape: ['fill', 'outline', 'text', 'rotation', 'shape', 'shadow', 'glow'],
  textbox: ['text'],
  image: ['imageScaling'],
  map: ['legend', 'bubbles', 'categoryLabels', 'dataPoint', 'heatMap', 'mapStyles', 'mapControls'],
  filledMap: ['legend', 'labels', 'dataPoint', 'stroke', 'mapStyles', 'mapControls'],
  shapeMap: ['legend', 'dataPoint', 'defaultColors', 'shape', 'zoom'],
  azureMap: ['legend', 'bubbleLayer', 'filledMap', 'heatMapLayer', 'barChart', 'categoryLabels', 'labels', 'mapControls'],
};

/** Per-visual property overrides where a card name is reused with a different property set. */
export const VISUAL_CARD_PROPS: Record<string, Record<string, PropList>> = {
  lineClusteredColumnComboChart: { valueAxis: VALUE_AXIS_COMBO },
  lineStackedColumnComboChart: { valueAxis: VALUE_AXIS_COMBO },
  lineChart: { dataPoint: ['defaultColor', 'showAllDataPoints', 'transparency'] },
  areaChart: { dataPoint: ['defaultColor', 'showAllDataPoints', 'transparency'] },
  stackedAreaChart: { dataPoint: ['defaultColor', 'showAllDataPoints', 'transparency'] },
  hundredPercentStackedAreaChart: { dataPoint: ['defaultColor', 'showAllDataPoints', 'transparency'] },
  ribbonChart: { layout: ['ribbonGapSize', 'stackedGapSize', 'stackedGapExplodes', 'seriesOrderReversed', 'seriesOrderSorted'] },
  scatterChart: { dataPoint: ['defaultColor', 'showAllDataPoints'] },
  pieChart: { labels: ['show', 'labelStyle', 'position', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'labelDisplayUnits', 'labelPrecision', 'percentageLabelPrecision', 'background', 'overflow'] },
  donutChart: { labels: ['show', 'labelStyle', 'position', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'labelDisplayUnits', 'labelPrecision', 'percentageLabelPrecision', 'background', 'overflow'] },
  treemap: {
    categoryLabels: ['show', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline'],
    labels: ['show', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'labelDisplayUnits', 'labelPrecision'],
    layout: ['tilingMethod', 'innerPadding', 'outerPadding'],
    dataPoint: ['fill'],
  },
  funnel: {
    categoryAxis: ['show', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline'],
    labels: ['show', 'funnelLabelStyle', 'labelPosition', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'labelDisplayUnits', 'labelPrecision', 'percentageLabelPrecision', 'enableBackground', 'backgroundColor', 'backgroundTransparency'],
    dataPoint: ['defaultColor', 'showAllDataPoints'],
  },
  gauge: {
    labels: ['show', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'labelDisplayUnits', 'labelPrecision'],
    dataPoint: ['fill', 'target'],
  },
  card: {
    labels: ['color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'labelDisplayUnits', 'labelPrecision'],
    categoryLabels: ['show', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline'],
  },
  clusteredBarChart: { layout: ['seriesOrderReversed', 'seriesOrderSorted', 'clusteredGapSize', 'clusteredGapOverlaps', 'clusteredGapOverlapReverse'] },
  clusteredColumnChart: { layout: ['seriesOrderReversed', 'seriesOrderSorted', 'clusteredGapSize', 'clusteredGapOverlaps', 'clusteredGapOverlapReverse'] },
  cardVisual: {
    layout: ['style', 'alignment', 'orientation', 'columnCount', 'rowCount', 'maxTiles', 'cellPadding', 'customizePadding', 'rowPadding', 'columnPadding', 'topOuterMargin', 'bottomOuterMargin', 'leftOuterMargin', 'rightOuterMargin', 'rectangleRoundedCurve', 'rectangleRoundedCurveCustomStyle', 'rectangleRoundedCurveLeftTop', 'rectangleRoundedCurveRightTop', 'rectangleRoundedCurveLeftBottom', 'rectangleRoundedCurveRightBottom', 'backgroundShow', 'backgroundFillColor', 'backgroundTransparency', 'borderWidth', 'borderColor', 'borderStyle', 'borderTransparency', 'customizeLines', 'lineColor', 'lineStyle', 'lineWidth', 'lineTransparency', 'gridlineColor', 'gridlineStyle', 'gridlineWidth', 'gridlineTransparency', 'calloutSize'],
    border: ['show', 'color', 'width', 'style', 'transparency'],
    divider: ['show', 'dividerColor', 'dividerLineStyle', 'dividerWidth', 'dividerTransparency', 'dividerIgnorePadding'],
    padding: CARD_VISUAL_PADDING,
    spacing: CARD_VISUAL_SPACING,
  },
  multiRowCard: { categoryLabels: ['show', 'color', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline'] },
  advancedSlicerVisual: {
    background: SLICER_BACKGROUND,
    padding: CARD_VISUAL_PADDING,
    spacing: CARD_VISUAL_SPACING,
    selection: ['singleSelect', 'strictSingleSelect', 'selectAllCheckboxEnabled', 'restrictToLeafNodes'],
    layout: ['style', 'alignment', 'orientation', 'columnCount', 'rowCount', 'maxTiles', 'cellPadding', 'customizePadding', 'rowPadding', 'columnPadding', 'topOuterMargin', 'bottomOuterMargin', 'leftOuterMargin', 'rightOuterMargin', 'rectangleRoundedCurve', 'rectangleRoundedCurveCustomStyle', 'rectangleRoundedCurveLeftTop', 'rectangleRoundedCurveRightTop', 'rectangleRoundedCurveLeftBottom', 'rectangleRoundedCurveRightBottom', 'backgroundShow', 'backgroundFillColor', 'backgroundTransparency', 'borderWidth', 'borderColor', 'borderStyle', 'borderTransparency', 'customizeLines', 'lineColor', 'lineStyle', 'lineWidth', 'lineTransparency', 'gridlineColor', 'gridlineStyle', 'gridlineWidth', 'gridlineTransparency', 'calloutSize'],
    value: ['show', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'horizontalAlignment', 'verticalAlignment', 'textWrap', 'transparency'],
    label: ['show', 'position', 'heading', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'horizontalAlignment', 'alignBaselines', 'matchValueAlignment', 'textWrap', 'transparency'],
    icon: ['show', 'iconType', 'iconUrl', 'position', 'size', 'padding', 'transparency'],
  },
  listSlicer: {
    background: SLICER_BACKGROUND,
    padding: CARD_VISUAL_PADDING,
    spacing: CARD_VISUAL_SPACING,
    selection: ['singleSelect', 'strictSingleSelect', 'selectAllCheckboxEnabled', 'restrictToLeafNodes'],
    layout: [...['style', 'alignment', 'orientation', 'columnCount', 'rowCount', 'maxTiles', 'cellPadding', 'customizePadding', 'rowPadding', 'columnPadding', 'topOuterMargin', 'bottomOuterMargin', 'leftOuterMargin', 'rightOuterMargin', 'rectangleRoundedCurve', 'rectangleRoundedCurveCustomStyle', 'rectangleRoundedCurveLeftTop', 'rectangleRoundedCurveRightTop', 'rectangleRoundedCurveLeftBottom', 'rectangleRoundedCurveRightBottom', 'backgroundShow', 'backgroundFillColor', 'backgroundTransparency', 'borderWidth', 'borderColor', 'borderStyle', 'borderTransparency', 'customizeLines', 'lineColor', 'lineStyle', 'lineWidth', 'lineTransparency', 'gridlineColor', 'gridlineStyle', 'gridlineWidth', 'gridlineTransparency', 'calloutSize'], 'indentation', 'containerIndentation', 'reverseIndentation', 'fixedButtonsCount'],
    value: ['show', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'horizontalAlignment', 'verticalAlignment', 'textWrap', 'transparency'],
    label: ['show', 'position', 'heading', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'horizontalAlignment', 'alignBaselines', 'matchValueAlignment', 'textWrap', 'transparency'],
    icon: ['show', 'iconType', 'iconUrl', 'position', 'size', 'padding', 'transparency'],
  },
  pivotTable: {
    grid: ['gridVertical', 'gridVerticalColor', 'gridVerticalWeight', 'gridHorizontal', 'gridHorizontalColor', 'gridHorizontalWeight', 'outlineColor', 'outlineStyle', 'outlineWeight', 'rowPadding', 'textSize', 'imageHeight', 'imageWidth'],
    columnHeaders: ['fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'backColor', 'alignment', 'titleAlignment', 'outlineColor', 'outlineStyle', 'outlineWeight', 'wordWrap', 'autoSizeColumnWidth'],
    values: ['fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'backColor', 'backColorPrimary', 'backColorSecondary', 'fontColorPrimary', 'fontColorSecondary', 'bandedRowHeaders', 'valuesOnRow', 'outlineColor', 'outlineStyle', 'outlineWeight', 'wordWrap', 'urlIcon'],
    total: ['applyToHeaders', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'backColor'],
  },
  tableEx: {
    grid: ['gridVertical', 'gridVerticalColor', 'gridVerticalWeight', 'gridHorizontal', 'gridHorizontalColor', 'gridHorizontalWeight', 'outlineColor', 'outlineStyle', 'outlineWeight', 'rowPadding', 'textSize', 'imageHeight'],
  },
  decompositionTreeVisual: {
    categoryLabels: ['categoryLabelFontColor', 'categoryLabelFontFamily', 'categoryLabelFontSize', 'categoryLabelBold', 'categoryLabelItalic', 'categoryLabelUnderline'],
    dataLabels: ['dataLabelFontColor', 'dataLabelFontFamily', 'dataLabelFontSize', 'dataLabelBold', 'dataLabelItalic', 'dataLabelUnderline', 'dataLabelDisplayUnits', 'dataLabelPrecision'],
  },
  scorecard: {
    header: ['show', 'showTitle', 'showCards', 'showToolbar', 'backgroundColor', 'foregroundColor'],
    columnHeaders: ['show', 'foregroundColor'],
    goals: ['backgroundColor', 'foregroundColor'],
  },
  bookmarkNavigator: { text: ['show', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'horizontalAlignment', 'verticalAlignment'], layout: ['orientation', 'columnCount', 'rowCount', 'cellPadding'] },
  pageNavigator: { text: ['show', 'fontColor', 'fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'horizontalAlignment', 'verticalAlignment'], layout: ['orientation', 'columnCount', 'rowCount', 'cellPadding'] },
  shape: { shape: ['tileShape', 'rectangleRoundedCurve', 'roundEdge', 'linecapType'] },
  textbox: { text: ['color', 'fontFamily', 'fontSize'] },
  map: { dataPoint: ['defaultColor', 'transparency', 'showAllDataPoints'] },
  filledMap: { dataPoint: ['defaultColor', 'transparency', 'showAllDataPoints'], labels: ['show', 'color', 'labelDisplayUnits', 'labelPrecision'] },
  shapeMap: { dataPoint: ['defaultColor'], shape: ['projectionEnum'], zoom: ['autoZoom', 'manualZoom', 'selectionZoom'] },
  azureMap: {
    barChart: ['show', 'defaultColor', 'barHeight', 'thickness', 'barShape'],
    labels: ['show', 'color', 'labelDisplayUnits', 'labelPrecision'],
    mapControls: ['defaultStyle', 'showLabels', 'showNavigationControls', 'showStylePicker', 'showSelectionControl', 'autoZoom'],
  },
  pageSize: {},
};

/** Page cards use CARD_PROPS entries of the same name except `background` (page has an image too). */
export const PAGE_CARD_PROPS: Record<string, PropList> = {
  background: ['color', 'transparency'],
};

export interface VisualCategory {
  id: string;
  visuals: readonly string[];
}

/** Gallery order, mirrors the Power BI visualizations pane grouping. */
export const VISUAL_CATEGORIES: readonly VisualCategory[] = [
  { id: 'bar', visuals: ['barChart', 'clusteredBarChart', 'hundredPercentStackedBarChart'] },
  { id: 'column', visuals: ['columnChart', 'clusteredColumnChart', 'hundredPercentStackedColumnChart'] },
  { id: 'line', visuals: ['lineChart', 'areaChart', 'stackedAreaChart', 'hundredPercentStackedAreaChart'] },
  { id: 'combo', visuals: ['lineClusteredColumnComboChart', 'lineStackedColumnComboChart', 'ribbonChart', 'waterfallChart'] },
  { id: 'distribution', visuals: ['scatterChart', 'funnel', 'pieChart', 'donutChart', 'treemap'] },
  { id: 'map', visuals: ['map', 'filledMap', 'shapeMap', 'azureMap'] },
  { id: 'cards', visuals: ['cardVisual', 'card', 'multiRowCard', 'kpi', 'gauge'] },
  { id: 'tables', visuals: ['tableEx', 'pivotTable'] },
  { id: 'slicers', visuals: ['slicer', 'advancedSlicerVisual', 'listSlicer', 'textSlicer'] },
  { id: 'ai', visuals: ['decompositionTreeVisual', 'keyDriversVisual', 'scorecard'] },
  { id: 'elements', visuals: ['actionButton', 'bookmarkNavigator', 'pageNavigator', 'textbox', 'shape', 'image'] },
];

/** All curated visual keys in gallery order. */
export const VISUAL_KEYS: readonly string[] = VISUAL_CATEGORIES.flatMap((c) => c.visuals);

/** Text classes in Power BI "Text" section order: 4 primary, then secondary. */
export const PRIMARY_TEXT_CLASSES: readonly string[] = ['label', 'title', 'callout', 'header'];
export const SECONDARY_TEXT_CLASSES: readonly string[] = ['largeTitle', 'dataTitle', 'largeLabel', 'boldLabel', 'semiboldLabel', 'smallLabel', 'lightLabel', 'largeLightLabel', 'smallLightLabel', 'smallDataLabel'];

/** Colour groups of the Power BI theme pane. */
export const COLOR_GROUPS: readonly { id: string; keys: readonly string[] }[] = [
  { id: 'structural', keys: ['foreground', 'background', 'firstLevelElements', 'secondLevelElements', 'thirdLevelElements', 'fourthLevelElements', 'secondaryBackground', 'tableAccent'] },
  { id: 'sentiment', keys: ['good', 'neutral', 'bad'] },
  { id: 'divergent', keys: ['maximum', 'center', 'minimum', 'null'] },
  { id: 'advanced', keys: ['accent', 'hyperlink', 'visitedHyperlink', 'shapeStroke', 'disabledText', 'mapPushpin', 'foregroundLight', 'foregroundDark', 'foregroundNeutralLight', 'foregroundNeutralDark', 'foregroundNeutralSecondary', 'foregroundNeutralSecondaryAlt', 'foregroundNeutralSecondaryAlt2', 'foregroundNeutralTertiary', 'foregroundNeutralTertiaryAlt', 'foregroundSelected', 'foregroundButton', 'backgroundLight', 'backgroundNeutral', 'backgroundDark'] },
];
