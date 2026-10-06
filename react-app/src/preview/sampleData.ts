/** Deterministic sample data so previews (and screenshot tests) are stable. */

export const CATEGORIES = ['Nord', 'Süd', 'West', 'Ost', 'Mitte'];
export const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug'];
export const SERIES_NAMES = ['Umsatz', 'Plan', 'Vorjahr'];

export const SERIES: number[][] = [
  [42, 68, 55, 81, 37],
  [35, 52, 61, 70, 44],
  [28, 40, 47, 58, 30],
];

export const TIME_SERIES: number[][] = [
  [32, 45, 41, 58, 63, 57, 72, 78],
  [28, 36, 44, 47, 52, 60, 64, 69],
  [20, 24, 31, 29, 38, 42, 45, 51],
];

export const SCATTER = [
  [12, 30, 8], [22, 45, 14], [31, 38, 10], [40, 62, 18], [52, 55, 9], [61, 74, 22], [70, 66, 12], [83, 88, 16], [90, 79, 7],
];

export const WATERFALL = [
  { label: 'Start', value: 120 },
  { label: 'Umsatz', value: 45 },
  { label: 'Kosten', value: -38 },
  { label: 'Steuern', value: -17 },
  { label: 'Sonstiges', value: 12 },
];

export const TREEMAP = [
  { label: 'Hardware', value: 42 },
  { label: 'Software', value: 28 },
  { label: 'Service', value: 16 },
  { label: 'Cloud', value: 9 },
  { label: 'Training', value: 5 },
];

export const FUNNEL = [
  { label: 'Leads', value: 1200 },
  { label: 'Qualifiziert', value: 860 },
  { label: 'Angebot', value: 520 },
  { label: 'Verhandlung', value: 310 },
  { label: 'Abschluss', value: 180 },
];

export const TABLE_COLUMNS = ['Region', 'Umsatz', 'Plan', 'Abw. %'];
export const TABLE_ROWS = [
  ['Nord', '1.248.300', '1.200.000', '4,0 %'],
  ['Süd', '986.750', '1.050.000', '-6,0 %'],
  ['West', '1.102.400', '1.000.000', '10,2 %'],
  ['Ost', '743.900', '800.000', '-7,0 %'],
  ['Mitte', '655.100', '620.000', '5,7 %'],
];
export const TABLE_TOTAL = ['Gesamt', '4.736.450', '4.670.000', '1,4 %'];

export const MATRIX_ROWS = [
  { label: 'Deutschland', level: 0, values: ['2.350.700', '2.250.000', '4,5 %'] },
  { label: 'Nord', level: 1, values: ['1.248.300', '1.200.000', '4,0 %'] },
  { label: 'Süd', level: 1, values: ['1.102.400', '1.050.000', '5,0 %'] },
  { label: 'Österreich', level: 0, values: ['1.399.000', '1.420.000', '-1,5 %'] },
  { label: 'West', level: 1, values: ['743.900', '800.000', '-7,0 %'] },
  { label: 'Ost', level: 1, values: ['655.100', '620.000', '5,7 %'] },
];

export const SLICER_ITEMS = ['Alle', 'Hardware', 'Software', 'Service', 'Cloud'];
export const KPI_SPARK = [48, 52, 50, 57, 61, 59, 66, 72, 70, 78];
export const DONUT = [38, 27, 18, 11, 6];
export const PIE_LABELS = ['Hardware', 'Software', 'Service', 'Cloud', 'Training'];

export const DECOMP_LEVELS = [
  { title: 'Umsatz', nodes: [{ label: 'Gesamt', value: 4.74, width: 1 }] },
  { title: 'Region', nodes: [{ label: 'Nord', value: 1.25, width: 1 }, { label: 'West', value: 1.1, width: 0.88 }, { label: 'Süd', value: 0.99, width: 0.79 }, { label: 'Ost', value: 0.74, width: 0.6 }] },
  { title: 'Produkt', nodes: [{ label: 'Hardware', value: 0.52, width: 1 }, { label: 'Software', value: 0.41, width: 0.8 }, { label: 'Service', value: 0.32, width: 0.6 }] },
];

export const MAP_BUBBLES = [
  { x: 0.28, y: 0.38, r: 1 }, { x: 0.46, y: 0.3, r: 0.6 }, { x: 0.55, y: 0.52, r: 0.8 }, { x: 0.7, y: 0.42, r: 0.5 }, { x: 0.36, y: 0.62, r: 0.45 }, { x: 0.78, y: 0.66, r: 0.7 },
];

export const NAV_PAGES = ['Übersicht', 'Umsatz', 'Kosten', 'Regionen'];

export function formatNumber(v: number, units = 0, precision = 0): string {
  let value = v;
  let suffix = '';
  const u = Number(units);
  if (u === 1000 || (u === 0 && Math.abs(v) >= 1000 && Math.abs(v) < 1_000_000)) {
    value = v / 1000;
    suffix = ' Tsd.';
  } else if (u === 1_000_000 || (u === 0 && Math.abs(v) >= 1_000_000)) {
    value = v / 1_000_000;
    suffix = ' Mio.';
  } else if (u === 1_000_000_000) {
    value = v / 1_000_000_000;
    suffix = ' Mrd.';
  }
  const p = Math.max(0, Math.min(10, Number(precision) || 0));
  return value.toLocaleString('de-DE', { minimumFractionDigits: p, maximumFractionDigits: suffix && p === 0 ? 1 : p }) + suffix;
}

/** Display unit (divisor) Power BI would pick automatically for a set of values. */
export function autoUnit(values: number[]): number {
  const max = Math.max(0, ...values.map((v) => Math.abs(v)));
  if (max >= 1_000_000_000) return 1_000_000_000;
  if (max >= 1_000_000) return 1_000_000;
  if (max >= 1000) return 1000;
  return 1;
}

const UNIT_SUFFIX: Record<number, string> = { 1: '', 1000: ' Tsd.', 1_000_000: ' Mio.', 1_000_000_000: ' Mrd.', 1_000_000_000_000: ' Bio.' };

/**
 * Format with one fixed unit, as axes do: every tick shares the unit of the largest value
 * ("0 Tsd. … 80 Tsd."). `units` 0 = auto, else the divisor (1000, 1000000, …).
 */
export function formatWithUnit(v: number, unit: number, precision?: number): string {
  const u = unit > 1 ? unit : 1;
  if (precision === undefined || precision === null || Number.isNaN(precision)) {
    // "Auto" precision like Power BI: up to two decimals once a display unit applies, none for plain values
    return (v / u).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: u > 1 ? 2 : 0 }) + (UNIT_SUFFIX[u] ?? '');
  }
  const p = Math.max(0, Math.min(10, Number(precision) || 0));
  return (v / u).toLocaleString('de-DE', { minimumFractionDigits: p, maximumFractionDigits: p }) + (UNIT_SUFFIX[u] ?? '');
}

/** Decimals an automatic axis needs so ticks of the given step stay distinct (step 2.5 → 1). */
export function autoPrecision(step: number): number {
  if (!(step > 0) || !Number.isFinite(step)) return 0;
  return Math.max(0, Math.min(6, -Math.floor(Math.log10(step) + 1e-9)));
}

/** Precision as set in the theme (custom or base); undefined = Power BI "Auto". */
export function precisionOf(r: { has: (card: string, prop: string) => boolean; num: (card: string, prop: string, fb: number) => number; hasProp: (card: string, prop: string) => boolean }, card: string, prop: string): number | undefined {
  return r.hasProp(card, prop) && r.has(card, prop) ? r.num(card, prop, 0) : undefined;
}

/** Resolve a `labelDisplayUnits` value (0 = auto) to a divisor for the given values. */
export function resolveUnit(units: number, values: number[]): number {
  const u = Number(units) || 0;
  return u === 0 ? autoUnit(values) : u;
}
