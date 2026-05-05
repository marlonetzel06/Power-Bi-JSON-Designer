import { create } from 'zustand';
import { THEME_INITIAL, SEMANTIC_KEYS } from '../constants/themeDefaults';
import { isSolidColor, getSolidColor } from '../utils/colorUtils';

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const useThemeStore = create((set, get) => ({
  theme: deepClone(THEME_INITIAL),
  themeInitial: deepClone(THEME_INITIAL),
  pageSettings: {},
  currentVisual: null,
  jsonPanelOpen: false,
  helpPanelOpen: false,
  previewPanelOpen: false,
  darkMode: localStorage.getItem('pbi-editor-dark') === '1',
  userSetThemeName: false,

  setThemeName: (name) => set((s) => ({
    theme: { ...s.theme, name },
    userSetThemeName: true,
  })),

  setSemanticColor: (key, value) => set((s) => ({
    theme: { ...s.theme, [key]: value },
  })),

  setDataColor: (index, value) => set((s) => {
    const dc = [...s.theme.dataColors];
    dc[index] = value;
    return { theme: { ...s.theme, dataColors: dc } };
  }),

  setDataColors: (colors) => set((s) => ({
    theme: { ...s.theme, dataColors: [...colors] },
  })),

  addDataColor: (hex) => set((s) => ({
    theme: { ...s.theme, dataColors: [...s.theme.dataColors, hex || '#888888'] },
  })),

  removeDataColor: (index) => set((s) => {
    const dc = [...s.theme.dataColors];
    if (dc.length <= 1) return {};
    dc.splice(index, 1);
    return { theme: { ...s.theme, dataColors: dc } };
  }),

  setTextClass: (cls, prop, value) => set((s) => {
    const tc = deepClone(s.theme.textClasses);
    if (!tc[cls]) tc[cls] = {};
    tc[cls][prop] = value;
    return { theme: { ...s.theme, textClasses: tc } };
  }),

  getCardData: (visualKey, cardName) => {
    const s = get();
    if (visualKey === '__page__') {
      if (!s.pageSettings[cardName]) {
        set({ pageSettings: { ...s.pageSettings, [cardName]: {} } });
      }
      return get().pageSettings[cardName];
    }
    const vs = s.theme.visualStyles;
    const card = vs[visualKey]?.['*']?.[cardName];
    if (card && card[0]) return card[0];
    return {};
  },

  setCardProp: (visualKey, cardName, key, value) => set((s) => {
    if (visualKey === '__page__') {
      const ps = deepClone(s.pageSettings);
      if (!ps[cardName]) ps[cardName] = {};
      ps[cardName][key] = value;
      return { pageSettings: ps };
    }
    const theme = deepClone(s.theme);
    if (!theme.visualStyles[visualKey]) theme.visualStyles[visualKey] = { '*': {} };
    if (!theme.visualStyles[visualKey]['*']) theme.visualStyles[visualKey]['*'] = {};
    if (!theme.visualStyles[visualKey]['*'][cardName]) theme.visualStyles[visualKey]['*'][cardName] = [{}];
    theme.visualStyles[visualKey]['*'][cardName][0][key] = value;
    return { theme };
  }),

  setCurrentVisual: (key) => set({ currentVisual: key }),
  toggleJsonPanel: () => set((s) => ({ jsonPanelOpen: !s.jsonPanelOpen })),
  toggleHelpPanel: () => set((s) => ({ helpPanelOpen: !s.helpPanelOpen })),
  togglePreviewPanel: () => set((s) => ({ previewPanelOpen: !s.previewPanelOpen })),

  toggleDarkMode: () => set((s) => {
    const next = !s.darkMode;
    localStorage.setItem('pbi-editor-dark', next ? '1' : '0');
    return { darkMode: next };
  }),

  applyPreset: (preset) => set((s) => {
    const theme = deepClone(s.theme);
    SEMANTIC_KEYS.forEach(k => { if (preset[k]) theme[k] = preset[k]; });
    if (Array.isArray(preset.dataColors)) theme.dataColors = [...preset.dataColors];
    if (!s.userSetThemeName && preset.name) theme.name = preset.name;
    return { theme };
  }),

  resetVisual: (visualKey) => set((s) => {
    const theme = deepClone(s.theme);
    const initial = s.themeInitial;
    if (initial.visualStyles[visualKey]) {
      theme.visualStyles[visualKey] = deepClone(initial.visualStyles[visualKey]);
    } else {
      delete theme.visualStyles[visualKey];
    }
    return { theme };
  }),

  copyVisualSettings: (sourceKey, targetKeys) => set((s) => {
    const theme = deepClone(s.theme);
    const source = theme.visualStyles[sourceKey];
    if (!source) return {};
    targetKeys.forEach(tk => {
      theme.visualStyles[tk] = deepClone(source);
    });
    return { theme };
  }),

  loadThemeFromJSON: (json) => set((s) => {
    const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);
    const theme = deepClone(s.theme);
    SEMANTIC_KEYS.forEach(k => { if (json[k] && typeof json[k] === 'string') theme[k] = json[k]; });
    if (Array.isArray(json.dataColors)) theme.dataColors = json.dataColors.slice(0, 8);
    if (json.name) theme.name = json.name;
    if (json.textClasses) theme.textClasses = json.textClasses;
    if (json.visualStyles && typeof json.visualStyles === 'object') {
      Object.entries(json.visualStyles).forEach(([vk, vv]) => {
        if (BLOCKED.has(vk)) return;
        if (!theme.visualStyles[vk]) theme.visualStyles[vk] = { '*': {} };
        if (vv['*']) {
          Object.entries(vv['*']).forEach(([card, arr]) => {
            if (BLOCKED.has(card)) return;
            if (Array.isArray(arr) && arr[0]) {
              if (!theme.visualStyles[vk]['*'][card]) theme.visualStyles[vk]['*'][card] = [{}];
              const safe = Object.fromEntries(Object.entries(arr[0]).filter(([k]) => !BLOCKED.has(k)));
              Object.assign(theme.visualStyles[vk]['*'][card][0], safe);
            }
          });
        }
      });
    }
    return { theme };
  }),

  isModified: (visualKey) => {
    const s = get();
    const current = s.theme.visualStyles[visualKey];
    const initial = s.themeInitial.visualStyles[visualKey];
    return JSON.stringify(current) !== JSON.stringify(initial);
  },

  getModifiedCount: (visualKey) => {
    const s = get();
    const star = s.theme.visualStyles[visualKey]?.['*'];
    const iStar = s.themeInitial.visualStyles[visualKey]?.['*'];
    if (!star) return 0;
    return Object.keys(star).filter(k => JSON.stringify(star[k]) !== JSON.stringify(iStar?.[k])).length;
  },

  // Resolve a card property value, falling back to global '*' then to a fallback
  rcv: (vk, card, prop, fb) => {
    const s = get();
    // Page settings are stored separately
    if (vk === '__page__') {
      const ps = s.pageSettings[card];
      if (ps && ps[prop] !== undefined && ps[prop] !== null) return ps[prop];
      return fb;
    }
    try {
      const v = resolveVal(s.theme.visualStyles[vk]['*'][card][0][prop]);
      if (v !== undefined && v !== null) return v;
    } catch {}
    try {
      const v = resolveVal(s.theme.visualStyles['*']['*'][card][0][prop]);
      if (v !== undefined && v !== null) return v;
    } catch {}
    return fb;
  },
}));

function resolveVal(v) {
  if (isSolidColor(v)) return getSolidColor(v);
  return v;
}

// Expose store for Playwright tests (dev only)
if (import.meta.env.DEV && typeof window !== 'undefined') window.__themeStore = useThemeStore;

export default useThemeStore;
