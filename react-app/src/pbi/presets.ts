/**
 * Colour presets. `foreground` / `firstLevelElements` are TEXT colours in Power BI,
 * `background` is the visual background; presets must respect that (AA contrast).
 */
import type { ReportTheme, TextClasses } from './types';

export interface ThemePreset {
  id: string;
  name: string;
  colors: Partial<Record<string, string>>;
  dataColors: string[];
  /** Optional text class colour overrides applied with the preset. */
  textColor?: string;
}

const text = (color: string): TextClasses => ({
  label: { color },
  title: { color },
  callout: { color },
  header: { color },
});

export const PRESETS: readonly ThemePreset[] = [
  {
    id: 'mm',
    name: 'M&M Software',
    colors: {
      foreground: '#041C2C', background: '#FFFFFF', firstLevelElements: '#041C2C', secondLevelElements: '#495057',
      thirdLevelElements: '#DEE2E6', fourthLevelElements: '#ADB5BD', secondaryBackground: '#F1F3F5', tableAccent: '#008E82',
      good: '#198754', neutral: '#FFC107', bad: '#DC3545', maximum: '#006BA9', center: '#F8F9FA', minimum: '#6BC2BB', null: '#CED4DA',
      hyperlink: '#006BA9', visitedHyperlink: '#004266', accent: '#00F2E5',
    },
    dataColors: ['#008E82', '#006BA9', '#29B4AA', '#2E8ACB', '#6BC2BB', '#6CB8E7', '#004440', '#004266'],
    textColor: '#041C2C',
  },
  {
    id: 'corporate',
    name: 'Corporate Blue',
    colors: {
      foreground: '#252423', background: '#FFFFFF', firstLevelElements: '#252423', secondLevelElements: '#374649',
      thirdLevelElements: '#C8D8EA', fourthLevelElements: '#CCCCCC', secondaryBackground: '#F0F5FB', tableAccent: '#1F8AC0',
      good: '#1DB954', neutral: '#F59E0B', bad: '#E74C3C', maximum: '#1F8AC0', center: '#FFFFFF', minimum: '#E74C3C', null: '#CCCCCC',
    },
    dataColors: ['#1F8AC0', '#374649', '#FFC300', '#E74C3C', '#2ECC71', '#9B59B6', '#F39C12', '#16A085'],
    textColor: '#0F4C81',
  },
  {
    id: 'slate',
    name: 'Slate Professional',
    colors: {
      foreground: '#0F172A', background: '#FFFFFF', firstLevelElements: '#0F172A', secondLevelElements: '#334155',
      thirdLevelElements: '#CBD5E1', fourthLevelElements: '#94A3B8', secondaryBackground: '#F1F5F9', tableAccent: '#2563EB',
      good: '#059669', neutral: '#D97706', bad: '#DC2626', maximum: '#2563EB', center: '#FFFFFF', minimum: '#DC2626', null: '#94A3B8',
    },
    dataColors: ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#EA580C'],
    textColor: '#0F172A',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    colors: {
      foreground: '#CDD6F4', background: '#1E1E2E', firstLevelElements: '#CDD6F4', secondLevelElements: '#BAC2DE',
      thirdLevelElements: '#45475A', fourthLevelElements: '#585B70', secondaryBackground: '#313244', tableAccent: '#CBA6F7',
      good: '#A6E3A1', neutral: '#F9E2AF', bad: '#F38BA8', maximum: '#89B4FA', center: '#313244', minimum: '#F38BA8', null: '#585B70',
    },
    dataColors: ['#89B4FA', '#CBA6F7', '#A6E3A1', '#F38BA8', '#FAB387', '#F9E2AF', '#94E2D5', '#89DCEB'],
    textColor: '#CDD6F4',
  },
  {
    id: 'midnight',
    name: 'Midnight Executive',
    colors: {
      foreground: '#E6EDF3', background: '#0D1117', firstLevelElements: '#E6EDF3', secondLevelElements: '#8B949E',
      thirdLevelElements: '#30363D', fourthLevelElements: '#484F58', secondaryBackground: '#161B22', tableAccent: '#E6B84A',
      good: '#3FB950', neutral: '#E6B84A', bad: '#F85149', maximum: '#388BFD', center: '#21262D', minimum: '#F85149', null: '#30363D',
    },
    dataColors: ['#388BFD', '#3FB950', '#E6B84A', '#F85149', '#BC8CFF', '#39C5CF', '#FF7B72', '#79C0FF'],
    textColor: '#E6EDF3',
  },
  {
    id: 'earth',
    name: 'Earth Tones',
    colors: {
      foreground: '#3D2B1F', background: '#FDF6EC', firstLevelElements: '#3D2B1F', secondLevelElements: '#6B4C35',
      thirdLevelElements: '#E8DCC8', fourthLevelElements: '#C8B89A', secondaryBackground: '#F5E8D5', tableAccent: '#8B5E3C',
      good: '#5A8A5A', neutral: '#C89A4A', bad: '#A04040', maximum: '#6B8E7B', center: '#FDF6EC', minimum: '#A04040', null: '#C8B89A',
    },
    dataColors: ['#8B5E3C', '#5A8A5A', '#C89A4A', '#A04040', '#6B8E7B', '#9B7B5A', '#7A9E7E', '#C4A87A'],
    textColor: '#3D2B1F',
  },
];

/** Apply a preset to a theme (pure). */
export function applyPresetTo(theme: ReportTheme, preset: Pick<ThemePreset, 'colors' | 'dataColors' | 'textColor'>): ReportTheme {
  const next: ReportTheme = { ...theme, ...preset.colors, dataColors: [...preset.dataColors] };
  if (preset.textColor) {
    const tc = text(preset.textColor);
    next.textClasses = {
      ...theme.textClasses,
      label: { ...theme.textClasses?.label, ...tc.label },
      title: { ...theme.textClasses?.title, ...tc.title },
      callout: { ...theme.textClasses?.callout, ...tc.callout },
      header: { ...theme.textClasses?.header, ...tc.header },
    };
  }
  return next;
}

/** Extract a preset from the current theme (for "save as preset"). */
export function presetFromTheme(theme: ReportTheme, id: string, name: string, colorKeys: readonly string[]): ThemePreset {
  const colors: Record<string, string> = {};
  for (const k of colorKeys) {
    const v = (theme as Record<string, unknown>)[k];
    if (typeof v === 'string') colors[k] = v;
  }
  return { id, name, colors, dataColors: [...(theme.dataColors ?? [])], textColor: theme.textClasses?.label?.color };
}
