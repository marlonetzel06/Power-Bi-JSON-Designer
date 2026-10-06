/**
 * Microsoft's base report theme (CY26SU02), extracted from the shipped sample .pbix
 * (Report/StaticResources/SharedResources/BaseThemes). Power BI layers every custom
 * theme on top of this, so the designer resolves values the same way: custom visual →
 * base visual → custom "*" → base "*" → curated fallback.
 */
import base from '../../schema/baseTheme-CY26SU02.json';
import type { ReportTheme } from './types';

export const BASE_THEME = base as unknown as ReportTheme;
export const BASE_THEME_NAME = BASE_THEME.name;

/** Top-level colour of the base theme (e.g. `foregroundNeutralSecondary`). */
export function baseColor(key: string): string | undefined {
  const v = (BASE_THEME as Record<string, unknown>)[key];
  return typeof v === 'string' ? v : undefined;
}
