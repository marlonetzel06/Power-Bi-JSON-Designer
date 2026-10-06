/**
 * Power BI report theme model. The in-memory representation IS the Power BI
 * theme JSON — no internal aliases, so export/import are structural copies.
 * Shape reference: schema/reportThemeSchema-*.json (official Microsoft schema).
 */

/** `{ "solid": { "color": "#RRGGBB" } }` — the fill object Power BI uses for colours. */
export interface SolidFill {
  solid: { color: string | ThemeDataColorRef };
}

/** Reference to a theme data colour, e.g. `{ expr: { ThemeDataColor: { ColorId: 2, Percent: 0.6 } } }`. */
export interface ThemeDataColorRef {
  expr: { ThemeDataColor: { ColorId: number; Percent?: number } };
}

export type Fill = SolidFill;

export type PropValue = string | number | boolean | Fill | Record<string, unknown> | unknown[];

/** One entry of a card array. `$id` targets a state/instance (e.g. filter card "Applied"). */
export type CardEntry = Record<string, PropValue> & { $id?: string };

/** `{ "<cardName>": [ { ...props } ] }` */
export type CardSet = Record<string, CardEntry[]>;

/** `{ "*": CardSet, "<presetName>": CardSet }` */
export type VisualStyle = Record<string, CardSet>;

/** `visualStyles` keyed by visual type (`*`, `barChart`, `page`, ...). */
export type VisualStyles = Record<string, VisualStyle>;

export interface TextClass {
  fontFace?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
}

export type TextClassName =
  | 'title' | 'label' | 'callout' | 'header'
  | 'largeTitle' | 'dataTitle' | 'boldLabel' | 'largeLabel' | 'largeLightLabel' | 'lightLabel'
  | 'semiboldLabel' | 'smallLabel' | 'smallLightLabel' | 'smallDataLabel';

export type TextClasses = Partial<Record<TextClassName, TextClass>>;

/** Top-level colour keys the schema defines (generated list lives in the catalog). */
export type ThemeColorKey =
  | 'foreground' | 'firstLevelElements' | 'secondLevelElements' | 'thirdLevelElements' | 'fourthLevelElements'
  | 'background' | 'secondaryBackground' | 'good' | 'neutral' | 'bad' | 'maximum' | 'center' | 'minimum' | 'null'
  | 'accent' | 'tableAccent' | 'foregroundLight' | 'foregroundDark' | 'foregroundNeutralLight' | 'foregroundNeutralDark'
  | 'foregroundNeutralSecondary' | 'foregroundNeutralSecondaryAlt' | 'foregroundNeutralSecondaryAlt2'
  | 'foregroundNeutralTertiary' | 'foregroundNeutralTertiaryAlt' | 'foregroundSelected' | 'foregroundButton'
  | 'backgroundLight' | 'backgroundNeutral' | 'backgroundDark' | 'hyperlink' | 'visitedHyperlink' | 'shapeStroke'
  | 'disabledText' | 'mapPushpin';

/** Custom icon registered by the theme (`icons`), referenced by name from conditional formatting. */
export interface ThemeIcon {
  url: string;
  description?: string;
}

export type ReportTheme = {
  $schema?: string;
  name: string;
  dataColors?: string[];
  textClasses?: TextClasses;
  visualStyles?: VisualStyles;
  icons?: Record<string, ThemeIcon> | ThemeIcon[];
} & Partial<Record<ThemeColorKey, string>>;

/** Identifier of the page pseudo-visual inside visualStyles. */
export const PAGE_KEY = 'page';
/** Identifier of the "all visuals" defaults inside visualStyles. */
export const GLOBAL_KEY = '*';
/** Default style preset name. */
export const DEFAULT_PRESET = '*';
/** `$id` of the default state; entries without `$id` mean the same. */
export const DEFAULT_STATE = 'default';

/** True for the default state (no `$id` or `$id: "default"`). */
export function isDefaultState(stateId: string | undefined): boolean {
  return stateId === undefined || stateId === DEFAULT_STATE;
}

/** The card entry for a state: default = entry without `$id`, else `$id: "default"`; other states by `$id`. */
export function findStateEntry(entries: readonly CardEntry[] | undefined, stateId?: string): CardEntry | undefined {
  if (!entries) return undefined;
  if (!isDefaultState(stateId)) return entries.find((e) => e.$id === stateId);
  return entries.find((e) => e.$id === undefined) ?? entries.find((e) => e.$id === DEFAULT_STATE);
}

export function isSolidFill(value: unknown): value is SolidFill {
  return typeof value === 'object' && value !== null && 'solid' in value && typeof (value as SolidFill).solid === 'object';
}

export function solid(color: string): SolidFill {
  return { solid: { color } };
}

/** Unwrap a fill to its hex string (theme data colour refs resolve against `dataColors`). */
export function fillToHex(value: unknown, dataColors?: readonly string[]): string | undefined {
  if (typeof value === 'string') return value;
  if (!isSolidFill(value)) return undefined;
  const c = value.solid.color;
  if (typeof c === 'string') return c;
  const ref = c?.expr?.ThemeDataColor;
  if (ref && dataColors) return dataColors[ref.ColorId % Math.max(1, dataColors.length)];
  return undefined;
}

export const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_RE.test(value);
}
