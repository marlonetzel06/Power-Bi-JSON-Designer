import { useMemo } from 'react';
import { useStore } from 'zustand';
import { useThemeStore } from './theme';
import { buildDeltaTheme, buildExportTheme, themeToJson } from '@/pbi/builder';
import { computeModified } from '@/pbi/modified';
import { resolveCard, type Resolved } from '@/pbi/resolve';

export const useTheme = () => useThemeStore((s) => s.theme);
export const useBaseline = () => useThemeStore((s) => s.baseline);
export const useThemeName = () => useThemeStore((s) => s.theme.name);
export const useDataColors = () => useThemeStore((s) => s.theme.dataColors ?? []);
export const useVisualStyle = (visualKey: string) => useThemeStore((s) => s.theme.visualStyles?.[visualKey]);
export const useGlobalStyle = () => useThemeStore((s) => s.theme.visualStyles?.['*']);

/** All curated properties of a card (for a `$id` state), resolved through the visual → `*` → default chain. */
export function useResolvedCard(visualKey: string, cardKey: string, stateId?: string): Record<string, Resolved> {
  // Depends on the whole theme: defaults follow the structural colours and data colours,
  // and the store shares structure, so an unrelated edit still means one cheap resolve.
  const theme = useTheme();
  return useMemo(() => resolveCard(theme, visualKey, cardKey, stateId), [theme, visualKey, cardKey, stateId]);
}

export function useModified() {
  const theme = useTheme();
  const baseline = useBaseline();
  return useMemo(() => computeModified(theme, baseline), [theme, baseline]);
}

export function useModifiedCount(visualKey: string): number {
  return useModified().cardCounts[visualKey] ?? 0;
}

export function useExportTheme() {
  const theme = useTheme();
  return useMemo(() => buildExportTheme(theme), [theme]);
}

export function useExportJson(): string {
  const exported = useExportTheme();
  return useMemo(() => themeToJson(exported), [exported]);
}

export function useDeltaJson(): string {
  const theme = useTheme();
  const baseline = useBaseline();
  return useMemo(() => themeToJson(buildDeltaTheme(theme, baseline)), [theme, baseline]);
}

export function useUndoRedo() {
  const temporal = useThemeStore.temporal;
  const canUndo = useStore(temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(temporal, (s) => s.futureStates.length > 0);
  return {
    canUndo,
    canRedo,
    undo: () => temporal.getState().undo(),
    redo: () => temporal.getState().redo(),
    clear: () => temporal.getState().clear(),
  };
}
