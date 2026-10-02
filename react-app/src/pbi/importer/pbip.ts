/**
 * Derive a theme from a Power BI Project (PBIP / PBIR) folder.
 *
 * Tier 1: the report's custom theme (report.json → themeCollection.customTheme →
 *         StaticResources/RegisteredResources/<name>.json). BaseThemes/ holds
 *         Microsoft's base theme and is NOT a custom theme.
 * Tier 2: extract formatting from every visual.json (objects + visualContainerObjects)
 *         and the most frequent fill colours as dataColors.
 */
import { HEX_COLOR_RE, type CardEntry, type ReportTheme, type VisualStyles } from '../types';
import { parseThemeJson, type ImportIssue, type ImportResult } from './themeJson';

export interface PbipFile {
  /** Path relative to the selected folder (webkitRelativePath). */
  path: string;
  name: string;
  text: () => Promise<string>;
}

const SKIP_CARDS = new Set(['stylePreset', 'general', 'filters']);
const SKIP_PROPS = new Set(['paragraphs', 'imageUrl', 'imageType', 'image', 'name']);
const DEFAULT_SELECTOR_IDS = new Set(['default']);

type Json = Record<string, unknown>;

function isObj(v: unknown): v is Json {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Convert a PBIR literal value ("'#333'", "12D", "1L", "true") to a JSON value. */
export function parseLiteral(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  let v = raw.trim();
  if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) return v.slice(1, -1);
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null') return null;
  const num = v.match(/^(-?\d+(?:\.\d+)?)[DdLl]?$/);
  if (num) return Number(num[1]);
  if (v.startsWith('datetime')) return v;
  v = v.replace(/^"|"$/g, '');
  return v;
}

/** Resolve a PBIR property value object to a theme property value (or undefined). */
export function resolvePbirValue(v: unknown): unknown {
  if (v === null || v === undefined) return undefined;
  if (typeof v !== 'object') return v;
  if (Array.isArray(v)) {
    const arr = v.map(resolvePbirValue).filter((x) => x !== undefined);
    return arr.length ? arr : undefined;
  }
  const o = v as Json;
  if ('expr' in o) {
    const expr = o.expr as Json;
    if (!isObj(expr)) return undefined;
    if ('Literal' in expr) return parseLiteral((expr.Literal as Json)?.Value);
    if ('ThemeDataColor' in expr) return { expr };
    return undefined; // measures, aggregations, resource references
  }
  if ('solid' in o) {
    const color = resolvePbirValue((o.solid as Json)?.color);
    if (typeof color === 'string') return { solid: { color } };
    if (isObj(color) && 'expr' in color) return { solid: { color } };
    return undefined;
  }
  const out: Json = {};
  for (const [k, x] of Object.entries(o)) {
    const r = resolvePbirValue(x);
    if (r !== undefined) out[k] = r;
  }
  return Object.keys(out).length ? out : undefined;
}

function normaliseFontFamily(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  for (const part of value.replace(/\\"/g, '"').split(',')) {
    const c = part.trim().replace(/^['"]|['"]$/g, '');
    if (c && !c.startsWith('wf_')) return c;
  }
  return value;
}

function entryFromProperties(properties: Json): CardEntry | undefined {
  const out: CardEntry = {};
  for (const [k, v] of Object.entries(properties)) {
    if (SKIP_PROPS.has(k) || k.startsWith('dynamic')) continue;
    let value = resolvePbirValue(v);
    if (value === undefined) continue;
    if (k === 'fontFamily' || k === 'titleFontFamily') value = normaliseFontFamily(value);
    out[k] = value as CardEntry[string];
  }
  return Object.keys(out).length ? out : undefined;
}

function collectColors(node: unknown, freq: Map<string, number>): void {
  if (!isObj(node)) {
    if (Array.isArray(node)) node.forEach((n) => collectColors(n, freq));
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === 'solid' && isObj(v)) {
      const c = resolvePbirValue(v.color);
      if (typeof c === 'string' && HEX_COLOR_RE.test(c)) freq.set(c.toUpperCase(), (freq.get(c.toUpperCase()) ?? 0) + 1);
    }
    collectColors(v, freq);
  }
}

function mergeObjects(target: VisualStyles, visualType: string, objects: unknown): void {
  if (!isObj(objects)) return;
  const cards = ((target[visualType] ??= { '*': {} })['*'] ??= {});
  for (const [card, items] of Object.entries(objects)) {
    if (SKIP_CARDS.has(card) || !Array.isArray(items)) continue;
    for (const item of items) {
      if (!isObj(item) || !isObj(item.properties)) continue;
      const selector = item.selector as Json | undefined;
      // Only selector-less (visual-wide) entries are theme defaults. Per-series / per-measure
      // overrides (metadata/data selectors) are skipped; state ids (hover/selected) are kept with $id.
      if (selector && (selector.metadata !== undefined || selector.data !== undefined)) continue;
      const id = typeof selector?.id === 'string' ? selector.id : undefined;
      const entry = entryFromProperties(item.properties);
      if (!entry) continue;
      if (id && !DEFAULT_SELECTOR_IDS.has(id)) entry.$id = id;
      const list = (cards[card] ??= []);
      const existing = list.find((e) => e.$id === entry.$id);
      if (existing) {
        for (const [k, v] of Object.entries(entry)) if (existing[k] === undefined) existing[k] = v;
      } else {
        list.push(entry);
      }
    }
  }
}

export async function extractThemeFromVisuals(visualFiles: PbipFile[]): Promise<ImportResult> {
  const issues: ImportIssue[] = [];
  const freq = new Map<string, number>();
  const visualStyles: VisualStyles = {};
  const containerStyles: VisualStyles = {};
  let count = 0;
  for (const file of visualFiles) {
    let vd: Json;
    try {
      vd = JSON.parse(await file.text()) as Json;
    } catch {
      issues.push({ path: file.path, message: 'invalid JSON, skipped', severity: 'warning' });
      continue;
    }
    const visual = vd.visual as Json | undefined;
    const vType = typeof visual?.visualType === 'string' ? visual.visualType : undefined;
    if (!vType) continue;
    count++;
    collectColors(visual?.objects, freq);
    mergeObjects(visualStyles, vType, visual?.objects);
    mergeObjects(containerStyles, vType, vd.visualContainerObjects);
  }
  // container objects (title/background/border...) become visual-level cards too
  for (const [vk, presets] of Object.entries(containerStyles)) {
    const target = ((visualStyles[vk] ??= { '*': {} })['*'] ??= {});
    for (const [card, entries] of Object.entries(presets['*'] ?? {})) target[card] ??= entries;
  }
  const dataColors = [...freq.entries()]
    .filter(([c]) => !['#FFFFFF', '#000000', '#FFF', '#000'].includes(c))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([c]) => c);
  if (count === 0) issues.push({ path: '', message: 'no visual.json files with a visualType found', severity: 'error' });
  if (dataColors.length === 0) issues.push({ path: 'dataColors', message: 'no fill colours found in visuals; keeping the current palette', severity: 'warning' });
  const result = parseThemeJson({ name: 'Imported from PBIP', ...(dataColors.length ? { dataColors } : {}), visualStyles });
  return { theme: result.theme, issues: [...issues, ...result.issues] };
}

/** Find the custom theme file referenced by report.json, or null. */
export async function findCustomThemeFile(files: PbipFile[]): Promise<PbipFile | null> {
  const reportJson = files.find((f) => f.name === 'report.json' && !f.path.includes('/visuals/'));
  if (reportJson) {
    try {
      const report = JSON.parse(await reportJson.text()) as Json;
      const custom = (report.themeCollection as Json | undefined)?.customTheme as Json | undefined;
      const name = typeof custom?.name === 'string' ? custom.name : undefined;
      if (name) {
        const match = files.find((f) => f.path.includes('RegisteredResources') && (f.name === name || f.name === `${name}.json`));
        if (match) return match;
      }
    } catch {
      /* fall through */
    }
  }
  // Fallback: any theme-looking JSON under RegisteredResources (never BaseThemes)
  const candidates = files.filter((f) => f.path.includes('RegisteredResources') && f.name.endsWith('.json'));
  for (const c of candidates) {
    try {
      const json = JSON.parse(await c.text()) as Json;
      if (typeof json.name === 'string' && (json.dataColors || json.visualStyles || json.textClasses)) return c;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/** Import a PBIP folder (list of files). */
export async function importPbipFolder(files: PbipFile[]): Promise<ImportResult & { source: 'customTheme' | 'visuals' | 'none' }> {
  const themeFile = await findCustomThemeFile(files);
  if (themeFile) {
    try {
      const result = parseThemeJson(JSON.parse(await themeFile.text()));
      return { ...result, source: 'customTheme' };
    } catch (e) {
      return { theme: { name: 'Custom Theme' }, issues: [{ path: themeFile.path, message: `Invalid theme JSON: ${(e as Error).message}`, severity: 'error' }], source: 'none' };
    }
  }
  const visualFiles = files.filter((f) => f.path.includes('/visuals/') && f.name === 'visual.json');
  if (visualFiles.length === 0) {
    return { theme: { name: 'Custom Theme' }, issues: [{ path: '', message: 'No custom theme and no visual.json files found in this folder', severity: 'error' }], source: 'none' };
  }
  const result = await extractThemeFromVisuals(visualFiles);
  return { ...result, source: 'visuals' };
}

export type { ReportTheme };
