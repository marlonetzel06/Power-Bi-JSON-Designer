import { Lock, LockOpen, Shuffle, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocale, useT } from '@/i18n';
import { useDataColors } from '@/store/selectors';
import { useThemeStore } from '@/store/theme';
import { Button, ColorField, Popover, PopoverContent, PopoverTrigger, Select, cn, toast } from '@/ui';
import { generatePalette, HARMONIES, HARMONY_LABELS } from './palette';

/** "Palette generieren": harmony based data colours from a base colour, with locked slots. */
export function PaletteGenerator() {
  const t = useT();
  const locale = useLocale();
  const dataColors = useDataColors();
  const setDataColors = useThemeStore((s) => s.setDataColors);
  const [open, setOpen] = useState(false);
  const [base, setBase] = useState(dataColors[0] ?? '#008E82');
  const [harmony, setHarmony] = useState('analogous');
  const [seed, setSeed] = useState(0);
  const [locked, setLocked] = useState<Set<number>>(new Set());
  const count = Math.max(4, dataColors.length || 8);

  const generated = useMemo(() => {
    const sJ = seed ? ((seed * 37) % 21) - 10 : 0;
    const lJ = seed ? ((seed * 53) % 17) - 8 : 0;
    const fresh = generatePalette(harmony, base, count, sJ, lJ);
    return fresh.map((c, i) => (locked.has(i) && dataColors[i] ? dataColors[i]! : c));
  }, [harmony, base, count, seed, locked, dataColors]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" icon={<Wand2 />} data-testid="palette-generator">{t('theme.colors.generate')}</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px]">
        <div className="flex flex-col gap-3">
          <h4 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-text-muted">{t('theme.generator.title')}</h4>
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 text-[12px] text-text-body">
            <span>{t('theme.generator.base')}</span>
            <ColorField aria-label={t('theme.generator.base')} value={base} onChange={setBase} size="sm" hideThemeColors className="h-7" />
            <span>{t('theme.generator.harmony')}</span>
            <Select aria-label={t('theme.generator.harmony')} size="sm" value={harmony} onValueChange={setHarmony} options={Object.keys(HARMONIES).map((k) => ({ value: k, label: HARMONY_LABELS[k]?.[locale] ?? k }))} />
          </div>
          <div className="flex items-end gap-1" aria-label={t('theme.colors.data')}>
            {generated.map((c, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={locked.has(i)}
                aria-label={`${t('theme.dataColor', { index: i + 1 })} ${c} – ${locked.has(i) ? t('theme.generator.unlock') : t('theme.generator.lock')}`}
                onClick={() => setLocked((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                className={cn('group relative flex-1 rounded-t-sm border border-border-subtle transition-transform duration-[var(--dur-fast)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-focus-ring')}
                style={{ background: c, height: 36 + Math.sin(i * 1.2) * 14 + 14 }}
              >
                <span className="absolute inset-x-0 bottom-0.5 flex justify-center text-text-on-dark opacity-0 drop-shadow group-hover:opacity-100 group-aria-pressed:opacity-100" aria-hidden>
                  {locked.has(i) ? <Lock size={11} /> : <LockOpen size={11} />}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" icon={<Shuffle />} onClick={() => setSeed((s) => s + 1)}>{t('theme.generator.shuffle')}</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setDataColors(generated);
                toast.success(t('theme.generator.apply'));
                setOpen(false);
              }}
            >
              {t('theme.generator.apply')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
