import { describe, expect, it } from 'vitest';
import { buildDeltaTheme, buildExportTheme, themeFileName } from './builder';
import { THEME_INITIAL } from './defaults';
import { PRESETS, applyPresetTo } from './presets';
import { validateTheme } from './validate';
import { solid, type ReportTheme } from './types';

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
    expect(delta).toEqual({ name: THEME_INITIAL.name, good: '#00FF00', visualStyles: { barChart: { '*': { legend: [{ show: false }] } } } });
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

  it('warns on low contrast and empty data colours', async () => {
    const result = await validateTheme({ name: 't', foreground: '#CCCCCC', background: '#FFFFFF', dataColors: [] });
    expect(result.valid).toBe(true);
    expect(result.issues.map((i) => i.code)).toEqual(expect.arrayContaining(['semantic.lowContrast', 'semantic.noDataColors']));
  });
});
