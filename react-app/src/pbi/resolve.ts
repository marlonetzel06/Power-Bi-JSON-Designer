/**
 * Resolve the effective value of a format property for a visual: visual style →
 * global `*` style → curated Power BI default. Colours are unwrapped to hex.
 */
import { BASE_THEME, baseColor } from './baseTheme';
import { TOP_LEVEL_COLOR_KEYS } from './catalog';
import { getProp, getVisualCard } from './catalog';
import { getDefault } from './curation/defaults';
import { DEFAULT_PRESET, GLOBAL_KEY, HEX_COLOR_RE, PAGE_KEY, fillToHex, isSolidFill, type CardEntry, type PropValue, type ReportTheme } from './types';

export type Resolved = string | number | boolean | undefined;

const COLOR_KEYS = new Set<string>(TOP_LEVEL_COLOR_KEYS);

/** Resolve a named structural colour (`"backgroundLight"`) against the theme, then the base theme. */
export function namedColor(theme: ReportTheme, name: string): string | undefined {
  if (!COLOR_KEYS.has(name)) return undefined;
  const own = (theme as Record<string, unknown>)[name];
  return typeof own === 'string' ? own : baseColor(name);
}

function unwrap(value: PropValue | undefined, theme: ReportTheme): Resolved {
  if (value === undefined || value === null) return undefined;
  if (isSolidFill(value)) {
    const hex = fillToHex(value, theme.dataColors);
    if (hex && !HEX_COLOR_RE.test(hex)) return namedColor(theme, hex) ?? hex;
    return hex;
  }
  if (typeof value === 'object') return undefined;
  return value;
}

/** First entry of a card (the default instance without `$id`), if present. */
export function getCardEntry(theme: ReportTheme, visualKey: string, cardKey: string, preset = DEFAULT_PRESET): CardEntry | undefined {
  const entries = theme.visualStyles?.[visualKey]?.[preset]?.[cardKey];
  if (!entries) return undefined;
  return entries.find((e) => e.$id === undefined) ?? entries[0];
}

/**
 * Raw (not unwrapped) value as stored, following Power BI's cascade: the custom theme is
 * merged over the base theme, then the visual's own entries win over `*`:
 * custom visual → base visual → custom `*` → base `*`.
 */
export function getStoredValue(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string): PropValue | undefined {
  return findStored(theme, visualKey, cardKey, propKey)?.value;
}

/** Where a resolved value comes from (used by the UI to show inheritance). */
export type ValueSource = 'visual' | 'global' | 'base' | 'default';

function findStored(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string): { value: PropValue; source: ValueSource } | undefined {
  const own = getCardEntry(theme, visualKey, cardKey)?.[propKey];
  if (own !== undefined) return { value: own, source: 'visual' };
  const baseOwn = getCardEntry(BASE_THEME, visualKey, cardKey)?.[propKey];
  if (baseOwn !== undefined) return { value: baseOwn, source: 'base' };
  if (visualKey !== GLOBAL_KEY && visualKey !== PAGE_KEY) {
    const global = getCardEntry(theme, GLOBAL_KEY, cardKey)?.[propKey];
    if (global !== undefined) return { value: global, source: 'global' };
    const baseGlobal = getCardEntry(BASE_THEME, GLOBAL_KEY, cardKey)?.[propKey];
    if (baseGlobal !== undefined) return { value: baseGlobal, source: 'base' };
  }
  return undefined;
}

export function getValueSource(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string): ValueSource {
  return findStored(theme, visualKey, cardKey, propKey)?.source ?? 'default';
}

export function resolveProp(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, fallback?: Resolved): Resolved {
  const stored = unwrap(getStoredValue(theme, visualKey, cardKey, propKey), theme);
  if (stored !== undefined) return stored;
  if (fallback !== undefined) return fallback;
  return getDefault(visualKey, cardKey, propKey, getProp(visualKey, cardKey, propKey));
}

/** Resolve every curated property of a card into a flat object. */
export function resolveCard(theme: ReportTheme, visualKey: string, cardKey: string): Record<string, Resolved> {
  const card = getVisualCard(visualKey, cardKey);
  const out: Record<string, Resolved> = {};
  if (!card) return out;
  for (const prop of card.props) out[prop.key] = resolveProp(theme, visualKey, cardKey, prop.key);
  return out;
}

/** Convenience accessors for renderers. */
export function resolveColor(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, fallback: string): string {
  const v = resolveProp(theme, visualKey, cardKey, propKey);
  return typeof v === 'string' && v.length > 0 ? v : fallback;
}
export function resolveNumber(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, fallback: number): number {
  const v = resolveProp(theme, visualKey, cardKey, propKey);
  return typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v !== '' && Number.isFinite(Number(v)) ? Number(v) : fallback;
}
export function resolveBool(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, fallback: boolean): boolean {
  const v = resolveProp(theme, visualKey, cardKey, propKey);
  return typeof v === 'boolean' ? v : fallback;
}
export function resolveString(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, fallback: string): string {
  const v = resolveProp(theme, visualKey, cardKey, propKey);
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : fallback;
}
