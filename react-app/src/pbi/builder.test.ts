import { describe, expect, it } from 'vitest';
import { buildDeltaTheme, buildExportTheme, themeFileName } from './builder';
import { SCHEMA_REF } from './catalog';
import { THEME_INITIAL } from './defaults';
import { PRESETS, applyPresetTo } from './presets';
import { validateTheme } from './validate';
import { solid, type CardEntry, type PropValue, type ReportTheme } from './types';
import { getAllCardKeys, getVisualCard, type CatalogProp } from './catalog';
import { VISUAL_KEYS } from './curation/selection';

describe('buildExportTheme', () => {
  it('produces a schema-valid theme for the initial theme', async () => {
    const result = await validateTheme(buildExportTheme(THEME_INITIAL));
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('produces schema-valid themes for every preset', async () => {
    for (const preset of PRESETS) {
      const theme = applyPresetTo(THEME_INITIAL, preset);
      const result = await validateTheme(buildExportTheme(theme));
      expect(result.issues.filter((i) => i.severity === 'error'), preset.name).toEqual([]);
    }
  });

  it('never emits the legacy __page__ key and keeps page settings under visualStyles.page', () => {
    const out = buildExportTheme(THEME_INITIAL);
    expect(out.visualStyles?.__page__).toBeUndefined();
    expect(out.visualStyles?.page?.['*']?.pageSize?.[0]?.pageSizeTypes).toBe('Widescreen');
  });

  it('drops empty cards, empty strings and undefined values', () => {
    const theme: ReportTheme = {
      name: 'x',
      visualStyles: { barChart: { '*': { legend: [{}], labels: [{ show: true, showBlankAs: '' }] } }, lineChart: { '*': {} } },
    };
    const out = buildExportTheme(theme);
    expect(out.visualStyles?.barChart?.['*']?.legend).toBeUndefined();
    expect(out.visualStyles?.barChart?.['*']?.labels?.[0]).toEqual({ show: true });
    expect(out.visualStyles?.lineChart).toBeUndefined();
  });

  it('round-trips the initial theme unchanged', () => {
    expect(buildExportTheme(buildExportTheme(THEME_INITIAL))).toEqual(buildExportTheme(THEME_INITIAL));
  });
});

describe('buildDeltaTheme', () => {
  it('contains only changed cards and colours', () => {
    const theme = structuredClone(THEME_INITIAL);
    theme.good = '#00FF00';
    theme.visualStyles!.barChart!['*']!.legend = [{ show: false }];
    const delta = buildDeltaTheme(theme, THEME_INITIAL);
    expect(delta).toEqual({ $schema: SCHEMA_REF, name: THEME_INITIAL.name, good: '#00FF00', visualStyles: { barChart: { '*': { legend: [{ show: false }] } } } });
  });
});

describe('$schema', () => {
  it('points every export at the official schema file the catalog was generated from', () => {
    expect(SCHEMA_REF).toBe('https://raw.githubusercontent.com/microsoft/powerbi-desktop-samples/main/Report-Theme-JSON-Schema/reportThemeSchema-2.144.json');
    expect(buildExportTheme(THEME_INITIAL).$schema).toBe(SCHEMA_REF);
    expect(buildExportTheme(THEME_INITIAL, { schemaRef: null }).$schema).toBeUndefined();
    expect(Object.keys(buildExportTheme(THEME_INITIAL))[0]).toBe('name');
  });
  it('keeps custom icons on export', () => {
    const theme: ReportTheme = { name: 'x', icons: { Flag: { url: 'https://example.com/flag.svg', description: 'Flag' } } };
    expect(buildExportTheme(theme).icons).toEqual(theme.icons);
  });
});

describe('themeFileName', () => {
  it('handles umlauts and special characters', () => {
    expect(themeFileName('Mein Design: Übersicht ß')).toBe('Mein_Design_Ubersicht_ss.json');
    expect(themeFileName('', '_delta')).toBe('theme_delta.json');
  });
});

describe('validateTheme', () => {
  it('reports invented cards and unknown visuals with readable messages', async () => {
    const bad: ReportTheme = {
      name: 'bad',
      visualStyles: {
        gauge: { '*': { gauge: [{ arcAngle: 150 }] } },
        decompositionTree: { '*': { header: [{ fontColor: solid('#fff') }] } },
        __page__: { '*': { pageBackground: [{ color: solid('#fff') }] } },
      },
      textClasses: { title: { fontFace: 'Segoe UI', fontSize: 12, color: '#000000', fontBold: true } as never },
    };
    const result = await validateTheme(bad);
    expect(result.valid).toBe(false);
    const codes = result.issues.map((i) => `${i.code}:${i.path}`);
    expect(codes).toContain('schema.unknownCard:visualStyles.gauge.*.gauge');
    expect(codes).toContain('schema.unknownVisual:visualStyles.decompositionTree');
    expect(codes).toContain('schema.unknownVisual:visualStyles.__page__');
    expect(codes).toContain('schema.unknownTextClassProp:textClasses.title.fontBold');
  });

  it('validates the report/filter/group scopes and visual-own variants of common cards', async () => {
    const t: ReportTheme = {
      name: 'scopes',
      visualStyles: {
        report: { '*': { outspacePane: [{ foo: 1 }], nope: [{ a: 1 }] } },
        group: { '*': { background: [{ color: solid('#fff') }] } },
        cardVisual: { '*': { border: [{ style: 'dashed', radius: 4 }] } },
      },
    };
    const codes = (await validateTheme(t)).issues.map((i) => `${i.code}:${i.path}`);
    expect(codes).toContain('schema.unknownCard:visualStyles.report.*.nope');
    expect(codes).toContain('schema.unknownProperty:visualStyles.report.*.outspacePane.0.foo');
    expect(codes).not.toContain('schema.unknownProperty:visualStyles.cardVisual.*.border.0.style');
    expect(codes).toContain('schema.unknownProperty:visualStyles.cardVisual.*.border.0.radius');
    expect(codes.filter((c) => c.includes('visualStyles.group'))).toEqual([]);
  });

  it('accepts a theme that sets every curated property of every visual (curation = schema)', async () => {
    const theme: ReportTheme = { name: 'all', visualStyles: {} };
    const sample = (p: CatalogProp): PropValue => {
      switch (p.type) {
        case 'boolean': return true;
        case 'color': return solid('#123456');
        case 'enum': return p.options?.[0]?.value ?? '';
        case 'integer':
        case 'number': return p.min ?? 1;
        case 'string': return 'x';
        case 'mixed': return p.kinds?.includes('number') ? 1 : 'x';
        default: return { name: 'img', url: 'https://example.com/a.png' };
      }
    };
    for (const vk of [...VISUAL_KEYS, '*', 'page']) {
      const cards: Record<string, CardEntry[]> = {};
      for (const ck of getAllCardKeys(vk)) {
        const card = getVisualCard(vk, ck)!;
        const entry: CardEntry = {};
        for (const p of card.props) if (p.type !== 'object') entry[p.key] = sample(p);
        const entries: CardEntry[] = [entry];
        for (const st of card.states ?? []) entries.push({ $id: st, ...entry });
        cards[ck] = entries;
      }
      theme.visualStyles![vk] = { '*': cards };
    }
    const result = await validateTheme(buildExportTheme(theme));
    const unknown = result.issues.filter((i) => i.code === 'schema.unknownCard' || i.code === 'schema.unknownProperty' || i.code === 'schema.unknownVisual');
    expect(unknown.map((i) => i.path)).toEqual([]);
  });

  it('warns on low contrast and empty data colours', async () => {
    const result = await validateTheme({ name: 't', foreground: '#CCCCCC', background: '#FFFFFF', dataColors: [] });
    expect(result.valid).toBe(true);
    expect(result.issues.map((i) => i.code)).toEqual(expect.arrayContaining(['semantic.lowContrast', 'semantic.noDataColors']));
  });
});
