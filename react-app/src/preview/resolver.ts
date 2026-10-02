/**
 * Renderer-side convenience over resolveProp: bound to one theme + visual key.
 */
import { resolveBool, resolveColor, resolveNumber, resolveProp, resolveString } from '@/pbi/resolve';
import type { ReportTheme } from '@/pbi/types';
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

export interface Resolver {
  theme: ReportTheme;
  visualKey: string;
  color: (card: string, prop: string, fallback: string) => string;
  num: (card: string, prop: string, fallback: number) => number;
  bool: (card: string, prop: string, fallback: boolean) => boolean;
  str: (card: string, prop: string, fallback: string) => string;
  raw: (card: string, prop: string) => string | number | boolean | undefined;
  /** Font from the standard prop names (fontFamily/fontSize/bold/italic/underline + colour prop). */
  font: (card: string, colorProp: string, fallbackColor: string, fallbackPt?: number, prefix?: string) => FontStyle;
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

const DEFAULT_DATA_COLORS = ['#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7', '#744EC2', '#D9B300', '#D64550'];

export function createResolver(theme: ReportTheme, visualKey: string): Resolver {
  const dataColors = theme.dataColors && theme.dataColors.length > 0 ? theme.dataColors : DEFAULT_DATA_COLORS;
  const structural = {
    foreground: theme.foreground ?? theme.firstLevelElements ?? '#252423',
    background: theme.background ?? '#FFFFFF',
    first: theme.firstLevelElements ?? theme.foreground ?? '#252423',
    second: theme.secondLevelElements ?? '#605E5C',
    third: theme.thirdLevelElements ?? '#F3F2F1',
    fourth: theme.fourthLevelElements ?? '#B3B0AD',
    secondaryBackground: theme.secondaryBackground ?? '#C8C6C4',
    tableAccent: theme.tableAccent ?? dataColors[0] ?? '#118DFF',
    good: theme.good ?? '#1AAB40',
    neutral: theme.neutral ?? '#D9B300',
    bad: theme.bad ?? '#D64554',
  };
  const r: Resolver = {
    theme,
    visualKey,
    dataColors,
    structural,
    color: (card, prop, fb) => resolveColor(theme, visualKey, card, prop, fb),
    num: (card, prop, fb) => resolveNumber(theme, visualKey, card, prop, fb),
    bool: (card, prop, fb) => resolveBool(theme, visualKey, card, prop, fb),
    str: (card, prop, fb) => resolveString(theme, visualKey, card, prop, fb),
    raw: (card, prop) => resolveProp(theme, visualKey, card, prop),
    dataColor: (i) => dataColors[((i % dataColors.length) + dataColors.length) % dataColors.length] ?? '#118DFF',
    font: (card, colorProp, fallbackColor, fallbackPt = 9, prefix = '') => {
      const p = (name: string) => (prefix ? prefix + name.charAt(0).toUpperCase() + name.slice(1) : name);
      const familyName = r.str(card, p('fontFamily'), 'Segoe UI');
      const spec = fontSpec(familyName);
      const sizePt = r.num(card, p('fontSize'), fallbackPt);
      const bold = r.bool(card, p('bold'), false);
      return {
        family: spec.family,
        weight: bold ? 700 : (spec.weight ?? 400),
        sizePt,
        sizePx: ptToPx(sizePt),
        color: r.color(card, colorProp, fallbackColor),
        italic: r.bool(card, p('italic'), false),
        underline: r.bool(card, p('underline'), false),
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
