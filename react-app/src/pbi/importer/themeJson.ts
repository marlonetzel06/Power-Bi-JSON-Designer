/**
 * Parse an arbitrary JSON value into a ReportTheme. Structural guards only
 * (type checks, prototype pollution, legacy alias migration); schema validation
 * is a separate step (validate.ts).
 */
import { GLOBAL_KEY, HEX_COLOR_RE, isSolidFill, type CardEntry, type CardSet, type ReportTheme, type TextClasses, type VisualStyles } from '../types';

export interface ImportIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ImportResult {
  theme: ReportTheme;
  issues: ImportIssue[];
}

const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);

/** Names earlier versions of this designer used internally; migrated transparently. */
const LEGACY_VISUAL_KEYS: Record<string, string> = {
  __page__: 'page',
  decompositionTree: 'decompositionTreeVisual',
  matrix: 'pivotTable',
};
const LEGACY_CARD_KEYS: Record<string, string> = {
  subheader: 'subTitle',
  shapeOutline: 'outline',
  slicerHeader: 'header',
  slicerItems: 'items',
  pageBackground: 'background',
  pageWallpaper: 'outspace',
  filterPane: 'outspacePane',
};
/** Card-specific prop renames (legacy → schema). */
const LEGACY_PROP_KEYS: Record<string, Record<string, string>> = {
  border: { weight: 'width' },
  pageSize: { width: 'pageSizeWidth', height: 'pageSizeHeight', type: 'pageSizeTypes' },
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function migrateEntry(cardKey: string, raw: Record<string, unknown>, path: string, issues: ImportIssue[]): CardEntry {
  const out: CardEntry = {};
  for (const [k0, v] of Object.entries(raw)) {
    if (BLOCKED.has(k0)) continue;
    let k = LEGACY_PROP_KEYS[cardKey]?.[k0] ?? k0;
    let value: unknown = v;
    if (cardKey === 'pageSize' && k === 'pageSizeTypes' && typeof value === 'string' && !['Widescreen', 'Standard', 'Letter', 'Tooltip', 'Custom'].includes(value)) {
      value = value.startsWith('16:9') ? 'Widescreen' : value.startsWith('4:3') ? 'Standard' : value.startsWith('Letter') ? 'Letter' : 'Custom';
    }
    if (k !== k0) issues.push({ path: `${path}.${k0}`, message: `renamed to "${k}"`, severity: 'info' });
    // legacy: labelDisplayUnits etc. stored as numeric strings
    if (typeof value === 'string' && /^-?\d+$/.test(value) && /(DisplayUnits|Precision|Size|Width|Height|Weight|Radius|Padding)$/.test(k)) {
      value = Number(value);
    }
    if (value === undefined || value === null) continue;
    if (isPlainObject(value) && !isSolidFill(value) && !('expr' in value)) {
      // strip prototype keys from nested objects
      value = JSON.parse(JSON.stringify(value, (key, val) => (BLOCKED.has(key) ? undefined : val)));
    }
    k = String(k);
    out[k] = value as CardEntry[string];
  }
  return out;
}

/** Visuals that really have a `shadow` card (buttons/shapes); elsewhere `shadow` was a legacy alias of `dropShadow`. */
const HAS_OWN_SHADOW = new Set(['actionButton', 'shape', 'bookmarkNavigator', 'pageNavigator']);

function legacyCardKey(visual: string, card: string): string {
  if (card === 'shadow' && !HAS_OWN_SHADOW.has(visual)) return 'dropShadow';
  return LEGACY_CARD_KEYS[card] ?? card;
}

function migrateCardSet(visual: string, raw: unknown, path: string, issues: ImportIssue[]): CardSet | undefined {
  if (!isPlainObject(raw)) {
    issues.push({ path, message: 'expected an object of format cards', severity: 'error' });
    return undefined;
  }
  const out: CardSet = {};
  for (const [card0, entries] of Object.entries(raw)) {
    if (BLOCKED.has(card0)) continue;
    const card = legacyCardKey(visual, card0);
    if (card !== card0) issues.push({ path: `${path}.${card0}`, message: `renamed to "${card}"`, severity: 'info' });
    const list = Array.isArray(entries) ? entries : isPlainObject(entries) ? [entries] : null;
    if (!list) {
      issues.push({ path: `${path}.${card0}`, message: 'expected an array of property objects', severity: 'error' });
      continue;
    }
    const migrated = list.filter(isPlainObject).map((e) => migrateEntry(card, e, `${path}.${card}`, issues));
    if (migrated.length > 0) out[card] = [...(out[card] ?? []), ...migrated];
  }
  return out;
}

function migrateVisualStyles(raw: unknown, issues: ImportIssue[]): VisualStyles | undefined {
  if (!isPlainObject(raw)) {
    issues.push({ path: 'visualStyles', message: 'expected an object', severity: 'error' });
    return undefined;
  }
  const out: VisualStyles = {};
  for (const [visual0, presets] of Object.entries(raw)) {
    if (BLOCKED.has(visual0)) continue;
    const visual = LEGACY_VISUAL_KEYS[visual0] ?? visual0;
    if (visual !== visual0) issues.push({ path: `visualStyles.${visual0}`, message: `renamed to "${visual}"`, severity: 'info' });
    if (!isPlainObject(presets)) {
      issues.push({ path: `visualStyles.${visual0}`, message: 'expected an object of style presets', severity: 'error' });
      continue;
    }
    for (const [preset, cards] of Object.entries(presets)) {
      if (BLOCKED.has(preset)) continue;
      const set = migrateCardSet(visual, cards, `visualStyles.${visual}.${preset}`, issues);
      if (!set) continue;
      const target = (out[visual] ??= {});
      target[preset] = { ...(target[preset] ?? {}), ...set };
    }
  }
  return out;
}

function migrateTextClasses(raw: unknown, issues: ImportIssue[]): TextClasses | undefined {
  if (!isPlainObject(raw)) {
    issues.push({ path: 'textClasses', message: 'expected an object', severity: 'error' });
    return undefined;
  }
  const out: Record<string, Record<string, unknown>> = {};
  for (const [cls, def] of Object.entries(raw)) {
    if (BLOCKED.has(cls) || !isPlainObject(def)) continue;
    const tc: Record<string, unknown> = {};
    for (const [k0, v] of Object.entries(def)) {
      if (BLOCKED.has(k0)) continue;
      let k = k0;
      let value: unknown = v;
      if (k0 === 'fontColor') k = 'color';
      if (k0 === 'fontFamily') k = 'fontFace';
      if (k0 === 'fontBold' || k0 === 'bold') {
        if (v === true) tc.fontWeight = 'bold';
        issues.push({ path: `textClasses.${cls}.${k0}`, message: 'converted to fontWeight', severity: 'info' });
        continue;
      }
      if (k === 'fontSize' && typeof value === 'string' && value !== '' && !Number.isNaN(Number(value))) value = Number(value);
      if (k !== k0) issues.push({ path: `textClasses.${cls}.${k0}`, message: `renamed to "${k}"`, severity: 'info' });
      if (value === undefined || value === null || value === '') continue;
      tc[k] = value;
    }
    if (Object.keys(tc).length > 0) out[cls] = tc;
  }
  return out as TextClasses;
}

/**
 * Parse an unknown JSON value into a ReportTheme. Never throws; problems are reported as issues.
 */
export function parseThemeJson(input: unknown): ImportResult {
  const issues: ImportIssue[] = [];
  if (!isPlainObject(input)) {
    return { theme: { name: 'Custom Theme' }, issues: [{ path: '', message: 'Theme must be a JSON object', severity: 'error' }] };
  }
  const theme: ReportTheme = { name: typeof input.name === 'string' && input.name.trim() ? input.name : 'Custom Theme' };
  if (typeof input.name !== 'string' || !input.name.trim()) issues.push({ path: 'name', message: 'missing theme name, using "Custom Theme"', severity: 'warning' });

  for (const [k, v] of Object.entries(input)) {
    if (BLOCKED.has(k) || k === 'name' || k === '$schema' || k === 'dataColors' || k === 'textClasses' || k === 'visualStyles' || k === 'icons') continue;
    if (typeof v === 'string') {
      if (HEX_COLOR_RE.test(v)) (theme as Record<string, unknown>)[k] = v;
      else issues.push({ path: k, message: `"${v}" is not a hex colour, ignored`, severity: 'warning' });
    } else if (v !== null && v !== undefined) {
      issues.push({ path: k, message: 'unexpected non-string value, ignored', severity: 'warning' });
    }
  }
  if (input.dataColors !== undefined) {
    if (Array.isArray(input.dataColors)) {
      const colors = input.dataColors.filter((c): c is string => typeof c === 'string' && HEX_COLOR_RE.test(c));
      if (colors.length !== input.dataColors.length) issues.push({ path: 'dataColors', message: 'non-hex entries were dropped', severity: 'warning' });
      theme.dataColors = colors;
    } else {
      issues.push({ path: 'dataColors', message: 'expected an array of hex colours', severity: 'error' });
    }
  }
  if (input.textClasses !== undefined) theme.textClasses = migrateTextClasses(input.textClasses, issues);
  if (input.visualStyles !== undefined) theme.visualStyles = migrateVisualStyles(input.visualStyles, issues);
  if (theme.visualStyles && !theme.visualStyles[GLOBAL_KEY]) {
    // keep a predictable structure for the editor
    theme.visualStyles[GLOBAL_KEY] = { '*': {} };
  }
  return { theme, issues };
}

/** Parse text, catching JSON syntax errors as issues. */
export function parseThemeText(text: string): ImportResult {
  try {
    return parseThemeJson(JSON.parse(text));
  } catch (e) {
    return { theme: { name: 'Custom Theme' }, issues: [{ path: '', message: `Invalid JSON: ${(e as Error).message}`, severity: 'error' }] };
  }
}
