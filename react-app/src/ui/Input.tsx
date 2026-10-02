import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from './cn';

export const inputClass =
  'h-8 w-full min-w-0 rounded-sm border border-border-default bg-surface-card px-2.5 text-[13px] text-text-primary placeholder:text-text-muted transition-colors duration-[var(--dur-fast)] hover:border-border-strong focus:border-border-brand focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Visually attached unit/suffix (e.g. "px", "%"). */
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, invalid, suffix, ...rest }, ref) {
  const el = <input ref={ref} aria-invalid={invalid || undefined} className={cn(inputClass, invalid && 'border-danger', suffix && 'pr-8', className)} {...rest} />;
  if (!suffix) return el;
  return (
    <span className="relative inline-flex w-full min-w-0 items-center">
      {el}
      <span className="pointer-events-none absolute right-2 text-[11px] text-text-muted" aria-hidden>{suffix}</span>
    </span>
  );
});

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | undefined;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Round to integer on commit. */
  integer?: boolean;
  suffix?: ReactNode;
}

/**
 * Number input that keeps the raw text while typing and clamps/commits on blur or Enter
 * (Power BI Desktop behaviour: typing "1" must not immediately snap to a minimum of 6).
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { value, onValueChange, min, max, step = 1, integer, className, suffix, ...rest },
  ref,
) {
  const [text, setText] = useState(value === undefined ? '' : String(value));
  const [focused, setFocused] = useState(false);
  // Sync external value → text while not editing (derived state, no effect).
  const [seenValue, setSeenValue] = useState(value);
  if (value !== seenValue) {
    setSeenValue(value);
    if (!focused) setText(value === undefined ? '' : String(value));
  }

  const commit = () => {
    const raw = text.replace(',', '.').trim();
    if (raw === '') {
      setText(value === undefined ? '' : String(value));
      return;
    }
    let n = Number(raw);
    if (!Number.isFinite(n)) {
      setText(value === undefined ? '' : String(value));
      return;
    }
    if (integer) n = Math.round(n);
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    setText(String(n));
    if (n !== value) onValueChange(n);
  };

  return (
    <Input
      ref={ref}
      type="text"
      inputMode="decimal"
      value={text}
      suffix={suffix}
      className={cn('tabular-nums', className)}
      onChange={(e) => setText(e.target.value)}
      onFocus={(e) => {
        setFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        commit();
        rest.onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit();
          (e.target as HTMLInputElement).blur();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          const base = Number(text.replace(',', '.')) || value || 0;
          let n = base + (e.key === 'ArrowUp' ? step : -step) * (e.shiftKey ? 10 : 1);
          if (integer) n = Math.round(n);
          if (min !== undefined) n = Math.max(min, n);
          if (max !== undefined) n = Math.min(max, n);
          n = Number(n.toFixed(2));
          setText(String(n));
          onValueChange(n);
        }
        rest.onKeyDown?.(e);
      }}
      {...rest}
    />
  );
});

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
  clearLabel: string;
}

export function SearchField({ value, onValueChange, clearLabel, className, ...rest }: SearchFieldProps) {
  return (
    <div className={cn('relative flex w-full min-w-0 items-center', className)}>
      <Search size={14} className="pointer-events-none absolute left-2.5 text-text-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(inputClass, 'pl-8 pr-8 [&::-webkit-search-cancel-button]:hidden')}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) {
            e.stopPropagation();
            onValueChange('');
          }
        }}
        {...rest}
      />
      {value && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => onValueChange('')}
          className="absolute right-1.5 inline-flex size-5 items-center justify-center rounded-sm text-text-muted hover:bg-surface-subtle hover:text-text-primary"
        >
          <X size={13} aria-hidden />
        </button>
      )}
    </div>
  );
}
