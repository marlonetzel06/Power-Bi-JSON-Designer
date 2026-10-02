import * as RSel from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from './cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string | undefined;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function Select({ value, onValueChange, options, placeholder, disabled, className, size = 'md', ...aria }: SelectProps) {
  return (
    <RSel.Root value={value ?? ''} onValueChange={onValueChange} disabled={disabled}>
      <RSel.Trigger
        className={cn(
          'inline-flex w-full min-w-0 items-center justify-between gap-2 rounded-sm border border-border-default bg-surface-card px-2.5 text-left text-[13px] text-text-primary transition-colors duration-[var(--dur-fast)]',
          'hover:border-border-strong focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus-ring data-[placeholder]:text-text-muted disabled:cursor-not-allowed disabled:opacity-50',
          size === 'sm' ? 'h-7 text-[12px]' : 'h-8',
          className,
        )}
        {...aria}
      >
        <span className="truncate"><RSel.Value placeholder={placeholder} /></span>
        <RSel.Icon className="shrink-0 text-text-muted"><ChevronDown size={14} aria-hidden /></RSel.Icon>
      </RSel.Trigger>
      <RSel.Portal>
        <RSel.Content
          position="popper"
          sideOffset={4}
          collisionPadding={8}
          className="z-50 max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border-default bg-surface-overlay shadow-lg"
        >
          <RSel.Viewport className="p-1">
            {options.map((o) => (
              <RSel.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-7 pr-3 text-[13px] text-text-body outline-none data-[highlighted]:bg-brand-soft data-[highlighted]:text-text-primary data-[state=checked]:text-text-primary"
              >
                <RSel.ItemIndicator className="absolute left-2 inline-flex text-text-brand"><Check size={13} aria-hidden /></RSel.ItemIndicator>
                <RSel.ItemText>{o.label}</RSel.ItemText>
              </RSel.Item>
            ))}
          </RSel.Viewport>
        </RSel.Content>
      </RSel.Portal>
    </RSel.Root>
  );
}
