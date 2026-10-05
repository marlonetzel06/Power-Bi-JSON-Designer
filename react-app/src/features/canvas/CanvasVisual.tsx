import { Maximize2 } from 'lucide-react';
import { memo } from 'react';
import { useLocale, useT } from '@/i18n';
import { visualLabel } from '@/pbi/curation/labels';
import type { ReportTheme } from '@/pbi/types';
import { MockVisual } from '@/preview/MockVisual';
import { cn, Tooltip } from '@/ui';
import type { PlacedVisual } from './pages';

export interface CanvasVisualProps {
  placed: PlacedVisual;
  theme: ReportTheme;
  selected: boolean;
  modifiedCount: number;
  onSelect: (key: string) => void;
  onFocus: (key: string) => void;
}

const HANDLES = ['-top-1 -left-1', '-top-1 left-1/2 -translate-x-1/2', '-top-1 -right-1', 'top-1/2 -left-1 -translate-y-1/2', 'top-1/2 -right-1 -translate-y-1/2', '-bottom-1 -left-1', '-bottom-1 left-1/2 -translate-x-1/2', '-bottom-1 -right-1'];

/** One visual on the report page: Power BI selection frame with handles + focus-mode button. */
export const CanvasVisual = memo(function CanvasVisual({ placed, theme, selected, modifiedCount, onSelect, onFocus }: CanvasVisualProps) {
  const t = useT();
  const locale = useLocale();
  const label = visualLabel(locale, placed.key);
  const aria = modifiedCount ? `${label}, ${modifiedCount === 1 ? t('format.modifiedCard', { count: 1 }) : t('format.modifiedCards', { count: modifiedCount })}` : label;
  return (
    <div className="absolute" style={{ left: placed.x, top: placed.y, width: placed.w, height: placed.h }} data-canvas-visual={placed.key}>
      <button
        type="button"
        aria-label={aria}
        aria-pressed={selected}
        data-testid={`canvas-${placed.key}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(placed.key);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onFocus(placed.key);
        }}
        className={cn(
          'group/visual absolute inset-0 block cursor-pointer rounded-none text-left outline-none transition-shadow duration-[var(--dur-fast)]',
          'hover:shadow-[0_0_0_1px_var(--color-brand)] focus-visible:shadow-[0_0_0_2px_var(--focus-ring)]',
          selected && 'shadow-[0_0_0_1px_var(--color-brand)] hover:shadow-[0_0_0_1px_var(--color-brand)]',
        )}
      >
        <MockVisual theme={theme} visualKey={placed.key} width={placed.w} height={placed.h} />
      </button>
      {selected && (
        <>
          {HANDLES.map((pos) => (
            <span key={pos} aria-hidden className={cn('pointer-events-none absolute size-2 rounded-[1px] border border-brand bg-surface-card', pos)} />
          ))}
          <div className="absolute -top-9 right-0 flex items-center gap-0.5 rounded-sm border border-border-default bg-surface-overlay p-0.5 shadow-md" style={{ zoom: 1 }}>
            <Tooltip content={t('action.focusMode')} side="top">
              <button
                type="button"
                aria-label={t('action.focusMode')}
                data-testid="focus-mode-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFocus(placed.key);
                }}
                className="inline-flex size-7 items-center justify-center rounded-sm text-text-body hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-focus-ring"
              >
                <Maximize2 size={14} aria-hidden />
              </button>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
});
