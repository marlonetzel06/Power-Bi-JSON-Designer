import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useT } from '@/i18n';
import { visualLabel } from '@/pbi/curation/labels';
import { VISUAL_KEYS } from '@/pbi/curation/selection';
import { resolveColor, resolveNumber } from '@/pbi/resolve';
import { PAGE_KEY } from '@/pbi/types';
import { withAlpha } from '@/preview/resolver';
import { useModified, useTheme } from '@/store/selectors';
import { useUiStore } from '@/store/uiStore';
import { Button, EmptyState, SearchField, cn } from '@/ui';
import { CanvasVisual } from './CanvasVisual';
import { PageTabs } from './PageTabs';
import { getPage, PAGE_H, PAGE_W, searchPage } from './pages';
import { FunnelX } from 'lucide-react';

/**
 * The report canvas: wallpaper (theme outspace), one 16:9 page (theme background) with
 * the mock visuals, selection, page tabs. Clicking empty page area selects the page.
 */
export function ReportCanvas() {
  const t = useT();
  const locale = useLocale();
  const theme = useTheme();
  const modified = useModified();
  const selection = useUiStore((s) => s.selection);
  const select = useUiStore((s) => s.select);
  const activePage = useUiStore((s) => s.activePage);
  const setActivePage = useUiStore((s) => s.setActivePage);
  const query = useUiStore((s) => s.canvasQuery);
  const setQuery = useUiStore((s) => s.setCanvasQuery);
  const setFocusVisual = useUiStore((s) => s.setFocusVisual);

  const q = query.trim().toLowerCase();
  const page = useMemo(() => {
    if (!q) return { ...getPage(activePage), height: PAGE_H };
    return searchPage(VISUAL_KEYS.filter((k) => visualLabel(locale, k).toLowerCase().includes(q) || k.toLowerCase().includes(q)));
  }, [q, activePage, locale]);

  // Fit the 1280-wide page into the stage.
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const s = Math.min((width - 40) / PAGE_W, (height - 40) / PAGE_H);
      setScale(Math.max(0.15, Math.min(1.5, s)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const wallpaper = withAlpha(resolveColor(theme, PAGE_KEY, 'outspace', 'color', '#E6E6E6'), resolveNumber(theme, PAGE_KEY, 'outspace', 'transparency', 0));
  const canvasBg = withAlpha(resolveColor(theme, PAGE_KEY, 'background', 'color', theme.background ?? '#FFFFFF'), resolveNumber(theme, PAGE_KEY, 'background', 'transparency', 0));
  const pageSelected = selection.kind === 'page';
  const pageHeight = page.height;

  return (
    <section aria-label={t('canvas.pageSelected')} className="flex min-h-0 min-w-0 flex-1 flex-col bg-canvas" data-testid="report-canvas">
      <div className="@container flex h-11 shrink-0 items-center gap-3 border-b border-border-subtle bg-surface-card px-3">
        <SearchField value={query} onValueChange={setQuery} placeholder={t('canvas.searchPlaceholder')} clearLabel={t('action.clearFilter')} aria-label={t('canvas.searchPlaceholder')} className="max-w-[280px]" data-testid="canvas-search" />
        <p className="hidden min-w-0 flex-1 truncate text-[12px] text-text-muted @[860px]:block">{t('canvas.selectHint')}</p>
        <span className="ml-auto shrink-0 font-mono text-[11px] text-text-muted" aria-live="polite">{t('canvas.scale', { percent: Math.round(scale * 100) })}</span>
      </div>

      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-auto" style={{ background: wallpaper }}>
        {page.visuals.length === 0 ? (
          <EmptyState
            className="h-full"
            icon={<FunnelX />}
            title={t('canvas.noMatch', { query })}
            action={<Button variant="secondary" size="sm" onClick={() => setQuery('')}>{t('action.clearFilter')}</Button>}
          />
        ) : (
          <div className="flex min-h-full items-start justify-center p-5" onClick={() => select({ kind: 'page' })}>
            <div style={{ width: PAGE_W * scale, height: pageHeight * scale }} className="relative shrink-0">
              <div
                role="group"
                aria-label={t('format.pageTitle')}
                data-testid="report-page"
                data-selected={pageSelected ? '' : undefined}
                className={cn('absolute left-0 top-0 origin-top-left shadow-md transition-shadow duration-[var(--dur-fast)]', pageSelected && 'shadow-[0_0_0_2px_var(--color-brand),var(--shadow-md)]')}
                style={{ width: PAGE_W, height: pageHeight, transform: `scale(${scale})`, background: canvasBg }}
              >
                {page.visuals.map((v) => (
                  <CanvasVisual
                    key={v.key}
                    placed={v}
                    theme={theme}
                    selected={selection.kind === 'visual' && selection.key === v.key}
                    modifiedCount={modified.cardCounts[v.key] ?? 0}
                    onSelect={() => select({ kind: 'visual', key: v.key })}
                    onFocus={() => {
                      select({ kind: 'visual', key: v.key });
                      setFocusVisual(v.key);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <PageTabs active={activePage} searchActive={Boolean(q)} onChange={(id) => { setQuery(''); setActivePage(id); }} />
    </section>
  );
}
