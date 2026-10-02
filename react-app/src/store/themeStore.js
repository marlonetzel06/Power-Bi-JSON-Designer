/**
 * LEGACY SHIM — adapts the pre-reform components to the new typed store
 * (src/store/theme.ts). Deleted in Phase 4 together with those components.
 */
import { create } from 'zustand';
import { useThemeStore as useTheme } from './theme';
import { resolveProp, getCardEntry } from '../pbi/resolve';
import { computeModified } from '../pbi/modified';
import { parseThemeJson } from '../pbi/importer/themeJson';

const LEGACY_CARD = { subheader: 'subTitle', shapeOutline: 'outline', slicerHeader: 'header', slicerItems: 'items', shadow: 'dropShadow', pageBackground: 'background', pageWallpaper: 'outspace', filterPane: 'outspacePane' };
const vkOf = (vk) => (vk === '__page__' ? 'page' : vk);
const cardOf = (c) => LEGACY_CARD[c] ?? c;

const useLegacyStore = create((set, get) => ({
  theme: useTheme.getState().theme,
  themeInitial: useTheme.getState().baseline,
  pageSettings: {},
  currentVisual: null,
  jsonPanelOpen: false,
  helpPanelOpen: false,
  userSetThemeName: false,

  setThemeName: (name) => useTheme.getState().setName(name),
  setSemanticColor: (key, value) => useTheme.getState().setColor(key, value),
  setDataColor: (i, hex) => useTheme.getState().setDataColor(i, hex),
  setDataColors: (colors) => useTheme.getState().setDataColors(colors),
  addDataColor: (hex) => useTheme.getState().addDataColor(hex),
  removeDataColor: (i) => useTheme.getState().removeDataColor(i),
  setTextClass: (cls, prop, value) => {
    const map = { fontColor: 'color', fontBold: 'fontWeight', fontFace: 'fontFace', fontSize: 'fontSize' };
    const p = map[prop] ?? prop;
    useTheme.getState().setTextClass(cls, p, prop === 'fontBold' ? (value ? 'bold' : undefined) : value);
  },
  getCardData: (vk, card) => getCardEntry(useTheme.getState().theme, vkOf(vk), cardOf(card)) ?? {},
  setCardProp: (vk, card, key, value) => useTheme.getState().setCardProp(vkOf(vk), cardOf(card), key, value),
  setCurrentVisual: (key) => set({ currentVisual: key }),
  toggleJsonPanel: () => set((s) => ({ jsonPanelOpen: !s.jsonPanelOpen })),
  toggleHelpPanel: () => set((s) => ({ helpPanelOpen: !s.helpPanelOpen })),
  applyPreset: (preset) => {
    const { name, dataColors, _key, ...colors } = preset;
    useTheme.getState().applyPreset({ name, dataColors: dataColors ?? [], colors });
  },
  resetVisual: (vk) => useTheme.getState().resetVisual(vkOf(vk)),
  copyVisualSettings: (src, targets) => useTheme.getState().copyVisualSettings(vkOf(src), targets.map(vkOf)),
  loadThemeFromJSON: (json) => useTheme.getState().loadTheme(parseThemeJson(json).theme),
  isModified: (vk) => (computeModified(get().theme, get().themeInitial).cardCounts[vkOf(vk)] ?? 0) > 0,
  getModifiedCount: (vk) => computeModified(get().theme, get().themeInitial).cardCounts[vkOf(vk)] ?? 0,
  rcv: (vk, card, prop, fb) => {
    const v = resolveProp(get().theme, vkOf(vk), cardOf(card), prop, fb);
    return v === undefined ? fb : v;
  },
}));

useTheme.subscribe((s) => useLegacyStore.setState({ theme: s.theme, themeInitial: s.baseline, userSetThemeName: s.userNamed }));

export default useLegacyStore;
