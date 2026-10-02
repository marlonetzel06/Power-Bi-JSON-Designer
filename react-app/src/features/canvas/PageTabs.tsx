import { useT } from '@/i18n';
import { useModified } from '@/store/selectors';
import { cn } from '@/ui';
import { CANVAS_PAGES } from './pages';

/** Power BI Desktop style page tabs at the bottom of the canvas. */
export function PageTabs({ active, onChange, searchActive }: { active: string; onChange: (id: string) => void; searchActive: boolean }) {
  const t = useT();
  const modified = useModified();
  return (
    <div role="tablist" aria-label={t('canvas.pages')} className="flex h-9 shrink-0 items-end gap-px overflow-x-auto border-t border-border-subtle bg-surface-card px-2">
      {searchActive && (
        <button role="tab" aria-selected type="button" className="h-8 rounded-t-sm border border-b-0 border-brand bg-brand-soft px-3 text-[12px] font-semibold text-text-brand">
          {t('canvasPage.search')}
        </button>
      )}
      {CANVAS_PAGES.map((p) => {
        const selected = !searchActive && p.id === active;
        const changed = p.visuals.some((v) => (modified.cardCounts[v.key] ?? 0) > 0);
        return (
          <button
            key={p.id}
            role="tab"
            type="button"
            aria-selected={selected}
            data-testid={`page-tab-${p.id}`}
            onClick={() => onChange(p.id)}
            className={cn(
              'relative h-8 shrink-0 rounded-t-sm border border-b-0 px-3 text-[12px] transition-colors duration-[var(--dur-fast)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring',
              selected ? 'border-border-default bg-surface-page font-semibold text-text-primary' : 'border-transparent text-text-muted hover:bg-surface-subtle hover:text-text-primary',
            )}
          >
            {t(p.labelKey)}
            {changed && <span aria-hidden className="absolute right-1 top-1.5 size-1.5 rounded-pill bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}
