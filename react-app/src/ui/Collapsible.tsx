import * as RC from '@radix-ui/react-collapsible';
import { ChevronDown, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from './cn';
import { Dot } from './Badge';
import { Switch } from './Switch';
import { Tooltip } from './Tooltip';

export interface FormatCardProps {
  id: string;
  title: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Header toggle (Power BI: card "show" switch in the header). */
  toggle?: { checked: boolean; onCheckedChange: (checked: boolean) => void; label: string };
  modified?: boolean;
  onReset?: () => void;
  resetLabel?: string;
  children: ReactNode;
  /** Visual nesting: top-level section vs. card inside a section. */
  level?: 'section' | 'card';
  className?: string;
  /** Extra trailing header content. */
  headerExtra?: ReactNode;
}

/**
 * Power BI Desktop format card: collapsible header with chevron, optional on/off switch
 * and reset icon; body only in the DOM while expanded (keyboard users do not tab through
 * collapsed content).
 */
export function FormatCard({ id, title, open, onOpenChange, toggle, modified, onReset, resetLabel, children, level = 'card', className, headerExtra }: FormatCardProps) {
  const contentId = `${id}-content`;
  const section = level === 'section';
  return (
    <RC.Root open={open} onOpenChange={onOpenChange} className={cn(section ? 'border-b border-border-subtle' : 'rounded-md border border-border-subtle bg-surface-card', className)} data-card={id} data-modified={modified ? '' : undefined}>
      <div className={cn('flex items-center gap-1', section ? 'min-h-10 pr-1' : 'min-h-9 pr-1')}>
        <RC.Trigger
          aria-controls={contentId}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 self-stretch rounded-sm py-1.5 text-left outline-none transition-colors duration-[var(--dur-fast)] hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring',
            section ? 'pl-2 pr-2' : 'pl-1.5 pr-2',
          )}
        >
          <ChevronDown size={14} aria-hidden className={cn('shrink-0 text-text-muted transition-transform duration-[var(--dur-normal)] ease-[var(--ease-out)]', open ? '' : '-rotate-90')} />
          <span className={cn('min-w-0 flex-1 truncate', section ? 'text-[13px] font-semibold text-text-primary' : 'text-[12.5px] font-medium text-text-primary')}>{title}</span>
          {modified && <Dot className="shrink-0" />}
        </RC.Trigger>
        {headerExtra}
        {onReset && (
          <Tooltip content={resetLabel}>
            <button
              type="button"
              aria-label={resetLabel}
              disabled={!modified}
              onClick={onReset}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors duration-[var(--dur-fast)] hover:bg-surface-subtle hover:text-text-primary disabled:opacity-0 disabled:pointer-events-none"
            >
              <RotateCcw size={13} aria-hidden />
            </button>
          </Tooltip>
        )}
        {toggle && (
          <Switch size="sm" className="mr-1 shrink-0" checked={toggle.checked} onCheckedChange={toggle.onCheckedChange} aria-label={toggle.label} />
        )}
      </div>
      <RC.Content id={contentId} className={cn(section ? 'px-2 pb-3' : 'border-t border-border-subtle px-3 py-2.5')}>
        {children}
      </RC.Content>
    </RC.Root>
  );
}
