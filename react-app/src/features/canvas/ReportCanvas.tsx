import { FunnelX } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useT } from '@/i18n';
import { visualLabel } from '@/pbi/curation/labels';
import { VISUAL_KEYS } from '@/pbi/curation/selection';
import { resolveColor, resolveNumber } from '@/pbi/resolve';
import { PAGE_KEY } from '@/pbi/types';
import { fontSpec } from '@/preview/fonts';
import { withAlpha } from '@/preview/resolver';
import { useModified, useTheme } from '@/store/selectors';
import { useUiStore } from '@/store/uiStore';
import { Button, EmptyState, SearchField, cn } from '@/ui';
import { CanvasVisual } from './CanvasVisual';
import { layoutCanvas, PAGE_W, SECTION_HEADING_H } from './pages';

/**
 * The report canvas: wallpaper (theme outspace) and one long page (theme background)
 * with every mock visual grouped by category. Clicking empty page area selects the page.
 */
export function ReportCanvas() {
  const t = useT();
  const locale = useLocale();
  const theme = useTheme();
  const modified = useModified();
  const selection = useUiStore((s) => s.selection);
  const select = useUiStore((s) => s.select);
  const query = useUiStore((s) => s.canvasQuery);
  const setQuery = useUiStore((s) => s.setCanvasQuery);
  const setFocusVisual = useUiStore((s) => s.setFocusVisual);

  const onSelectVisual = useCallback((key: string) => select({ kind: 'visual', key }), [select]);
  const onFocusVisualKey = useCallback(
    (key: string) => {
      select({ kind: 'visual', key });
      setFocusVisual(key);
    },
    [select, setFocusVisual],
  );
  const q = query.trim().toLowerCase();
  const layout = useMemo(() => {
    if (!q) return layoutCanvas();
    return layoutCanvas(new Set(VISUAL_KEYS.filter((k) => visualLabel(locale, k).toLowerCase().includes(q) || k.toLowerCase().includes(q))));
  }, [q, locale]);

  // Fit the 1280-wide page to the stage width; the page scrolls vertically.
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setScale(Math.max(0.2, Math.min(1.25, (entry.contentRect.width - 40) / PAGE_W)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Bring the selected visual into view (gallery pick, validation "go to card").
  useEffect(() => {
    if (selection.kind !== 'visual') return;
    stageRef.current?.querySelector<HTMLElement>(`[data-canvas-visual="${selection.key}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selection]);

  const wallpaper = withAlpha(resolveColor(theme, PAGE_KEY, 'outspace', 'color', '#E6E6E6'), resolveNumber(theme, PAGE_KEY, 'outspace', 'transparency', 0));
  const canvasBg = withAlpha(resolveColor(theme, PAGE_KEY, 'background', 'color', theme.background ?? '#FFFFFF'), resolveNumber(theme, PAGE_KEY, 'background', 'transparency', 0));
  const headingFont = fontSpec(theme.textClasses?.title?.fontFace ?? 'Segoe UI').family;
  const headingColor = theme.textClasses?.title?.color ?? theme.foreground ?? '#252423';
  const pageSelected = selection.kind === 'page';

  return (
    <section aria-label={t('format.pageTitle')} className="flex min-h-0 min-w-0 flex-1 flex-col bg-canvas" data-testid="report-canvas">
      <div className="@container flex h-11 shrink-0 items-center gap-3 border-b border-border-subtle bg-surface-card px-3">
        <SearchField value={query} onValueChange={setQuery} placeholder={t('canvas.searchPlaceholder')} clearLabel={t('action.clearFilter')} aria-label={t('canvas.searchPlaceholder')} className="max-w-[280px]" data-testid="canvas-search" />
        <p className="hidden min-w-0 flex-1 truncate text-[12px] text-text-muted @[860px]:block">{t('canvas.selectHint')}</p>
        <span className="ml-auto shrink-0 font-mono text-[11px] text-text-muted" aria-live="polite">{t('canvas.scale', { percent: Math.round(scale * 100) })}</span>
      </div>

      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-auto" style={{ background: wallpaper }}>
        {layout.sections.length === 0 ? (
          <EmptyState className="h-full" icon={<FunnelX />} title={t('canvas.noMatch', { query })} action={<Button variant="secondary" size="sm" onClick={() => setQuery('')}>{t('action.clearFilter')}</Button>} />
        ) : (
          <div className="flex min-h-full items-start justify-center p-5" onClick={() => select({ kind: 'page' })}>
            <div style={{ width: PAGE_W * scale, height: layout.height * scale }} className="relative shrink-0">
              <div
                role="group"
                aria-label={t('format.pageTitle')}
                data-testid="report-page"
                data-selected={pageSelected ? '' : undefined}
                className={cn('absolute left-0 top-0 origin-top-left shadow-md transition-shadow duration-[var(--dur-fast)]', pageSelected && 'shadow-[0_0_0_2px_var(--color-brand),var(--shadow-md)]')}
                style={{ width: PAGE_W, height: layout.height, transform: `scale(${scale})`, background: canvasBg }}
              >
                {layout.sections.map((s) => (
                  <div key={s.id} data-canvas-section={s.id}>
                    <h3
                      className="pointer-events-none absolute left-6 m-0 flex items-end font-semibold uppercase tracking-[0.08em]"
                      style={{ top: s.y, height: SECTION_HEADING_H - 10, fontFamily: headingFont, fontSize: 14, color: headingColor, opacity: 0.75 }}
                    >
                      {t(s.labelKey)}
                    </h3>
                    {s.visuals.map((v) => (
                      <CanvasVisual
                        key={v.key}
                        placed={v}
                        theme={theme}
                        selected={selection.kind === 'visual' && selection.key === v.key}
                        modifiedCount={modified.cardCounts[v.key] ?? 0}
                        onSelect={onSelectVisual}
                        onFocus={onFocusVisualKey}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
