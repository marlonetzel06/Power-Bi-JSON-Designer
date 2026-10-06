import { TOP_LEVEL_COLOR_KEYS } from '@/pbi/catalog';
import { GLOBAL_KEY, type ReportTheme } from '@/pbi/types';

/**
 * Does a visual need to re-render for this theme change? The store uses immer, so
 * untouched slices keep their reference; comparing the slices a visual reads is enough.
 */
export function visualThemeEqual(a: ReportTheme, b: ReportTheme, visualKey: string): boolean {
  if (a === b) return true;
  if (a.visualStyles?.[visualKey] !== b.visualStyles?.[visualKey]) return false;
  if (a.visualStyles?.[GLOBAL_KEY] !== b.visualStyles?.[GLOBAL_KEY]) return false;
  if (a.dataColors !== b.dataColors || a.textClasses !== b.textClasses) return false;
  const ra = a as Record<string, unknown>;
  const rb = b as Record<string, unknown>;
  for (const k of TOP_LEVEL_COLOR_KEYS) if (ra[k] !== rb[k]) return false;
  return true;
}
