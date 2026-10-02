import { describe, expect, it } from 'vitest';
import { parseThemeJson, parseThemeText } from './themeJson';
import { extractThemeFromVisuals, importPbipFolder, parseLiteral, resolvePbirValue, type PbipFile } from './pbip';
import { buildExportTheme } from '../builder';
import { THEME_INITIAL } from '../defaults';
import { validateTheme } from '../validate';

describe('parseThemeJson', () => {
  it('round-trips an exported theme without issues', () => {
    const exported = buildExportTheme(THEME_INITIAL);
    const { theme, issues } = parseThemeJson(JSON.parse(JSON.stringify(exported)));
    expect(issues.filter((i) => i.severity !== 'info')).toEqual([]);
    expect(buildExportTheme(theme)).toEqual(exported);
  });

  it('migrates legacy designer aliases to Power BI names', () => {
    const legacy = {
      name: 'Legacy',
      textClasses: { title: { fontFace: 'Segoe UI', fontSize: '14', fontBold: true, fontColor: '#0F4C81' } },
      visualStyles: {
        '*': { '*': { subheader: [{ show: true }], shadow: [{ show: true }], border: [{ show: true, weight: 2 }] } },
        shape: { '*': { shapeOutline: [{ show: true }] } },
        slicer: { '*': { slicerHeader: [{ show: true }], slicerItems: [{ textSize: 11 }] } },
        decompositionTree: { '*': { tree: [{ accentColor: { solid: { color: '#000' } } }] } },
        __page__: { '*': { pageBackground: [{ color: { solid: { color: '#FFF' } } }], pageWallpaper: [{ color: { solid: { color: '#EEE' } } }], filterPane: [{ width: 200 }], pageSize: [{ type: '16:9 (HD 1280×720)', width: 1280, height: 720 }] } },
      },
    };
    const { theme } = parseThemeJson(legacy);
    expect(theme.textClasses?.title).toEqual({ fontFace: 'Segoe UI', fontSize: 14, fontWeight: 'bold', color: '#0F4C81' });
    const star = theme.visualStyles!['*']!['*']!;
    expect(star.subTitle).toEqual([{ show: true }]);
    expect(star.dropShadow).toEqual([{ show: true }]);
    expect(star.border).toEqual([{ show: true, width: 2 }]);
    expect(theme.visualStyles!.shape!['*']!.outline).toBeDefined();
    expect(theme.visualStyles!.slicer!['*']!.header).toBeDefined();
    expect(theme.visualStyles!.slicer!['*']!.items).toBeDefined();
    expect(theme.visualStyles!.decompositionTreeVisual).toBeDefined();
    expect(theme.visualStyles!.decompositionTree).toBeUndefined();
    const page = theme.visualStyles!.page!['*']!;
    expect(page.background).toBeDefined();
    expect(page.outspace).toBeDefined();
    expect(page.outspacePane).toEqual([{ width: 200 }]);
    expect(page.pageSize).toEqual([{ pageSizeTypes: 'Widescreen', pageSizeWidth: 1280, pageSizeHeight: 720 }]);
    expect(theme.visualStyles!.__page__).toBeUndefined();
  });

  it('keeps more than eight data colours and blocks prototype pollution', () => {
    const colors = Array.from({ length: 12 }, (_, i) => `#${String(i).padStart(2, '0')}0000`);
    const { theme } = parseThemeJson({ name: 'x', dataColors: colors, visualStyles: { __proto__: { polluted: true }, barChart: { '*': { legend: [{ __proto__: { x: 1 }, show: true }] } } } });
    expect(theme.dataColors).toHaveLength(12);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(Object.keys(theme.visualStyles!)).not.toContain('__proto__');
    expect(theme.visualStyles!.barChart!['*']!.legend![0]).toEqual({ show: true });
  });

  it('reports structural problems instead of throwing', () => {
    expect(parseThemeText('{').issues[0]?.severity).toBe('error');
    const { theme, issues } = parseThemeJson({ name: 42, dataColors: 'red', background: 'blue', visualStyles: { barChart: null } });
    expect(theme.name).toBe('Custom Theme');
    expect(issues.map((i) => i.path)).toEqual(expect.arrayContaining(['name', 'dataColors', 'background', 'visualStyles.barChart']));
  });
});

describe('PBIP import', () => {
  it('parses PBIR literals', () => {
    expect(parseLiteral("'#333333'")).toBe('#333333');
    expect(parseLiteral('12D')).toBe(12);
    expect(parseLiteral('1L')).toBe(1);
    expect(parseLiteral('true')).toBe(true);
    expect(parseLiteral('0.5D')).toBe(0.5);
  });

  it('unwraps PBIR colour expressions', () => {
    expect(resolvePbirValue({ solid: { color: { expr: { Literal: { Value: "'#AABBCC'" } } } } })).toEqual({ solid: { color: '#AABBCC' } });
    expect(resolvePbirValue({ expr: { Measure: { Expression: {}, Property: 'x' } } })).toBeUndefined();
  });

  const file = (path: string, json: unknown): PbipFile => ({ path, name: path.split('/').pop()!, text: async () => JSON.stringify(json) });

  it('extracts visual and container formatting from visual.json files', async () => {
    const visual = file('Report/definition/pages/p1/visuals/v1/visual.json', {
      visual: {
        visualType: 'barChart',
        objects: {
          legend: [{ properties: { show: { expr: { Literal: { Value: 'false' } } }, fontSize: { expr: { Literal: { Value: '12D' } } } } }],
          dataPoint: [
            { properties: { fill: { solid: { color: { expr: { Literal: { Value: "'#118DFF'" } } } } } } },
            { selector: { metadata: 'Sum(Sales)' }, properties: { fill: { solid: { color: { expr: { Literal: { Value: "'#FF0000'" } } } } } } },
          ],
        },
      },
      visualContainerObjects: {
        title: [{ properties: { fontColor: { solid: { color: { expr: { Literal: { Value: "'#0F4C81'" } } } } }, text: { expr: { Literal: { Value: "'Sales'" } } } } }],
      },
    });
    const { theme, issues } = await extractThemeFromVisuals([visual]);
    expect(issues.filter((i) => i.severity === 'error')).toEqual([]);
    const bar = theme.visualStyles!.barChart!['*']!;
    expect(bar.legend).toEqual([{ show: false, fontSize: 12 }]);
    expect(bar.dataPoint).toEqual([{ fill: { solid: { color: '#118DFF' } } }]);
    expect(bar.title?.[0]?.fontColor).toEqual({ solid: { color: '#0F4C81' } });
    expect(theme.dataColors).toContain('#118DFF');
    const result = await validateTheme(buildExportTheme(theme));
    expect(result.issues.filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('prefers the custom theme referenced by report.json and never the base theme', async () => {
    const files: PbipFile[] = [
      file('Report/definition/report.json', { themeCollection: { baseTheme: { name: 'CY24SU10' }, customTheme: { name: 'MyTheme' } } }),
      file('Report/StaticResources/SharedResources/BaseThemes/CY24SU10.json', { name: 'CY24SU10', dataColors: ['#000000'] }),
      file('Report/StaticResources/RegisteredResources/MyTheme.json', { name: 'My Theme', dataColors: ['#123456'] }),
    ];
    const result = await importPbipFolder(files);
    expect(result.source).toBe('customTheme');
    expect(result.theme.name).toBe('My Theme');
  });
});
