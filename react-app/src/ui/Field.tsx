import type { ReactNode } from 'react';
import { cn } from './cn';

export interface FieldProps {
  id: string;
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  /** Marker shown when the value differs from the inherited/default value. */
  source?: 'visual' | 'global' | 'default';
  sourceLabel?: string;
  inline?: boolean;
  className?: string;
}

/** Label + control row in Power BI pane style: label above, control full width (or inline for switches). */
export function Field({ id, label, children, hint, source, sourceLabel, inline, className }: FieldProps) {
  return (
    <div className={cn('group/field', inline ? 'flex items-center justify-between gap-3 py-1' : 'flex flex-col gap-1 py-1', className)}>
      <label htmlFor={id} className="flex min-w-0 items-center gap-1.5 text-[12px] text-text-body">
        <span className="truncate">{label}</span>
        {source === 'visual' && <span aria-label={sourceLabel} title={sourceLabel} className="inline-block size-1.5 shrink-0 rounded-pill bg-accent" />}
      </label>
      <div className={cn(inline ? 'shrink-0' : 'w-full')}>{children}</div>
      {hint && <p className="text-[11px] text-text-muted">{hint}</p>}
    </div>
  );
}
