import {
  Bookmark, Braces, ChartArea, ChartBar, ChartBarStacked, ChartColumn, ChartColumnStacked, ChartLine, ChartNoAxesCombined, ChartPie, ChartScatter,
  ChartSpline, CreditCard, Donut, Earth, Files, Funnel, Gauge, GitFork, Goal, Grid3x3, Image, LayoutDashboard, LayoutTemplate, ListChecks, Map, MapPin,
  MousePointerClick, Percent, RectangleHorizontal, Ribbon, Rows3, SlidersHorizontal, Sparkles, Square, Table, TextCursorInput, TrendingDown, Type, type LucideIcon,
} from 'lucide-react';

/** One icon per curated visual key (Power BI gallery stand-ins). */
export const VISUAL_ICONS: Record<string, LucideIcon> = {
  '*': LayoutDashboard,
  page: LayoutTemplate,
  barChart: ChartBarStacked,
  clusteredBarChart: ChartBar,
  hundredPercentStackedBarChart: Percent,
  columnChart: ChartColumnStacked,
  clusteredColumnChart: ChartColumn,
  hundredPercentStackedColumnChart: Percent,
  lineChart: ChartLine,
  areaChart: ChartArea,
  stackedAreaChart: ChartArea,
  hundredPercentStackedAreaChart: ChartArea,
  lineClusteredColumnComboChart: ChartNoAxesCombined,
  lineStackedColumnComboChart: ChartNoAxesCombined,
  ribbonChart: Ribbon,
  waterfallChart: TrendingDown,
  scatterChart: ChartScatter,
  funnel: Funnel,
  pieChart: ChartPie,
  donutChart: Donut,
  treemap: Grid3x3,
  map: MapPin,
  filledMap: Map,
  shapeMap: Map,
  azureMap: Earth,
  cardVisual: CreditCard,
  card: RectangleHorizontal,
  multiRowCard: Rows3,
  kpi: Goal,
  gauge: Gauge,
  tableEx: Table,
  pivotTable: Grid3x3,
  slicer: SlidersHorizontal,
  advancedSlicerVisual: ListChecks,
  listSlicer: ListChecks,
  textSlicer: TextCursorInput,
  decompositionTreeVisual: GitFork,
  keyDriversVisual: Sparkles,
  scorecard: Goal,
  actionButton: MousePointerClick,
  bookmarkNavigator: Bookmark,
  pageNavigator: Files,
  textbox: Type,
  shape: Square,
  image: Image,
};

export function VisualIcon({ visualKey, size = 18, className }: { visualKey: string; size?: number; className?: string }) {
  const Icon = VISUAL_ICONS[visualKey] ?? ChartSpline;
  return <Icon size={size} className={className} aria-hidden />;
}

export { Braces };
