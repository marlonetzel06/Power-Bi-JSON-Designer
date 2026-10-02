/**
 * Theme store: the Power BI theme being edited, its baseline (for "modified" /
 * reset), undo/redo (zundo) and persistence (localStorage).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { deepClone } from '@/pbi/builder';
import { THEME_INITIAL } from '@/pbi/defaults';
import { parseThemeJson } from '@/pbi/importer/themeJson';
import { applyPresetTo, presetFromTheme, type ThemePreset } from '@/pbi/presets';
import { TOP_LEVEL_COLOR_KEYS } from '@/pbi/catalog';
import { DEFAULT_PRESET, GLOBAL_KEY, PAGE_KEY, type CardEntry, type PropValue, type ReportTheme } from '@/pbi/types';

export interface ThemeState {
  theme: ReportTheme;
  /** Reference the "modified" markers and resets compare against (last loaded/imported theme). */
  baseline: ReportTheme;
  /** True once the user typed a theme name (presets then keep it). */
  userNamed: boolean;
  customPresets: ThemePreset[];

  setName: (name: string) => void;
  setColor: (key: string, hex: string | undefined) => void;
  setDataColors: (colors: string[]) => void;
  setDataColor: (index: number, hex: string) => void;
  addDataColor: (hex?: string) => void;
  removeDataColor: (index: number) => void;
  moveDataColor: (from: number, to: number) => void;
  setTextClass: (cls: string, prop: 'fontFace' | 'fontSize' | 'fontWeight' | 'color', value: string | number | undefined) => void;
  setCardProp: (visualKey: string, cardKey: string, propKey: string, value: PropValue | undefined) => void;
  resetCard: (visualKey: string, cardKey: string) => void;
  resetVisual: (visualKey: string) => void;
  resetTheme: () => void;
  copyVisualSettings: (sourceKey: string, targetKeys: string[]) => void;
  applyPreset: (preset: Pick<ThemePreset, 'colors' | 'dataColors' | 'textColor' | 'name'>) => void;
  /** Replace the theme (import). The imported theme becomes the new baseline. */
  loadTheme: (theme: ReportTheme, options?: { asBaseline?: boolean }) => void;
  saveCustomPreset: (name: string) => void;
  deleteCustomPreset: (id: string) => void;
}

function ensureCardEntry(theme: ReportTheme, visualKey: string, cardKey: string): CardEntry {
  const vs = (theme.visualStyles ??= {});
  const presets = (vs[visualKey] ??= {});
  const cards = (presets[DEFAULT_PRESET] ??= {});
  const entries = (cards[cardKey] ??= []);
  let entry = entries.find((e) => e.$id === undefined);
  if (!entry) {
    entry = {};
    entries.unshift(entry);
  }
  return entry;
}

function pruneEmpty(theme: ReportTheme, visualKey: string, cardKey?: string): void {
  const presets = theme.visualStyles?.[visualKey];
  if (!presets) return;
  const cards = presets[DEFAULT_PRESET];
  if (cards && cardKey) {
    const entries = cards[cardKey];
    if (entries) {
      const kept = entries.filter((e) => Object.keys(e).some((k) => k !== '$id'));
      if (kept.length === 0) delete cards[cardKey];
      else cards[cardKey] = kept;
    }
  }
  if (cards && Object.keys(cards).length === 0) delete presets[DEFAULT_PRESET];
  if (Object.keys(presets).length === 0 && visualKey !== GLOBAL_KEY) delete theme.visualStyles![visualKey];
}

const PERSIST_KEY = 'pbi-designer.theme';

export const useThemeStore = create<ThemeState>()(
  temporal(
    persist(
      immer((set) => ({
        theme: deepClone(THEME_INITIAL),
        baseline: deepClone(THEME_INITIAL),
        userNamed: false,
        customPresets: [],

        setName: (name) =>
          set((s) => {
            s.theme.name = name;
            s.userNamed = name.trim().length > 0;
          }),
        setColor: (key, hex) =>
          set((s) => {
            if (hex === undefined) delete (s.theme as Record<string, unknown>)[key];
            else (s.theme as Record<string, unknown>)[key] = hex;
          }),
        setDataColors: (colors) =>
          set((s) => {
            s.theme.dataColors = [...colors];
          }),
        setDataColor: (index, hex) =>
          set((s) => {
            s.theme.dataColors ??= [];
            if (index >= 0 && index < s.theme.dataColors.length) s.theme.dataColors[index] = hex;
          }),
        addDataColor: (hex = '#888888') =>
          set((s) => {
            (s.theme.dataColors ??= []).push(hex);
          }),
        removeDataColor: (index) =>
          set((s) => {
            if (!s.theme.dataColors || s.theme.dataColors.length <= 1) return;
            s.theme.dataColors.splice(index, 1);
          }),
        moveDataColor: (from, to) =>
          set((s) => {
            const dc = s.theme.dataColors;
            if (!dc || from === to || from < 0 || to < 0 || from >= dc.length || to >= dc.length) return;
            const [c] = dc.splice(from, 1);
            dc.splice(to, 0, c as string);
          }),
        setTextClass: (cls, prop, value) =>
          set((s) => {
            s.theme.textClasses ??= {};
            const tc = ((s.theme.textClasses as Record<string, Record<string, unknown>>)[cls] ??= {});
            if (value === undefined || value === '') delete tc[prop];
            else tc[prop] = value;
          }),
        setCardProp: (visualKey, cardKey, propKey, value) =>
          set((s) => {
            if (value === undefined) {
              const entry = s.theme.visualStyles?.[visualKey]?.[DEFAULT_PRESET]?.[cardKey]?.find((e) => e.$id === undefined);
              if (entry) delete entry[propKey];
              pruneEmpty(s.theme, visualKey, cardKey);
              return;
            }
            ensureCardEntry(s.theme, visualKey, cardKey)[propKey] = value;
          }),
        resetCard: (visualKey, cardKey) =>
          set((s) => {
            const base = s.baseline.visualStyles?.[visualKey]?.[DEFAULT_PRESET]?.[cardKey];
            const cards = s.theme.visualStyles?.[visualKey]?.[DEFAULT_PRESET];
            if (base) {
              ensureCardEntry(s.theme, visualKey, cardKey);
              s.theme.visualStyles![visualKey]![DEFAULT_PRESET]![cardKey] = deepClone(base);
            } else if (cards) {
              delete cards[cardKey];
              pruneEmpty(s.theme, visualKey);
            }
          }),
        resetVisual: (visualKey) =>
          set((s) => {
            const base = s.baseline.visualStyles?.[visualKey];
            s.theme.visualStyles ??= {};
            if (base) s.theme.visualStyles[visualKey] = deepClone(base);
            else delete s.theme.visualStyles[visualKey];
          }),
        resetTheme: () =>
          set((s) => {
            s.theme = deepClone(s.baseline);
          }),
        copyVisualSettings: (sourceKey, targetKeys) =>
          set((s) => {
            const source = s.theme.visualStyles?.[sourceKey];
            if (!source) return;
            for (const tk of targetKeys) {
              if (tk === sourceKey || tk === PAGE_KEY) continue;
              s.theme.visualStyles![tk] = deepClone(source);
            }
          }),
        applyPreset: (preset) =>
          set((s) => {
            const next = applyPresetTo(s.theme, preset);
            if (!s.userNamed && preset.name) next.name = preset.name;
            s.theme = next;
          }),
        loadTheme: (theme, options) =>
          set((s) => {
            const copy = deepClone(theme);
            s.theme = copy;
            if (options?.asBaseline !== false) s.baseline = deepClone(copy);
            s.userNamed = true;
          }),
        saveCustomPreset: (name) =>
          set((s) => {
            const id = `custom:${name.trim().toLowerCase().replace(/\s+/g, '-')}`;
            const preset = presetFromTheme(s.theme, id, name.trim(), TOP_LEVEL_COLOR_KEYS);
            s.customPresets = [...s.customPresets.filter((p) => p.id !== id), preset];
          }),
        deleteCustomPreset: (id) =>
          set((s) => {
            s.customPresets = s.customPresets.filter((p) => p.id !== id);
          }),
      })),
      {
        name: PERSIST_KEY,
        version: 1,
        partialize: (s) => ({ theme: s.theme, baseline: s.baseline, userNamed: s.userNamed, customPresets: s.customPresets }),
        merge: (persisted, current) => {
          const p = (persisted ?? {}) as Partial<ThemeState>;
          const theme = p.theme ? parseThemeJson(p.theme).theme : current.theme;
          const baseline = p.baseline ? parseThemeJson(p.baseline).theme : deepClone(THEME_INITIAL);
          return { ...current, theme, baseline, userNamed: p.userNamed ?? false, customPresets: Array.isArray(p.customPresets) ? p.customPresets : [] };
        },
      },
    ),
    {
      partialize: (s) => ({ theme: s.theme }) as ThemeState,
      limit: 100,
      equality: (a, b) => a.theme === b.theme,
      // Group rapid edits (typing a hex value, dragging a slider) into one undo step.
      handleSet: (handleSet) => {
        let last = 0;
        return (pastState) => {
          const now = Date.now();
          // Within a burst only the first pre-edit state is recorded, so undo reverts the whole burst.
          if (now - last < 400) return;
          last = now;
          handleSet(pastState);
        };
      },
    },
  ),
);

/** Migrate legacy localStorage keys from the pre-reform app (one-off). */
export function migrateLegacyStorage(): void {
  try {
    const raw = localStorage.getItem('pbi-custom-presets');
    if (!raw) return;
    const list = JSON.parse(raw) as Array<Record<string, unknown>>;
    if (Array.isArray(list)) {
      const presets: ThemePreset[] = list
        .filter((p) => typeof p.name === 'string')
        .map((p) => {
          const colors: Record<string, string> = {};
          for (const [k, v] of Object.entries(p)) if (typeof v === 'string' && /^#/.test(v)) colors[k] = v;
          return { id: `custom:${String(p.name).toLowerCase().replace(/\s+/g, '-')}`, name: String(p.name), colors, dataColors: Array.isArray(p.dataColors) ? (p.dataColors as string[]) : [] };
        });
      if (presets.length) useThemeStore.setState((s) => ({ customPresets: [...s.customPresets, ...presets.filter((p) => !s.customPresets.some((c) => c.id === p.id))] }));
    }
    localStorage.removeItem('pbi-custom-presets');
    localStorage.removeItem('pbi-editor-dark');
  } catch {
    /* ignore */
  }
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __themeStore: typeof useThemeStore }).__themeStore = useThemeStore;
}
