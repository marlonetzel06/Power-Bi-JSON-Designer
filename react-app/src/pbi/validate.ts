/**
 * Theme validation: official JSON schema (ajv, loaded lazily) + semantic warnings.
 */
import type { ErrorObject } from 'ajv';
import { ALL_SCHEMA_VISUAL_KEYS, TEXT_CLASS_NAMES, TOP_LEVEL_COLOR_KEYS } from './catalog';
import { HEX_COLOR_RE, type ReportTheme } from './types';

export type IssueSeverity = 'error' | 'warning';

export interface ValidationIssue {
  path: string;
  message: string;
  severity: IssueSeverity;
  /** Machine-readable code for i18n: schema.* or semantic.* */
  code: string;
  params?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
}

type Validator = (data: unknown) => boolean;
let validatorPromise: Promise<{ validate: Validator; errors: () => ErrorObject[] }> | null = null;

async function getValidator() {
  if (!validatorPromise) {
    validatorPromise = (async () => {
      const [{ default: Ajv }, schema] = await Promise.all([import('ajv'), import('../../schema/reportThemeSchema-2.144.json')]);
      const ajv = new Ajv({ strict: false, allErrors: true, allowUnionTypes: true, validateSchema: false });
      const validate = ajv.compile(schema.default as object);
      return { validate: (data: unknown) => validate(data) as boolean, errors: () => validate.errors ?? [] };
    })();
  }
  return validatorPromise;
}

function pathFromPointer(pointer: string): string {
  return pointer
    .split('/')
    .filter(Boolean)
    .map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'))
    .join('.');
}

function translateSchemaError(err: ErrorObject): ValidationIssue {
  const path = pathFromPointer(err.instancePath);
  const segments = path.split('.');
  switch (err.keyword) {
    case 'additionalProperties': {
      const extra = String((err.params as { additionalProperty?: string }).additionalProperty ?? '');
      const fullPath = path ? `${path}.${extra}` : extra;
      if (segments[0] === 'visualStyles' && segments.length === 1) {
        return { path: fullPath, message: `"${extra}" is not a visual type`, severity: 'error', code: 'schema.unknownVisual', params: { key: extra } };
      }
      if (segments[0] === 'visualStyles' && segments.length === 3) {
        return { path: fullPath, message: `"${extra}" is not a format card of ${segments[1]}`, severity: 'error', code: 'schema.unknownCard', params: { visual: segments[1], card: extra } };
      }
      if (segments[0] === 'visualStyles' && segments.length === 5) {
        return { path: fullPath, message: `"${extra}" is not a property of ${segments[1]}.${segments[3]}`, severity: 'error', code: 'schema.unknownProperty', params: { visual: segments[1], card: segments[3], prop: extra } };
      }
      if (segments[0] === 'textClasses') {
        return { path: fullPath, message: `"${extra}" is not allowed in a text class (fontFace, fontSize, fontWeight, color)`, severity: 'error', code: 'schema.unknownTextClassProp', params: { prop: extra } };
      }
      return { path: fullPath, message: `unknown property "${extra}"`, severity: 'error', code: 'schema.unknownKey', params: { key: extra } };
    }
    case 'enum':
    case 'const':
    case 'oneOf':
    case 'anyOf':
      return { path, message: `invalid value at ${path}`, severity: 'error', code: 'schema.invalidValue', params: {} };
    case 'type':
      return { path, message: `expected ${String((err.params as { type?: string }).type)} at ${path}`, severity: 'error', code: 'schema.wrongType', params: { expected: (err.params as { type?: string }).type } };
    case 'pattern':
      return { path, message: `value at ${path} is not a valid colour`, severity: 'error', code: 'schema.pattern', params: {} };
    case 'minimum':
    case 'maximum':
      return { path, message: `value at ${path} is out of range (${err.message})`, severity: 'error', code: 'schema.range', params: err.params as Record<string, unknown> };
    case 'required':
      return { path, message: `missing ${String((err.params as { missingProperty?: string }).missingProperty)}`, severity: 'error', code: 'schema.required', params: err.params as Record<string, unknown> };
    default:
      return { path, message: `${path}: ${err.message ?? err.keyword}`, severity: 'error', code: `schema.${err.keyword}`, params: err.params as Record<string, unknown> };
  }
}

/** Deduplicate: oneOf/anyOf produce a cascade of errors for one bad value. */
function dedupe(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Map<string, ValidationIssue>();
  for (const i of issues) {
    const key = `${i.path}|${i.code}`;
    const prev = seen.get(key);
    if (!prev) seen.set(key, i);
  }
  // when a path has an "additionalProperties" error, drop the generic oneOf noise on the same path
  const byPath = new Map<string, ValidationIssue[]>();
  for (const i of seen.values()) byPath.set(i.path, [...(byPath.get(i.path) ?? []), i]);
  const out: ValidationIssue[] = [];
  for (const list of byPath.values()) {
    const specific = list.filter((i) => !['schema.invalidValue', 'schema.wrongType'].includes(i.code));
    out.push(...(specific.length ? specific : list.slice(0, 1)));
  }
  return out;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Checks beyond the schema: things that are valid JSON but a bad theme. */
export function semanticIssues(theme: ReportTheme): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!theme.name || !theme.name.trim()) issues.push({ path: 'name', message: 'theme name is empty', severity: 'error', code: 'semantic.emptyName' });
  if (theme.dataColors && theme.dataColors.length === 0) issues.push({ path: 'dataColors', message: 'dataColors is empty; Power BI will fall back to its defaults', severity: 'warning', code: 'semantic.noDataColors' });
  const fg = theme.foreground ?? theme.firstLevelElements;
  const bg = theme.background;
  if (fg && bg && HEX_COLOR_RE.test(fg) && HEX_COLOR_RE.test(bg)) {
    const ratio = contrastRatio(fg, bg);
    if (ratio < 4.5) issues.push({ path: 'foreground', message: `text/background contrast is ${ratio.toFixed(1)}:1 (minimum 4.5:1)`, severity: 'warning', code: 'semantic.lowContrast', params: { ratio: Number(ratio.toFixed(1)) } });
  }
  for (const [cls, def] of Object.entries(theme.textClasses ?? {})) {
    if (!TEXT_CLASS_NAMES.includes(cls)) issues.push({ path: `textClasses.${cls}`, message: `"${cls}" is not a text class`, severity: 'error', code: 'semantic.unknownTextClass', params: { cls } });
    if (def && def.color && !HEX_COLOR_RE.test(def.color)) issues.push({ path: `textClasses.${cls}.color`, message: 'not a hex colour', severity: 'error', code: 'schema.pattern' });
  }
  for (const vk of Object.keys(theme.visualStyles ?? {})) {
    if (vk === '*' || vk === 'page' || vk === 'report' || vk === 'filter' || vk === 'group') continue;
    if (!ALL_SCHEMA_VISUAL_KEYS.includes(vk)) issues.push({ path: `visualStyles.${vk}`, message: `"${vk}" is not a visual type Power BI knows`, severity: 'error', code: 'schema.unknownVisual', params: { key: vk } });
  }
  for (const k of Object.keys(theme)) {
    if (['name', '$schema', 'dataColors', 'textClasses', 'visualStyles', 'icons'].includes(k)) continue;
    if (!TOP_LEVEL_COLOR_KEYS.includes(k)) issues.push({ path: k, message: `"${k}" is not a theme colour key`, severity: 'error', code: 'schema.unknownKey', params: { key: k } });
  }
  return issues;
}

interface SchemaKeys {
  common: Record<string, number>;
  page: Record<string, number>;
  /** report / filter / group: card index of the non-visual scopes. */
  scopes: Record<string, Record<string, number>>;
  visuals: Record<string, Record<string, number>>;
  propSets: string[][];
}
let keysPromise: Promise<SchemaKeys> | null = null;
function getSchemaKeys(): Promise<SchemaKeys> {
  return (keysPromise ??= import('./generated/schemaKeys.json').then((m) => m.default as unknown as SchemaKeys));
}

/** Unknown cards / properties per visual — the schema itself cannot flag these (allOf composition). */
export function keyIssues(theme: ReportTheme, keys: SchemaKeys): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [vk, presets] of Object.entries(theme.visualStyles ?? {})) {
    const scope = keys.scopes[vk];
    const own = vk === 'page' ? keys.page : scope ?? (vk === '*' ? {} : keys.visuals[vk]);
    if (!own) continue; // unknown visual: reported elsewhere; custom visuals are allowed by Power BI
    const common = vk === 'page' || scope ? {} : keys.common;
    for (const [preset, cards] of Object.entries(presets ?? {})) {
      for (const [card, entries] of Object.entries(cards ?? {})) {
        if (card === '*') continue;
        const setId = own[card] ?? common[card];
        if (setId === undefined) {
          const allowed = [...Object.keys(own), ...Object.keys(common)].sort();
          issues.push({ path: `visualStyles.${vk}.${preset}.${card}`, message: `"${card}" is not a format card of ${vk} (allowed: ${allowed.slice(0, 8).join(', ')}${allowed.length > 8 ? ', …' : ''})`, severity: 'error', code: 'schema.unknownCard', params: { visual: vk, card, allowed } });
          continue;
        }
        const allowedProps = keys.propSets[setId] ?? [];
        entries?.forEach((entry, i) => {
          for (const prop of Object.keys(entry ?? {})) {
            if (prop === '$id' || allowedProps.includes(prop)) continue;
            issues.push({ path: `visualStyles.${vk}.${preset}.${card}.${i}.${prop}`, message: `"${prop}" is not a property of ${vk}.${card}`, severity: 'error', code: 'schema.unknownProperty', params: { visual: vk, card, prop } });
          }
        });
      }
    }
  }
  return issues;
}

export async function validateTheme(theme: ReportTheme): Promise<ValidationResult> {
  const [{ validate, errors }, keys] = await Promise.all([getValidator(), getSchemaKeys()]);
  const ok = validate(theme);
  const schemaIssues = ok ? [] : dedupe(errors().map(translateSchemaError));
  const semantic = [...semanticIssues(theme), ...keyIssues(theme, keys)];
  // avoid double-reporting unknown visuals/keys
  const seen = new Set(schemaIssues.map((i) => `${i.path}|${i.code}`));
  const issues = [...schemaIssues, ...semantic.filter((i) => !seen.has(`${i.path}|${i.code}`))];
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  return { valid: errorCount === 0, issues, errorCount, warningCount: issues.length - errorCount };
}
