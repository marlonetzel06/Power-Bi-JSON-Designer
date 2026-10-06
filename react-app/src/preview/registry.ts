import type { ReactNode } from 'react';
import { CartesianChart, type CartesianOptions } from './cartesian/CartesianChart';
import { DecompositionTree, KeyInfluencers, Scorecard } from './visuals/Analytics';
import { ClassicCard, Kpi, MultiRowCard, NewCard } from './visuals/Cards';
import { ActionButton, Image, Navigator, Shape, Textbox } from './visuals/Elements';
import { Funnel } from './visuals/Funnel';
import { Gauge } from './visuals/Gauge';
import { MapVisual } from './visuals/Maps';
import { PieDonut } from './visuals/PieDonut';
import { ButtonSlicer, ClassicSlicer, TextSlicer } from './visuals/Slicers';
import { Table } from './visuals/Tables';
import { Treemap } from './visuals/Treemap';
import type { BodyProps } from './types';
import { createElement } from 'react';

export interface RendererEntry {
  body: (props: BodyProps) => ReactNode;
  /** Default title shown when the theme has none. */
  title: string;
  /** Buttons/shapes/navigators have no visual header in Power BI. */
  suppressTitle?: boolean;
  /** Natural size on a 1280×720 page. */
  size: { width: number; height: number };
}

const cartesian = (options: CartesianOptions, title: string, size = { width: 480, height: 300 }): RendererEntry => ({
  body: (p) => createElement(CartesianChart, { ...p, options }),
  title,
  size,
});

const CHART = { width: 480, height: 300 };
const SQUARE = { width: 320, height: 300 };
const CARD = { width: 240, height: 150 };
const SLICER = { width: 220, height: 220 };
const ELEMENT = { width: 220, height: 80 };

export const VISUAL_RENDERERS: Record<string, RendererEntry> = {
  barChart: cartesian({ variant: 'bar', stack: 'stacked' }, 'Umsatz nach Region'),
  clusteredBarChart: cartesian({ variant: 'bar', stack: 'none' }, 'Umsatz und Plan nach Region'),
  hundredPercentStackedBarChart: cartesian({ variant: 'bar', stack: 'percent' }, 'Anteil nach Region'),
  columnChart: cartesian({ variant: 'column', stack: 'stacked' }, 'Umsatz nach Region'),
  clusteredColumnChart: cartesian({ variant: 'column', stack: 'none' }, 'Umsatz und Plan nach Region'),
  hundredPercentStackedColumnChart: cartesian({ variant: 'column', stack: 'percent' }, 'Anteil nach Region'),
  lineChart: cartesian({ variant: 'line', stack: 'none', series: 2 }, 'Umsatz nach Monat'),
  areaChart: cartesian({ variant: 'area', stack: 'none', series: 2 }, 'Umsatz nach Monat'),
  stackedAreaChart: cartesian({ variant: 'area', stack: 'stacked', series: 3 }, 'Umsatz nach Monat und Produkt'),
  hundredPercentStackedAreaChart: cartesian({ variant: 'area', stack: 'percent', series: 3 }, 'Anteil nach Monat'),
  lineClusteredColumnComboChart: cartesian({ variant: 'combo', stack: 'none', series: 3, comboLine: true }, 'Umsatz und Marge'),
  lineStackedColumnComboChart: cartesian({ variant: 'combo', stack: 'stacked', series: 3, comboLine: true }, 'Umsatz und Marge'),
  ribbonChart: cartesian({ variant: 'ribbon', stack: 'stacked', series: 3 }, 'Rang nach Region'),
  waterfallChart: cartesian({ variant: 'waterfall' }, 'Ergebnisbrücke'),
  scatterChart: cartesian({ variant: 'scatter' }, 'Umsatz vs. Marge'),
  pieChart: { body: (p) => createElement(PieDonut, { ...p, donut: false }), title: 'Umsatz nach Produkt', size: SQUARE },
  donutChart: { body: (p) => createElement(PieDonut, { ...p, donut: true }), title: 'Umsatz nach Produkt', size: SQUARE },
  treemap: { body: Treemap, title: 'Umsatz nach Produkt', size: CHART },
  funnel: { body: Funnel, title: 'Vertriebstrichter', size: SQUARE },
  gauge: { body: Gauge, title: 'Zielerreichung', size: { width: 300, height: 220 } },
  card: { body: ClassicCard, title: 'Umsatz', size: CARD },
  cardVisual: { body: NewCard, title: 'Kennzahlen', size: { width: 320, height: 170 } },
  multiRowCard: { body: MultiRowCard, title: 'Regionen', size: { width: 300, height: 260 } },
  kpi: { body: Kpi, title: 'Umsatz vs. Ziel', size: CARD },
  slicer: { body: ClassicSlicer, title: 'Produktgruppe', suppressTitle: true, size: SLICER },
  advancedSlicerVisual: { body: (p) => createElement(ButtonSlicer, { ...p, list: false }), title: 'Produktgruppe', size: { width: 320, height: 160 } },
  listSlicer: { body: (p) => createElement(ButtonSlicer, { ...p, list: true }), title: 'Produktgruppe', size: SLICER },
  textSlicer: { body: TextSlicer, title: 'Suche', size: { width: 320, height: 90 } },
  tableEx: { body: (p) => createElement(Table, { ...p, matrix: false }), title: 'Umsatz nach Region', size: { width: 480, height: 260 } },
  pivotTable: { body: (p) => createElement(Table, { ...p, matrix: true }), title: 'Umsatz nach Land und Region', size: { width: 480, height: 300 } },
  decompositionTreeVisual: { body: DecompositionTree, title: 'Umsatzanalyse', size: { width: 520, height: 300 } },
  keyDriversVisual: { body: KeyInfluencers, title: 'Wichtige Einflussfaktoren', size: { width: 520, height: 300 } },
  scorecard: { body: Scorecard, title: 'Scorecard', suppressTitle: true, size: { width: 480, height: 260 } },
  actionButton: { body: ActionButton, title: 'Schaltfläche', suppressTitle: true, size: ELEMENT },
  bookmarkNavigator: { body: (p) => createElement(Navigator, { ...p, bookmarks: true }), title: 'Lesezeichen', suppressTitle: true, size: { width: 420, height: 70 } },
  pageNavigator: { body: (p) => createElement(Navigator, { ...p, bookmarks: false }), title: 'Seiten', suppressTitle: true, size: { width: 420, height: 70 } },
  shape: { body: Shape, title: 'Form', suppressTitle: true, size: { width: 220, height: 160 } },
  textbox: { body: Textbox, title: 'Textfeld', suppressTitle: true, size: { width: 360, height: 120 } },
  image: { body: Image, title: 'Bild', suppressTitle: true, size: { width: 240, height: 160 } },
  map: { body: (p) => createElement(MapVisual, { ...p, kind: 'map' }), title: 'Umsatz nach Standort', size: CHART },
  filledMap: { body: (p) => createElement(MapVisual, { ...p, kind: 'filledMap' }), title: 'Umsatz nach Land', size: CHART },
  shapeMap: { body: (p) => createElement(MapVisual, { ...p, kind: 'shapeMap' }), title: 'Umsatz nach Land', size: CHART },
  azureMap: { body: (p) => createElement(MapVisual, { ...p, kind: 'azureMap' }), title: 'Standorte', size: CHART },
};

export function getRenderer(visualKey: string): RendererEntry | undefined {
  return VISUAL_RENDERERS[visualKey];
}
