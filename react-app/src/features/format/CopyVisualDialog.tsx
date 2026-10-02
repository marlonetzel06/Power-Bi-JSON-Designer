import { useMemo, useState } from 'react';
import { useLocale, useT, type DictionaryKey } from '@/i18n';
import { visualLabel } from '@/pbi/curation/labels';
import { VISUAL_CATEGORIES } from '@/pbi/curation/selection';
import { useThemeStore } from '@/store/theme';
import { Button, Dialog, DialogContent, cn, toast } from '@/ui';
import { VisualIcon } from '../visualGallery/icons';

export function CopyVisualDialog({ sourceKey, open, onOpenChange }: { sourceKey: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const t = useT();
  const locale = useLocale();
  const copy = useThemeStore((s) => s.copyVisualSettings);
  const category = useMemo(() => VISUAL_CATEGORIES.find((c) => c.visuals.includes(sourceKey)), [sourceKey]);
  const [selected, setSelected] = useState<string[]>(() => category?.visuals.filter((v) => v !== sourceKey) ?? []);
  const name = visualLabel(locale, sourceKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={t('format.copyTitle')}
        description={t('format.copyDescription', { name })}
        footer={
          <>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>{t('action.cancel')}</Button>
            <Button
              variant="primary"
              disabled={selected.length === 0}
              onClick={() => {
                copy(sourceKey, selected);
                toast.success(t('format.copyApply', { count: selected.length }));
                onOpenChange(false);
              }}
            >
              {t('format.copyApply', { count: selected.length })}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {VISUAL_CATEGORIES.map((c) => (
            <fieldset key={c.id} className="m-0 border-0 p-0">
              <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">{t(`category.${c.id}` as DictionaryKey)}</legend>
              <div className="flex flex-wrap gap-1.5">
                {c.visuals.filter((v) => v !== sourceKey).map((v) => {
                  const on = selected.includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSelected((s) => (on ? s.filter((x) => x !== v) : [...s, v]))}
                      className={cn('inline-flex h-7 items-center gap-1.5 rounded-pill border px-2.5 text-[12px] transition-colors duration-[var(--dur-fast)]', on ? 'border-brand bg-brand-soft text-text-brand' : 'border-border-default text-text-body hover:border-border-strong')}
                    >
                      <VisualIcon visualKey={v} size={13} />
                      {visualLabel(locale, v)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
