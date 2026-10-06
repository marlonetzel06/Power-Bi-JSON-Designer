import { describe, expect, it } from 'vitest';
import catalog from './generated/catalog.json';
import { COMMON_CARDS, PAGE_CARDS, VISUAL_CARDS, VISUAL_KEYS } from './curation/selection';
import { TOP_LEVEL_COLOR_KEYS, getAllCardKeys, getCardStates, getVisualCard, getVisualStates } from './catalog';
import { getDefault } from './curation/defaults';
import { HEX_COLOR_RE } from './types';

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

  it('has no empty curated card and offers the visual-own variants of common cards', () => {
    for (const key of [...VISUAL_KEYS, '*', 'page']) {
      for (const card of getAllCardKeys(key)) expect(getVisualCard(key, card)?.props.length, `${key}.${card}`).toBeGreaterThan(0);
    }
    expect(getVisualCard('pivotTable', 'grid')?.props.map((p) => p.key)).toContain('imageWidth');
    expect(getVisualCard('cardVisual', 'border')?.props.map((p) => p.key)).toEqual(['show', 'color', 'width', 'style', 'transparency']);
    expect(getVisualCard('advancedSlicerVisual', 'background')?.props.map((p) => p.key)).toContain('wrapContent');
    expect(getVisualCard('barChart', 'border')?.props.map((p) => p.key)).toContain('radius');
  });

  it('extracts $id states and mixed kinds', () => {
    expect(getCardStates('actionButton', 'fill')).toEqual(['default', 'hover', 'selected', 'disabled']);
    expect(getVisualStates('actionButton')).toEqual(['default', 'hover', 'selected', 'disabled']);
    expect(getVisualStates('advancedSlicerVisual')).toEqual(expect.arrayContaining(['default', 'interaction:hover', 'selection:selected', 'expansion:expanded']));
    expect(getCardStates('page', 'filterCard')).toEqual(['Available', 'Applied']);
    expect(getCardStates('pivotTable', 'subTotals')).toEqual(['Row', 'Column']);
    expect(getVisualStates('pivotTable')).toBeUndefined();
    expect(getVisualStates('barChart')).toBeUndefined();
    expect(getCardStates('cardVisual', 'label')).toBeUndefined(); // only "default" → no choice
    expect(getVisualCard('lineClusteredColumnComboChart', 'valueAxis')?.props.map((p) => p.key)).toContain('secShow');
    expect(getVisualCard('lineClusteredColumnComboChart', 'y2Axis')).toBeUndefined();
    expect(getVisualCard('areaChart', 'y2Axis')).toBeDefined();
  });

  it('has curated defaults that the schema accepts (enum options, booleans, numbers)', () => {
    const bad: string[] = [];
    for (const vk of [...VISUAL_KEYS, '*', 'page']) {
      for (const ck of getAllCardKeys(vk)) {
        for (const p of getVisualCard(vk, ck)!.props) {
          const d = getDefault(vk, ck, p.key, p);
          if (d === undefined) continue;
          const ok =
            p.type === 'enum' ? (p.options ?? []).some((o) => o.value === d)
            : p.type === 'boolean' ? typeof d === 'boolean'
            : p.type === 'number' || p.type === 'integer' ? typeof d === 'number'
            : p.type === 'color' ? typeof d === 'string' && (HEX_COLOR_RE.test(d) || /^@dataColor\d+$/.test(d) || TOP_LEVEL_COLOR_KEYS.includes(d) || d === '')
            : true;
          if (!ok) bad.push(`${vk}.${ck}.${p.key} = ${String(d)}`);
        }
      }
    }
    expect(bad).toEqual([]);
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
