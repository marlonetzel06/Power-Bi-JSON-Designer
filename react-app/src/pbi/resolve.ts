/**
 * Resolve the effective value of a format property for a visual, following Power BI's
 * cascade: the custom theme is merged over the base theme, the visual's entries win over
 * `*`, and a state entry (`$id`) wins over the default entry of the same card:
 * custom visual → base visual → custom `*` → base `*` → curated default.
 * Colours are unwrapped to hex.
 */
import { BASE_THEME, baseColor } from './baseTheme';
import { TOP_LEVEL_COLOR_KEYS } from './catalog';
import { getProp, getVisualCard } from './catalog';
import { getDefault } from './curation/defaults';
import { DEFAULT_PRESET, DEFAULT_STATE, GLOBAL_KEY, HEX_COLOR_RE, PAGE_KEY, fillToHex, findStateEntry, isDefaultState, isSolidFill, type CardEntry, type PropValue, type ReportTheme } from './types';

export type Resolved = string | number | boolean | undefined;

const COLOR_KEYS = new Set<string>(TOP_LEVEL_COLOR_KEYS);

/** Page cards the base theme stores under `visualStyles["*"]["*"]` (the filter pane belongs to the report, not a visual). */
const PAGE_CARDS_FROM_GLOBAL = new Set(['filterCard', 'outspacePane']);

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

/**
 * The entry of a card for a state. Without `stateId` (or `"default"`): the entry without
 * `$id`, else the one with `$id: "default"`. Other states only match their own `$id`.
 */
export function getCardEntry(theme: ReportTheme, visualKey: string, cardKey: string, preset = DEFAULT_PRESET, stateId?: string): CardEntry | undefined {
  return findStateEntry(theme.visualStyles?.[visualKey]?.[preset]?.[cardKey], stateId);
}

/** Where a resolved value comes from (used by the UI to show inheritance). */
export type ValueSource = 'visual' | 'global' | 'base' | 'default';

/**
 * Default-state value of a card: the entry without `$id` first, then the `$id: "default"` entry.
 * The base theme splits its defaults across both (e.g. cardVisual.layout), so both count.
 */
function defaultValue(entries: readonly CardEntry[] | undefined, propKey: string): PropValue | undefined {
  if (!entries) return undefined;
  for (const e of entries) if (e.$id === undefined && e[propKey] !== undefined) return e[propKey];
  for (const e of entries) if (e.$id === DEFAULT_STATE && e[propKey] !== undefined) return e[propKey];
  return undefined;
}

function fromLevel(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, stateId: string | undefined): PropValue | undefined {
  const entries = theme.visualStyles?.[visualKey]?.[DEFAULT_PRESET]?.[cardKey];
  if (!entries) return undefined;
  if (!isDefaultState(stateId)) {
    const state = entries.find((e) => e.$id === stateId)?.[propKey];
    if (state !== undefined) return state;
  }
  return defaultValue(entries, propKey);
}

function findStored(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, stateId?: string): { value: PropValue; source: ValueSource } | undefined {
  const own = fromLevel(theme, visualKey, cardKey, propKey, stateId);
  if (own !== undefined) return { value: own, source: 'visual' };
  const baseOwn = fromLevel(BASE_THEME, visualKey, cardKey, propKey, stateId);
  if (baseOwn !== undefined) return { value: baseOwn, source: 'base' };
  const useGlobal = visualKey !== GLOBAL_KEY && (visualKey !== PAGE_KEY || PAGE_CARDS_FROM_GLOBAL.has(cardKey));
  if (useGlobal) {
    const global = fromLevel(theme, GLOBAL_KEY, cardKey, propKey, stateId);
    if (global !== undefined) return { value: global, source: 'global' };
    const baseGlobal = fromLevel(BASE_THEME, GLOBAL_KEY, cardKey, propKey, stateId);
    if (baseGlobal !== undefined) return { value: baseGlobal, source: 'base' };
  }
  return undefined;
}

/** Raw (not unwrapped) value as stored, following the cascade. */
export function getStoredValue(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, stateId?: string): PropValue | undefined {
  return findStored(theme, visualKey, cardKey, propKey, stateId)?.value;
}

export function getValueSource(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, stateId?: string): ValueSource {
  return findStored(theme, visualKey, cardKey, propKey, stateId)?.source ?? 'default';
}

export function resolveProp(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, fallback?: Resolved, stateId?: string): Resolved {
  const stored = unwrap(getStoredValue(theme, visualKey, cardKey, propKey, stateId), theme);
  if (stored !== undefined) return stored;
  if (fallback !== undefined) return fallback;
  return getDefault(visualKey, cardKey, propKey, getProp(visualKey, cardKey, propKey));
}

/** Resolve every curated property of a card into a flat object. */
export function resolveCard(theme: ReportTheme, visualKey: string, cardKey: string, stateId?: string): Record<string, Resolved> {
  const card = getVisualCard(visualKey, cardKey);
  const out: Record<string, Resolved> = {};
  if (!card) return out;
  for (const prop of card.props) out[prop.key] = resolveProp(theme, visualKey, cardKey, prop.key, undefined, stateId);
  return out;
}

/** Convenience accessors for renderers. */
export function resolveColor(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, fallback: string, stateId?: string): string {
  const v = resolveProp(theme, visualKey, cardKey, propKey, undefined, stateId);
  return typeof v === 'string' && v.length > 0 ? v : fallback;
}
export function resolveNumber(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, fallback: number, stateId?: string): number {
  const v = resolveProp(theme, visualKey, cardKey, propKey, undefined, stateId);
  return typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v !== '' && Number.isFinite(Number(v)) ? Number(v) : fallback;
}
export function resolveBool(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, fallback: boolean, stateId?: string): boolean {
  const v = resolveProp(theme, visualKey, cardKey, propKey, undefined, stateId);
  return typeof v === 'boolean' ? v : fallback;
}
export function resolveString(theme: ReportTheme, visualKey: string, cardKey: string, propKey: string, fallback: string, stateId?: string): string {
  const v = resolveProp(theme, visualKey, cardKey, propKey, undefined, stateId);
  return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : fallback;
}
