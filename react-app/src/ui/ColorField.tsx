import { Pipette } from 'lucide-react';
import { useId, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { cn } from './cn';
import { inputClass } from './Input';
import { useLocale, useT } from '@/i18n';
import { normalizeHex, shadesOf } from '@/lib/color';
import { colorLabel } from '@/pbi/curation/labels';
import { useDataColors, useTheme } from '@/store/selectors';

const STRUCTURAL_KEYS = ['foreground', 'background', 'firstLevelElements', 'secondLevelElements', 'thirdLevelElements', 'fourthLevelElements', 'secondaryBackground', 'tableAccent'] as const;

export interface ColorFieldProps {
  value: string | undefined;
  onChange: (hex: string) => void;
  /** Optional: allow clearing (sets undefined). */
  onClear?: () => void;
  'aria-label': string;
  disabled?: boolean;
  /** Show the hex text next to the swatch. */
  showHex?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  /** Hide the theme colour grid (e.g. when editing the data colours themselves). */
  hideThemeColors?: boolean;
}

/**
 * Power BI style colour picker: swatch button → popover with the theme colours
 * (data colours + shades), structural colours and "More colours" (native picker + hex).
 */
export function ColorField({ value, onChange, onClear, disabled, showHex = true, size = 'md', className, hideThemeColors, ...aria }: ColorFieldProps) {
  const t = useT();
  const locale = useLocale();
  const dataColors = useDataColors();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value ?? '');
  const [invalid, setInvalid] = useState(false);
  const id = useId();
  // Re-seed the hex field whenever the value or the popover state changes (derived state).
  const [seen, setSeen] = useState({ value, open });
  if (seen.value !== value || seen.open !== open) {
    setSeen({ value, open });
    setText(value ?? '');
    setInvalid(false);
  }

  const commitText = () => {
    const n = normalizeHex(text);
    if (!n) {
      setInvalid(text.trim() !== '');
      return;
    }
    setInvalid(false);
    setText(n);
    if (n !== value) onChange(n);
  };

  const swatchSize = size === 'sm' ? 'size-6' : 'size-7';
  const current = value && normalizeHex(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={`${aria['aria-label']}: ${current ?? t('color.none')}`}
          className={cn(
            'group inline-flex h-8 min-w-0 items-center gap-2 rounded-sm border border-border-default bg-surface-card px-1 text-left transition-colors duration-[var(--dur-fast)] hover:border-border-strong',
            'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50',
            showHex ? 'pr-2.5' : '',
            className,
          )}
        >
          <span
            aria-hidden
            className={cn(swatchSize, 'shrink-0 rounded-sm border border-border-subtle shadow-xs')}
            style={current ? { background: current } : { backgroundImage: 'linear-gradient(45deg, var(--border-default) 25%, transparent 25%, transparent 75%, var(--border-default) 75%), linear-gradient(45deg, var(--border-default) 25%, transparent 25%, transparent 75%, var(--border-default) 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 4px 4px' }}
          />
          {showHex && <span className="truncate font-mono text-[12px] uppercase text-text-body">{current ?? '—'}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[268px] p-0">
        {!hideThemeColors && dataColors.length > 0 && (
          <section className="border-b border-border-subtle p-3" aria-labelledby={`${id}-theme`}>
            <h4 id={`${id}-theme`} className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">{t('color.themeColors')}</h4>
            <div className="grid grid-cols-8 gap-1">
              {dataColors.slice(0, 8).map((c, i) => (
                <Swatch key={`d${i}`} hex={c} selected={current === normalizeHex(c)} label={`${t('theme.colors.data')} ${i + 1}`} onPick={(h) => { onChange(h); setOpen(false); }} />
              ))}
              {dataColors.slice(0, 8).map((c, i) => (
                <div key={`s${i}`} className="flex flex-col gap-1">
                  {shadesOf(c).map((s, j) => (
                    <Swatch key={j} hex={s} small selected={current === s} label={`${t('theme.colors.data')} ${i + 1} ${j + 1}`} onPick={(h) => { onChange(h); setOpen(false); }} />
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="border-b border-border-subtle p-3" aria-labelledby={`${id}-struct`}>
          <h4 id={`${id}-struct`} className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">{t('color.structural')}</h4>
          <div className="grid grid-cols-8 gap-1">
            {STRUCTURAL_KEYS.map((k) => {
              const hex = theme[k];
              if (!hex) return null;
              return <Swatch key={k} hex={hex} selected={current === normalizeHex(hex)} label={colorLabel(locale, k)} onPick={(h) => { onChange(h); setOpen(false); }} />;
            })}
          </div>
        </section>
        <section className="p-3" aria-labelledby={`${id}-more`}>
          <h4 id={`${id}-more`} className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">{t('color.more')}</h4>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm border border-border-default bg-surface-card hover:border-border-strong">
              <Pipette size={14} className="pointer-events-none text-text-muted" aria-hidden />
              <input
                type="color"
                aria-label={t('color.pick')}
                value={current?.slice(0, 7) ?? '#000000'}
                onChange={(e) => onChange(e.target.value.toUpperCase())}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
            </label>
            <input
              aria-label={t('color.hex')}
              aria-invalid={invalid || undefined}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={commitText}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitText();
                  setOpen(false);
                }
              }}
              placeholder="#RRGGBB"
              spellCheck={false}
              className={cn(inputClass, 'font-mono uppercase', invalid && 'border-danger')}
            />
            {onClear && (
              <button type="button" onClick={() => { onClear(); setOpen(false); }} className="shrink-0 rounded-sm px-2 py-1 text-[12px] text-text-muted hover:bg-surface-subtle hover:text-text-primary">
                {t('color.none')}
              </button>
            )}
          </div>
        </section>
      </PopoverContent>
    </Popover>
  );
}

function Swatch({ hex, label, selected, small, onPick }: { hex: string; label: string; selected: boolean; small?: boolean; onPick: (hex: string) => void }) {
  return (
    <button
      type="button"
      aria-label={`${label} ${hex}`}
      aria-pressed={selected}
      onClick={() => onPick(normalizeHex(hex) ?? hex)}
      className={cn(
        'rounded-[2px] border border-border-subtle transition-transform duration-[var(--dur-fast)] hover:scale-110 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring',
        small ? 'h-3.5 w-full' : 'aspect-square w-full',
        selected && 'ring-2 ring-focus-ring ring-offset-1 ring-offset-surface-card',
      )}
      style={{ background: hex }}
    />
  );
}
