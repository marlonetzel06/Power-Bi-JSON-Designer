import { useCallback } from 'react';
import { useT } from '@/i18n';
import { copyText, downloadText, pickFiles } from '@/lib/download';
import { buildDeltaTheme, buildExportTheme, themeFileName, themeToJson } from '@/pbi/builder';
import { importPbipFolder, type PbipFile } from '@/pbi/importer/pbip';
import { parseThemeText } from '@/pbi/importer/themeJson';
import { validateTheme } from '@/pbi/validate';
import { useThemeStore } from '@/store/theme';
import { toast } from '@/ui';

const MAX_MB = 10;

export function useImportExport() {
  const t = useT();
  const loadTheme = useThemeStore((s) => s.loadTheme);

  const importJson = useCallback(async () => {
    const [file] = await pickFiles({ accept: '.json,application/json' });
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(t('import.tooLarge', { max: MAX_MB }));
      return;
    }
    try {
      const text = await file.text();
      const { theme, issues } = parseThemeText(text);
      const errors = issues.filter((i) => i.severity === 'error');
      if (errors.length) {
        toast.error(t('import.failed', { error: errors[0]!.message }));
        return;
      }
      loadTheme(theme, { asBaseline: true });
      toast.success(t('import.success', { name: theme.name }));
      if (issues.length) toast(t('import.issues', { count: issues.length }), { icon: 'ℹ️' });
    } catch (e) {
      toast.error(t('import.failed', { error: e instanceof Error ? e.message : String(e) }));
    }
  }, [t, loadTheme]);

  const importPbip = useCallback(async () => {
    const files = await pickFiles({ directory: true });
    if (files.length === 0) return;
    const pbipFiles: PbipFile[] = files
      .filter((f) => f.name.endsWith('.json'))
      .map((f) => ({ path: (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name, name: f.name, text: () => f.text() }));
    try {
      const result = await importPbipFolder(pbipFiles);
      const errors = result.issues.filter((i) => i.severity === 'error');
      if (result.source === 'none' || errors.length) {
        toast.error(t('import.failed', { error: errors[0]?.message ?? 'PBIP' }));
        return;
      }
      loadTheme(result.theme, { asBaseline: true });
      toast.success(result.source === 'customTheme' ? t('import.successPbipTheme') : t('import.successPbipVisuals', { count: Object.keys(result.theme.visualStyles ?? {}).filter((k) => k !== '*').length }));
    } catch (e) {
      toast.error(t('import.failed', { error: e instanceof Error ? e.message : String(e) }));
    }
  }, [t, loadTheme]);

  const exportTheme = useCallback(
    async (kind: 'full' | 'delta') => {
      const { theme, baseline } = useThemeStore.getState();
      const out = kind === 'full' ? buildExportTheme(theme) : buildDeltaTheme(theme, baseline);
      const file = themeFileName(theme.name, kind === 'delta' ? '-delta' : '');
      downloadText(file, themeToJson(out));
      toast.success(t('export.success', { file }));
      const v = await validateTheme(out);
      if (v.errorCount > 0) toast.error(t('export.withErrors', { count: v.errorCount }));
    },
    [t],
  );

  const copyJson = useCallback(async () => {
    const { theme } = useThemeStore.getState();
    if (await copyText(themeToJson(buildExportTheme(theme)))) toast.success(t('action.copied'));
  }, [t]);

  return { importJson, importPbip, exportFull: () => exportTheme('full'), exportDelta: () => exportTheme('delta'), copyJson };
}
