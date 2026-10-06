/**
 * Renderer-side convenience over resolveProp: bound to one theme + visual key (+ state).
 */
import { BASE_THEME } from '@/pbi/baseTheme';
import { getProp, getVisualCard } from '@/pbi/catalog';
import { getValueSource, namedColor, resolveBool, resolveColor, resolveNumber, resolveProp, resolveString } from '@/pbi/resolve';
import { GLOBAL_KEY } from '@/pbi/types';
import type { ReportTheme, TextClass, TextClassName } from '@/pbi/types';
import { fontSpec, ptToPx } from './fonts';

export interface FontStyle {
  family: string;
  weight: number;
  sizePx: number;
  sizePt: number;
  color: string;
  italic: boolean;
  underline: boolean;
}

/** Which property names a card uses for the font parts (defaults: fontFamily, fontSize, bold, italic, underline). */
export interface FontProps {
  family?: string;
  /** `false`: the card has no size property (e.g. gauge callout value) → text class / fallback. */
  size?: string | false;
  bold?: string;
  italic?: string;
  underline?: string;
}

export interface FontOptions {
  /** Prefix for the standard names: `'goal'` → goalFontFamily, goalFontSize, goalBold … */
  prefix?: string;
  /** Explicit property names where the card deviates from the standard names. */
  props?: FontProps;
  /**
   * Text class that supplies family/size/colour/weight when the card does not set them
   * (Power BI: title → "title", axis/legend/labels → "label", card values → "callout", headers → "header").
   */
  textClass?: TextClassName;
}

export interface ResolverOptions {
  /** `$id` state to render (button "hover", filter card "Applied", …). */
  stateId?: string;
  /** Test hook: called for every (card, prop) a renderer reads. */
  onRead?: (card: string, prop: string) => void;
}

export interface Resolver {
  theme: ReportTheme;
  visualKey: string;
  stateId: string | undefined;
  color: (card: string, prop: string, fallback: string) => string;
  num: (card: string, prop: string, fallback: number) => number;
  bool: (card: string, prop: string, fallback: boolean) => boolean;
  str: (card: string, prop: string, fallback: string) => string;
  raw: (card: string, prop: string) => string | number | boolean | undefined;
  /** True when the theme (custom or base) sets the property; false when only the curated fallback applies. */
  has: (card: string, prop: string) => boolean;
  /** Does this visual have the card at all (curated catalog)? Renderers skip cards a visual does not own. */
  hasCard: (card: string) => boolean;
  /** Does this visual's card have the property (curated catalog)? */
  hasProp: (card: string, prop: string) => boolean;
  /** Font from the card's font properties, with text-class fallback. `options` may be a bare prefix string. */
  font: (card: string, colorProp: string, fallbackColor: string, fallbackPt?: number, options?: string | FontOptions) => FontStyle;
  /** Merged text class (custom theme over base theme). */
  textClass: (name: TextClassName) => TextClass;
  /** Same theme/visual bound to another state. */
  withState: (stateId: string | undefined) => Resolver;
  dataColor: (index: number) => string;
  dataColors: readonly string[];
  /** Structural colours with Power BI defaults. */
  structural: {
    foreground: string;
    background: string;
    first: string;
    second: string;
    third: string;
    fourth: string;
    secondaryBackground: string;
    tableAccent: string;
    good: string;
    neutral: string;
    bad: string;
  };
}

const BOLD_WEIGHTS = new Set(['bold', 'bolder', '600', '700', '800', '900']);

export function createResolver(theme: ReportTheme, visualKey: string, options: ResolverOptions = {}): Resolver {
  const { stateId, onRead } = options;
  const dataColors = theme.dataColors && theme.dataColors.length > 0 ? theme.dataColors : (BASE_THEME.dataColors ?? []);
  // Structural colours: custom theme → base theme (CY26SU02). `firstLevelElements` is the
  // modern alias of `foreground`; the base theme only defines the legacy names.
  const c = (keys: string[], fallback: string) => keys.map((k) => namedColor(theme, k)).find((v): v is string => typeof v === 'string') ?? fallback;
  const structural = {
    foreground: c(['foreground', 'firstLevelElements'], '#252423'),
    background: c(['background'], '#FFFFFF'),
    first: c(['firstLevelElements', 'foreground'], '#252423'),
    second: c(['secondLevelElements', 'foregroundNeutralSecondary'], '#605E5C'),
    third: c(['thirdLevelElements', 'backgroundLight'], '#F3F2F1'),
    fourth: c(['fourthLevelElements', 'foregroundNeutralTertiary'], '#B3B0AD'),
    secondaryBackground: c(['secondaryBackground', 'backgroundNeutral'], '#C8C6C4'),
    tableAccent: c(['tableAccent'], dataColors[0] ?? '#118DFF'),
    good: c(['good'], '#1AAB40'),
    neutral: c(['neutral'], '#D9B300'),
    bad: c(['bad'], '#D64554'),
  };
  const read = (card: string, prop: string) => onRead?.(card, prop);
  const textClass = (name: TextClassName): TextClass => ({ ...(BASE_THEME.textClasses?.[name] ?? {}), ...(theme.textClasses?.[name] ?? {}) });
  const r: Resolver = {
    theme,
    visualKey,
    stateId,
    dataColors,
    structural,
    color: (card, prop, fb) => (read(card, prop), resolveColor(theme, visualKey, card, prop, fb, stateId)),
    num: (card, prop, fb) => (read(card, prop), resolveNumber(theme, visualKey, card, prop, fb, stateId)),
    bool: (card, prop, fb) => (read(card, prop), resolveBool(theme, visualKey, card, prop, fb, stateId)),
    str: (card, prop, fb) => (read(card, prop), resolveString(theme, visualKey, card, prop, fb, stateId)),
    raw: (card, prop) => (read(card, prop), resolveProp(theme, visualKey, card, prop, undefined, stateId)),
    has: (card, prop) => (read(card, prop), getValueSource(theme, visualKey, card, prop, stateId) !== 'default'),
    hasCard: (card) => visualKey === GLOBAL_KEY || getVisualCard(visualKey, card) !== undefined,
    hasProp: (card, prop) => visualKey === GLOBAL_KEY || getProp(visualKey, card, prop) !== undefined,
    textClass,
    withState: (next) => (next === stateId ? r : createResolver(theme, visualKey, { ...options, stateId: next })),
    dataColor: (i) => dataColors[((i % dataColors.length) + dataColors.length) % dataColors.length] ?? '#118DFF',
    font: (card, colorProp, fallbackColor, fallbackPt = 9, opts = '') => {
      const o: FontOptions = typeof opts === 'string' ? { prefix: opts } : opts;
      const prefix = o.prefix ?? '';
      const p = (name: string) => (prefix ? prefix + name.charAt(0).toUpperCase() + name.slice(1) : name);
      const names = { family: o.props?.family ?? p('fontFamily'), size: o.props?.size ?? p('fontSize'), bold: o.props?.bold ?? p('bold'), italic: o.props?.italic ?? p('italic'), underline: o.props?.underline ?? p('underline') };
      const tc = o.textClass ? textClass(o.textClass) : undefined;
      const familyName = r.has(card, names.family) ? r.str(card, names.family, 'Segoe UI') : tc?.fontFace ?? 'Segoe UI';
      const spec = fontSpec(familyName);
      const sizePt = names.size !== false && r.has(card, names.size) ? r.num(card, names.size, fallbackPt) : typeof tc?.fontSize === 'number' ? tc.fontSize : fallbackPt;
      const bold = r.has(card, names.bold) ? r.bool(card, names.bold, false) : tc?.fontWeight !== undefined ? BOLD_WEIGHTS.has(String(tc.fontWeight)) : false;
      const color = r.has(card, colorProp) ? r.color(card, colorProp, fallbackColor) : tc?.color ?? fallbackColor;
      return {
        family: spec.family,
        weight: bold ? 700 : (spec.weight ?? 400),
        sizePt,
        sizePx: ptToPx(sizePt),
        color,
        italic: r.bool(card, names.italic, false),
        underline: r.bool(card, names.underline, false),
      };
    },
  };
  return r;
}

/** Spread a FontStyle onto SVG <text> props. */
export function textProps(f: FontStyle): Record<string, string | number> {
  return {
    fontFamily: f.family,
    fontSize: f.sizePx,
    fontWeight: f.weight,
    fill: f.color,
    fontStyle: f.italic ? 'italic' : 'normal',
    textDecoration: f.underline ? 'underline' : 'none',
  };
}

export function withAlpha(hex: string, transparencyPercent: number): string {
  const t = Math.max(0, Math.min(100, transparencyPercent));
  if (t === 0) return hex;
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const alpha = Math.round((1 - t / 100) * 255).toString(16).padStart(2, '0');
  return `#${full}${alpha}`;
}
