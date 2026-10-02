import { describe, expect, it } from 'vitest';
import catalog from './generated/catalog.json';
import { COMMON_CARDS, PAGE_CARDS, VISUAL_CARDS, VISUAL_KEYS } from './curation/selection';

describe('generated catalog', () => {
  it('contains every curated visual with every curated card', () => {
    for (const key of VISUAL_KEYS) {
      const cards = catalog.visuals[key as keyof typeof catalog.visuals] as Record<string, string> | undefined;
      expect(cards, `visual ${key}`).toBeDefined();
      for (const card of VISUAL_CARDS[key] ?? []) {
        expect(cards?.[card], `${key}.${card}`).toBeDefined();
        expect(catalog.cardDefs[cards![card] as keyof typeof catalog.cardDefs]).toBeDefined();
      }
    }
    for (const card of COMMON_CARDS) expect(catalog.commonCards[card as keyof typeof catalog.commonCards]).toBeDefined();
    for (const card of PAGE_CARDS) expect(catalog.pageCards[card as keyof typeof catalog.pageCards]).toBeDefined();
  });

  it('knows the official text classes and colour keys', () => {
    expect(catalog.textClasses).toContain('callout');
    expect(catalog.textClasses).toHaveLength(14);
    expect(catalog.textClassProps).toEqual(['fontFace', 'fontSize', 'fontWeight', 'color']);
    expect(catalog.topLevelColors).toContain('firstLevelElements');
    expect(catalog.allVisualKeys).toContain('decompositionTreeVisual');
    expect(catalog.allVisualKeys).not.toContain('decompositionTree');
  });
});
