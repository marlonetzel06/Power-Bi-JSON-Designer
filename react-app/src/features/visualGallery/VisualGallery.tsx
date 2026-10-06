import { memo, useCallback } from 'react';
import { useLocale, useT } from '@/i18n';
import { VISUAL_CATEGORIES } from '@/pbi/curation/selection';
import { visualLabel } from '@/pbi/curation/labels';
import { GLOBAL_KEY, PAGE_KEY } from '@/pbi/types';
import { useModified } from '@/store/selectors';
import { useUiStore } from '@/store/uiStore';
import { cn, Tooltip } from '@/ui';
import { VisualIcon } from './icons';

/** Power BI "Visualisierungen" gallery: icon grid, click selects the visual on the canvas. */
export function VisualGallery({ filter }: { filter: string }) {
  const t = useT();
  const locale = useLocale();
  const selection = useUiStore((s) => s.selection);
  const select = useUiStore((s) => s.select);
  const setFocusVisual = useUiStore((s) => s.setFocusVisual);
  const modified = useModified();
  const q = filter.trim().toLowerCase();

  const keys = [GLOBAL_KEY, PAGE_KEY, ...VISUAL_CATEGORIES.flatMap((c) => c.visuals)].filter((k) => !q || visualLabel(locale, k).toLowerCase().includes(q) || k.toLowerCase().includes(q));

  const onPick = useCallback(
    (key: string) => {
      if (key === PAGE_KEY) select({ kind: 'page' });
      else select({ kind: 'visual', key });
      setFocusVisual(null);
    },
    [select, setFocusVisual],
  );

  return (
    <div role="listbox" aria-label={t('gallery.title')} className="grid grid-cols-8 gap-1 px-2 pb-2 pt-1">
      {keys.map((key) => {
        const selected = (selection.kind === 'visual' && selection.key === key) || (selection.kind === 'page' && key === PAGE_KEY);
        const count = key === GLOBAL_KEY ? (modified.globalsChanged ? 1 : 0) : modified.cardCounts[key] ?? 0;
        return <GalleryItem key={key} visualKey={key} label={visualLabel(locale, key)} selected={selected} modified={count > 0} modifiedLabel={t('gallery.modified')} onPick={onPick} onFocus={setFocusVisual} />;
      })}
      {keys.length === 0 && <p className="col-span-8 py-3 text-center text-[12px] text-text-muted">{t('canvas.noMatch', { query: filter })}</p>}
    </div>
  );
}

const GalleryItem = memo(function GalleryItem({ visualKey, label, selected, modified, modifiedLabel, onPick, onFocus }: { visualKey: string; label: string; selected: boolean; modified: boolean; modifiedLabel: string; onPick: (key: string) => void; onFocus: (key: string) => void }) {
  return (
    <Tooltip content={modified ? `${label} · ${modifiedLabel}` : label} side="top">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        aria-label={modified ? `${label}, ${modifiedLabel}` : label}
        data-testid={`gallery-${visualKey}`}
        onClick={() => onPick(visualKey)}
        onDoubleClick={() => visualKey !== PAGE_KEY && onFocus(visualKey)}
        className={cn(
          'relative flex aspect-square items-center justify-center rounded-sm border border-transparent text-text-body transition-colors duration-[var(--dur-fast)]',
          'hover:border-border-default hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring',
          selected && 'border-brand bg-brand-soft text-text-brand hover:border-brand',
        )}
      >
        <VisualIcon visualKey={visualKey} size={17} />
        {modified && <span aria-hidden className="absolute right-[3px] top-[3px] size-1.5 rounded-pill bg-accent" />}
      </button>
    </Tooltip>
  );
});
