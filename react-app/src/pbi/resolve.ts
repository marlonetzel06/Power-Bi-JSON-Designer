/**
 * Resolve the effective value of a format property for a visual: visual style →
 * global `*` style → curated Power BI default. Colours are unwrapped to hex.
 */
import { getProp, getVisualCard } from './catalog';
import { getDefault } from './curation/defaults';
import { DEFAULT_PRESET, GLOBAL_KEY, PAGE_KEY, fillToHex, isSolidFill, type CardEntry, type PropValue, type ReportTheme } from './types';

export type Resolved = string | number | boolean | undefined;

function unwrap(value: PropValue | undefined, theme: ReportTheme): Resolved {
  if (value === undefined || value === null) return undefined;
  if (isSolidFill(value)) return fillToHex(value, theme.dataColors);
  if (typeof value === 'object') return undefined;
  return value;
}

/** First entry of a card (the default instance without `$id`), if present. */
export function getCardEntry(theme: ReportTheme, visualKey: string, cardKey: string, preset = DEFAULT_PRESET): CardEntry | undefined {
  const entries = theme.visualStyles?.[visualKey]?.[preset]?.[cardKey];
  if (!entries) return undefined;
  return entries.find((e) => e.$id === undefined) ?? entries[0];
}

/** Raw (not unwrapped) value as stored, following the visual → `*` chain. */
export function getStoredValue(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string): PropValue | undefined {
  const own = getCardEntry(theme, visualKey, cardKey)?.[propKey];
  if (own !== undefined) return own;
  if (visualKey !== GLOBAL_KEY && visualKey !== PAGE_KEY) {
    const global = getCardEntry(theme, GLOBAL_KEY, cardKey)?.[propKey];
    if (global !== undefined) return global;
  }
  return undefined;
}

/** Where a resolved value comes from (used by the UI to show inheritance). */
export type ValueSource = 'visual' | 'global' | 'default';

export function getValueSource(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string): ValueSource {
  if (getCardEntry(theme, visualKey, cardKey)?.[propKey] !== undefined) return 'visual';
  if (visualKey !== GLOBAL_KEY && visualKey !== PAGE_KEY && getCardEntry(theme, GLOBAL_KEY, cardKey)?.[propKey] !== undefined) return 'global';
  return 'default';
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
