/**
 * Export helpers. Because the in-memory model already uses Power BI names, export
 * is a structural clean-up: drop empty cards/visuals and undefined values.
 */
import { SCHEMA_REF } from './catalog';
import type { CardEntry, CardSet, ReportTheme, VisualStyle, VisualStyles } from './types';

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function cleanEntry(entry: CardEntry): CardEntry | undefined {
  const out: CardEntry = {};
  for (const [k, v] of Object.entries(entry)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v === '' && k !== 'text' && k !== 'titleText') continue;
    out[k] = v;
  }
  return Object.keys(out).filter((k) => k !== '$id').length > 0 ? out : undefined;
}

function cleanCardSet(cards: CardSet): CardSet | undefined {
  const out: CardSet = {};
  for (const [card, entries] of Object.entries(cards)) {
    if (!Array.isArray(entries)) continue;
    const cleaned = entries.map(cleanEntry).filter((e): e is CardEntry => e !== undefined);
    if (cleaned.length > 0) out[card] = cleaned;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function cleanVisualStyles(styles: VisualStyles): VisualStyles | undefined {
  const out: VisualStyles = {};
  for (const [visual, presets] of Object.entries(styles)) {
    const cleanedPresets: VisualStyle = {};
    for (const [preset, cards] of Object.entries(presets ?? {})) {
      const cleaned = cleanCardSet(cards);
      if (cleaned) cleanedPresets[preset] = cleaned;
    }
    if (Object.keys(cleanedPresets).length > 0) out[visual] = cleanedPresets;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Full theme ready for Power BI (download / applyTheme). `$schema` points to the official
 * schema the catalog was generated from (editor support in VS Code, documented by Microsoft);
 * pass `schemaRef: null` to omit it.
 */
export function buildExportTheme(theme: ReportTheme, options: { schemaRef?: string | null } = {}): ReportTheme {
  const t = deepClone(theme);
  const out: ReportTheme = { name: t.name || 'Custom Theme' };
  const schemaRef = options.schemaRef === undefined ? SCHEMA_REF : options.schemaRef;
  if (schemaRef) out.$schema = schemaRef;
  for (const [k, v] of Object.entries(t)) {
    if (k === 'name' || k === '$schema' || k === 'visualStyles' || k === 'textClasses') continue;
    if (v === undefined || v === null) continue;
    (out as Record<string, unknown>)[k] = v;
  }
  if (t.textClasses) {
    const tc: Record<string, Record<string, unknown>> = {};
    for (const [cls, def] of Object.entries(t.textClasses)) {
      if (!def) continue;
      const entries = Object.entries(def).filter(([, v]) => v !== undefined && v !== null && v !== '');
      if (entries.length > 0) tc[cls] = Object.fromEntries(entries);
    }
    if (Object.keys(tc).length > 0) out.textClasses = tc;
  }
  if (t.visualStyles) {
    const vs = cleanVisualStyles(t.visualStyles);
    if (vs) out.visualStyles = vs;
  }
  return out;
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Only what differs from the baseline (a minimal theme that layers on top of it). */
export function buildDeltaTheme(theme: ReportTheme, baseline: ReportTheme, options: { schemaRef?: string | null } = {}): ReportTheme {
  const full = buildExportTheme(theme, options);
  const base = buildExportTheme(baseline, options);
  const delta: ReportTheme = { name: full.name };
  if (full.$schema) delta.$schema = full.$schema;
  for (const [k, v] of Object.entries(full)) {
    if (k === 'name' || k === '$schema' || k === 'visualStyles' || k === 'textClasses') continue;
    if (!sameJson(v, (base as Record<string, unknown>)[k])) (delta as Record<string, unknown>)[k] = v;
  }
  if (!sameJson(full.textClasses, base.textClasses) && full.textClasses) {
    const tc: Record<string, unknown> = {};
    for (const [cls, def] of Object.entries(full.textClasses)) {
      if (!sameJson(def, base.textClasses?.[cls as keyof typeof base.textClasses])) tc[cls] = def;
    }
    if (Object.keys(tc).length > 0) delta.textClasses = tc as ReportTheme['textClasses'];
  }
  if (full.visualStyles) {
    const vs: VisualStyles = {};
    for (const [visual, presets] of Object.entries(full.visualStyles)) {
      for (const [preset, cards] of Object.entries(presets)) {
        for (const [card, entries] of Object.entries(cards)) {
          if (!sameJson(entries, base.visualStyles?.[visual]?.[preset]?.[card])) {
            ((vs[visual] ??= {})[preset] ??= {})[card] = entries;
          }
        }
      }
    }
    if (Object.keys(vs).length > 0) delta.visualStyles = vs;
  }
  return delta;
}

export function themeToJson(theme: ReportTheme): string {
  return JSON.stringify(theme, null, 2);
}

/** Safe file name for a theme download. */
export function themeFileName(name: string, suffix = ''): string {
  const safe = (name || 'theme')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${safe || 'theme'}${suffix}.json`;
}
