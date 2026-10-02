/**
 * "Modified" bookkeeping: which visuals/cards differ from the baseline theme.
 * Computed once per theme reference (WeakMap cache), never per render.
 */
import type { ReportTheme } from './types';

export interface ModifiedInfo {
  /** visual key → number of cards that differ from the baseline */
  cardCounts: Record<string, number>;
  /** visual key → set of card keys that differ */
  cards: Record<string, Set<string>>;
  globalsChanged: boolean;
  textClassesChanged: boolean;
  dataColorsChanged: boolean;
}

const cache = new WeakMap<ReportTheme, Map<ReportTheme, ModifiedInfo>>();

function same(a: unknown, b: unknown): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

export function computeModified(theme: ReportTheme, baseline: ReportTheme): ModifiedInfo {
  let perBase = cache.get(theme);
  if (!perBase) cache.set(theme, (perBase = new Map()));
  const hit = perBase.get(baseline);
  if (hit) return hit;

  const cards: Record<string, Set<string>> = {};
  const cardCounts: Record<string, number> = {};
  const visuals = new Set([...Object.keys(theme.visualStyles ?? {}), ...Object.keys(baseline.visualStyles ?? {})]);
  for (const vk of visuals) {
    const a = theme.visualStyles?.[vk]?.['*'] ?? {};
    const b = baseline.visualStyles?.[vk]?.['*'] ?? {};
    if (a === b) continue;
    const set = new Set<string>();
    for (const card of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!same(a[card], b[card])) set.add(card);
    }
    if (set.size > 0) {
      cards[vk] = set;
      cardCounts[vk] = set.size;
    }
  }
  const colorKeys = new Set([...Object.keys(theme), ...Object.keys(baseline)].filter((k) => !['name', 'dataColors', 'textClasses', 'visualStyles', '$schema'].includes(k)));
  let globalsChanged = false;
  for (const k of colorKeys) {
    if (!same((theme as Record<string, unknown>)[k], (baseline as Record<string, unknown>)[k])) {
      globalsChanged = true;
      break;
    }
  }
  const info: ModifiedInfo = {
    cardCounts,
    cards,
    globalsChanged,
    textClassesChanged: !same(theme.textClasses, baseline.textClasses),
    dataColorsChanged: !same(theme.dataColors, baseline.dataColors),
  };
  perBase.set(baseline, info);
  return info;
}
