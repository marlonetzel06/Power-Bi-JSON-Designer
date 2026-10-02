import { CircleAlert, CircleCheck, Copy, Download, TriangleAlert } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { useT } from '@/i18n';
import { issueText } from './issueText';
import { themeFileName } from '@/pbi/builder';
import type { ValidationIssue } from '@/pbi/validate';
import { useDeltaJson, useExportJson, useExportTheme, useThemeName } from '@/store/selectors';
import { useUiStore } from '@/store/uiStore';
import { Badge, FormatCard, IconButton, SegmentedControl, cn, toast } from '@/ui';
import { copyText, downloadText } from '@/lib/download';
import { pageOfVisual } from '../canvas/pages';
import { highlightJson } from './highlight';
import { useValidation } from './useValidation';

type View = 'full' | 'delta';

export function JsonPane() {
  const t = useT();
  const [view, setView] = useState<View>('full');
  const [issuesOpen, setIssuesOpen] = useState(true);
  const name = useThemeName();
  const exportTheme = useExportTheme();
  const full = useExportJson();
  const delta = useDeltaJson();
  const { result, pending } = useValidation(exportTheme);
  const select = useUiStore((s) => s.select);
  const setActivePage = useUiStore((s) => s.setActivePage);
  const setFocusVisual = useUiStore((s) => s.setFocusVisual);
  const json = view === 'full' ? full : delta;
  const highlighted = useMemo(() => highlightJson(json), [json]);

  let status: ReactNode;
  if (!result || pending) status = <Badge tone="neutral">{t('json.validating')}</Badge>;
  else if (result.errorCount > 0) status = <Badge tone="danger" data-testid="validation-badge"><CircleAlert size={11} className="mr-1" aria-hidden />{t('json.errors', { count: result.errorCount })}</Badge>;
  else if (result.warningCount > 0) status = <Badge tone="warning" data-testid="validation-badge"><TriangleAlert size={11} className="mr-1" aria-hidden />{t('json.warnings', { count: result.warningCount })}</Badge>;
  else status = <Badge tone="success" data-testid="validation-badge"><CircleCheck size={11} className="mr-1" aria-hidden />{t('json.valid')}</Badge>;

  const goTo = (issue: ValidationIssue) => {
    const seg = issue.path.split('.');
    if (seg[0] !== 'visualStyles' || !seg[1]) return;
    const vk = seg[1];
    if (vk === 'page') select({ kind: 'page' });
    else select({ kind: 'visual', key: vk });
    const page = pageOfVisual(vk);
    if (page) setActivePage(page.id);
    setFocusVisual(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="json-pane">
      <div className="flex items-center gap-2 px-3 py-2">
        <SegmentedControl<View> aria-label={t('pane.json')} size="sm" value={view} onValueChange={setView} options={[{ value: 'full', label: t('json.full') }, { value: 'delta', label: t('json.delta') }]} />
        <div className="ml-auto flex items-center gap-1">
          {status}
          <IconButton label={t('json.copyFull')} size="sm" onClick={() => void copyText(json).then((ok) => ok && toast.success(t('action.copied')))}><Copy size={15} /></IconButton>
          <IconButton
            label={view === 'full' ? t('json.downloadFull') : t('json.downloadDelta')}
            size="sm"
            onClick={() => {
              const file = themeFileName(name, view === 'delta' ? '-delta' : '');
              downloadText(file, json);
              toast.success(t('export.success', { file }));
            }}
          >
            <Download size={15} />
          </IconButton>
        </div>
      </div>
      {result && result.issues.length > 0 && (
        <FormatCard id="json-issues" level="section" title={`${t('json.issuesTitle')} (${result.issues.length})`} open={issuesOpen} onOpenChange={setIssuesOpen} className="mx-3 mb-2 rounded-md border border-border-subtle bg-surface-card">
          <ul className="m-0 flex max-h-[200px] list-none flex-col gap-1 overflow-y-auto p-0" data-testid="validation-issues">
            {result.issues.map((issue, i) => (
              <li key={`${issue.path}-${issue.code}-${i}`} className="flex items-start gap-2 text-[12px]">
                {issue.severity === 'error' ? <CircleAlert size={13} className="mt-0.5 shrink-0 text-danger-text" aria-hidden /> : <TriangleAlert size={13} className="mt-0.5 shrink-0 text-warning-text" aria-hidden />}
                <div className="min-w-0 flex-1">
                  <p className="text-text-body">{issueText(t, issue)}</p>
                  {issue.path && <p className="truncate font-mono text-[10.5px] text-text-muted">{issue.path}</p>}
                </div>
                {issue.path.startsWith('visualStyles.') && (
                  <button type="button" onClick={() => goTo(issue)} className="shrink-0 text-[11px] font-medium text-text-link hover:underline">{t('json.goTo')}</button>
                )}
              </li>
            ))}
          </ul>
        </FormatCard>
      )}
      <pre className={cn('m-0 min-h-0 flex-1 overflow-auto border-t border-border-subtle bg-surface-page px-3 py-2 font-mono text-[11.5px] leading-[1.55] text-text-body')} data-testid="json-output" tabIndex={0} aria-label={t('pane.json')}>
        {highlighted}
      </pre>
    </div>
  );
}
