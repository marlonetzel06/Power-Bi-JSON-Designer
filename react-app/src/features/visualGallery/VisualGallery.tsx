import { useLocale, useT } from '@/i18n';
import { VISUAL_CATEGORIES } from '@/pbi/curation/selection';
import { visualLabel } from '@/pbi/curation/labels';
import { GLOBAL_KEY, PAGE_KEY } from '@/pbi/types';
import { useModified } from '@/store/selectors';
import { useUiStore } from '@/store/uiStore';
import { cn, Tooltip } from '@/ui';
import { pageOfVisual } from '../canvas/pages';
import { VisualIcon } from './icons';

/** Power BI "Visualisierungen" gallery: icon grid, click selects the visual on the canvas. */
export function VisualGallery({ filter }: { filter: string }) {
  const t = useT();
  const locale = useLocale();
  const selection = useUiStore((s) => s.selection);
  const select = useUiStore((s) => s.select);
  const setActivePage = useUiStore((s) => s.setActivePage);
  const setFocusVisual = useUiStore((s) => s.setFocusVisual);
  const modified = useModified();
  const q = filter.trim().toLowerCase();

  const keys = [GLOBAL_KEY, PAGE_KEY, ...VISUAL_CATEGORIES.flatMap((c) => c.visuals)].filter((k) => !q || visualLabel(locale, k).toLowerCase().includes(q) || k.toLowerCase().includes(q));

  const onPick = (key: string) => {
    if (key === PAGE_KEY) select({ kind: 'page' });
    else select({ kind: 'visual', key });
    const page = pageOfVisual(key);
    if (page) setActivePage(page.id);
    setFocusVisual(null);
  };

  return (
    <div role="listbox" aria-label={t('gallery.title')} className="grid grid-cols-8 gap-1 px-2 pb-2 pt-1">
      {keys.map((key) => {
        const selected = (selection.kind === 'visual' && selection.key === key) || (selection.kind === 'page' && key === PAGE_KEY);
        const count = key === GLOBAL_KEY ? (modified.globalsChanged ? 1 : 0) : modified.cardCounts[key] ?? 0;
        const label = visualLabel(locale, key);
        return (
          <Tooltip key={key} content={count ? `${label} · ${t('gallery.modified')}` : label} side="top">
            <button
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={count ? `${label}, ${t('gallery.modified')}` : label}
              data-testid={`gallery-${key}`}
              onClick={() => onPick(key)}
              onDoubleClick={() => key !== PAGE_KEY && setFocusVisual(key)}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-sm border border-transparent text-text-body transition-colors duration-[var(--dur-fast)]',
                'hover:border-border-default hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring',
                selected && 'border-brand bg-brand-soft text-text-brand hover:border-brand',
              )}
            >
              <VisualIcon visualKey={key} size={17} />
              {count > 0 && <span aria-hidden className="absolute right-[3px] top-[3px] size-1.5 rounded-pill bg-accent" />}
            </button>
          </Tooltip>
        );
      })}
      {keys.length === 0 && <p className="col-span-8 py-3 text-center text-[12px] text-text-muted">{t('canvas.noMatch', { query: filter })}</p>}
    </div>
  );
}
