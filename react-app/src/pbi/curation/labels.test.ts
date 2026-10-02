import { describe, expect, it } from 'vitest';
import { VISUAL_KEYS } from './selection';
import { CARD_LABELS_DE, VISUAL_LABELS_DE, VISUAL_LABELS_EN } from './labels.de';
import { getAllCardKeys } from '../catalog';

describe('labels', () => {
  it('cover every curated visual in both languages', () => {
    for (const k of [...VISUAL_KEYS, '*', 'page']) {
      expect(VISUAL_LABELS_DE[k], `de ${k}`).toBeTruthy();
      expect(VISUAL_LABELS_EN[k], `en ${k}`).toBeTruthy();
    }
  });
  it('have a German label for every curated card', () => {
    const missing = new Set<string>();
    for (const vk of [...VISUAL_KEYS, '*', 'page']) for (const c of getAllCardKeys(vk)) if (!CARD_LABELS_DE[c]) missing.add(c);
    expect([...missing]).toEqual([]);
  });
});
