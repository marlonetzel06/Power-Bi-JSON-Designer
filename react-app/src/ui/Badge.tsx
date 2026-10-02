import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export type BadgeTone = 'brand' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONE: Record<BadgeTone, string> = {
  brand: 'bg-brand-soft text-text-brand',
  neutral: 'bg-surface-subtle text-text-muted',
  success: 'bg-success-soft text-success-text',
  warning: 'bg-warning-soft text-warning-text',
  danger: 'bg-danger-soft text-danger-text',
  info: 'bg-info-soft text-info-text',
};

export function Badge({ tone = 'neutral', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn('inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-pill px-1.5 font-mono text-[10.5px] font-semibold leading-none tabular-nums', TONE[tone], className)}
      {...rest}
    />
  );
}

/** Small dot marker for "modified" states. */
export function Dot({ className }: { className?: string }) {
  return <span aria-hidden className={cn('inline-block size-1.5 rounded-pill bg-accent', className)} />;
}
