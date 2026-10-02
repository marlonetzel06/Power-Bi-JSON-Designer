import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorMode = 'light' | 'dark';
export type Locale = 'de' | 'en';
export type PreviewMode = 'mock' | 'live';
export type PaneId = 'visualizations' | 'theme' | 'json';

/** Selected object on the canvas: a visual type key, the page, or nothing. */
export type Selection = { kind: 'visual'; key: string } | { kind: 'page' } | { kind: 'none' };

export interface UiState {
  theme: ColorMode;
  locale: Locale;
  previewMode: PreviewMode;
  /** Right-hand panes that are open (PBI style: several can be open at once). */
  openPanes: PaneId[];
  paneWidth: number;
  jsonPaneWidth: number;
  selection: Selection;
  focusVisual: string | null;
  /** Expanded format cards, keyed by visual key. */
  expandedCards: Record<string, string[]>;
  formatTab: 'visual' | 'general';
  setTheme: (theme: ColorMode) => void;
  toggleTheme: () => void;
  setLocale: (locale: Locale) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  togglePane: (pane: PaneId) => void;
  setPaneOpen: (pane: PaneId, open: boolean) => void;
  setPaneWidth: (width: number) => void;
  setJsonPaneWidth: (width: number) => void;
  select: (selection: Selection) => void;
  setFocusVisual: (key: string | null) => void;
  setCardExpanded: (visualKey: string, card: string, expanded: boolean) => void;
  setAllCardsExpanded: (visualKey: string, cards: string[], expanded: boolean) => void;
  setFormatTab: (tab: 'visual' | 'general') => void;
}

function detectLocale(): Locale {
  try {
    const langs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
    return langs.some((l) => l.toLowerCase().startsWith('de')) ? 'de' : 'en';
  } catch {
    return 'de';
  }
}

function detectTheme(): ColorMode {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: detectTheme(),
      locale: detectLocale(),
      previewMode: 'mock',
      openPanes: ['visualizations'],
      paneWidth: 380,
      jsonPaneWidth: 440,
      selection: { kind: 'none' },
      focusVisual: null,
      expandedCards: {},
      formatTab: 'visual',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setLocale: (locale) => set({ locale }),
      setPreviewMode: (previewMode) => set({ previewMode }),
      togglePane: (pane) =>
        set((s) => ({ openPanes: s.openPanes.includes(pane) ? s.openPanes.filter((p) => p !== pane) : [...s.openPanes, pane] })),
      setPaneOpen: (pane, open) =>
        set((s) => ({ openPanes: open ? (s.openPanes.includes(pane) ? s.openPanes : [...s.openPanes, pane]) : s.openPanes.filter((p) => p !== pane) })),
      setPaneWidth: (paneWidth) => set({ paneWidth }),
      setJsonPaneWidth: (jsonPaneWidth) => set({ jsonPaneWidth }),
      select: (selection) => set({ selection }),
      setFocusVisual: (focusVisual) => set({ focusVisual }),
      setCardExpanded: (visualKey, card, expanded) =>
        set((s) => {
          const current = s.expandedCards[visualKey] ?? [];
          const next = expanded ? (current.includes(card) ? current : [...current, card]) : current.filter((c) => c !== card);
          return { expandedCards: { ...s.expandedCards, [visualKey]: next } };
        }),
      setAllCardsExpanded: (visualKey, cards, expanded) =>
        set((s) => ({ expandedCards: { ...s.expandedCards, [visualKey]: expanded ? [...cards] : [] } })),
      setFormatTab: (formatTab) => set({ formatTab }),
    }),
    {
      name: 'pbi-designer.ui',
      version: 1,
      partialize: (s) => ({
        theme: s.theme,
        locale: s.locale,
        previewMode: s.previewMode,
        openPanes: s.openPanes,
        paneWidth: s.paneWidth,
        jsonPaneWidth: s.jsonPaneWidth,
        expandedCards: s.expandedCards,
        formatTab: s.formatTab,
      }),
    },
  ),
);

/** Keep <html data-theme lang> in sync with the store. */
export function applyUiToDocument(theme: ColorMode, locale: Locale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('lang', locale);
}
