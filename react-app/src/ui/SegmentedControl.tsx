import * as TG from '@radix-ui/react-toggle-group';
import type { ReactNode } from 'react';
import { cn } from './cn';
import { Tooltip } from './Tooltip';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
  tooltip?: ReactNode;
  'aria-label'?: string;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly SegmentOption<T>[];
  'aria-label': string;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl<T extends string>({ value, onValueChange, options, size = 'md', className, ...aria }: SegmentedControlProps<T>) {
  return (
    <TG.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v as T)}
      className={cn('inline-flex items-stretch rounded-md border border-border-default bg-surface-subtle p-0.5', className)}
      {...aria}
    >
      {options.map((o) => {
        const item = (
          <TG.Item
            key={o.value}
            value={o.value}
            disabled={o.disabled}
            aria-label={o['aria-label']}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-3 font-medium text-text-muted transition-colors duration-[var(--dur-fast)]',
              'hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring',
              'data-[state=on]:bg-surface-card data-[state=on]:text-text-primary data-[state=on]:shadow-xs disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:text-text-muted',
              size === 'sm' ? 'h-6 text-[12px]' : 'h-7 text-[13px]',
            )}
          >
            {o.label}
          </TG.Item>
        );
        return o.tooltip ? (
          <Tooltip key={o.value} content={o.tooltip}><span className="inline-flex">{item}</span></Tooltip>
        ) : item;
      })}
    </TG.Root>
  );
}
