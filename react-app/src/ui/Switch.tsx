import * as RS from '@radix-ui/react-switch';
import { cn } from './cn';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  size?: 'sm' | 'md';
}

/** Power BI style toggle (pill with knob) using M&M tokens. `role="switch"` via Radix. */
export function Switch({ className, size = 'md', ...rest }: SwitchProps) {
  const sm = size === 'sm';
  return (
    <RS.Root
      className={cn(
        'group relative inline-flex shrink-0 cursor-pointer items-center rounded-pill border border-border-strong bg-surface-card transition-colors duration-[var(--dur-normal)] ease-[var(--ease-out)]',
        'data-[state=checked]:border-brand data-[state=checked]:bg-brand disabled:cursor-not-allowed disabled:opacity-45',
        sm ? 'h-4 w-7' : 'h-5 w-9',
        className,
      )}
      {...rest}
    >
      <RS.Thumb
        className={cn(
          'block rounded-pill bg-text-muted transition-transform duration-[var(--dur-normal)] ease-[var(--ease-out)] group-data-[state=checked]:bg-text-on-brand',
          sm ? 'size-2.5 translate-x-[3px] group-data-[state=checked]:translate-x-[15px]' : 'size-3 translate-x-[3px] group-data-[state=checked]:translate-x-[19px]',
        )}
      />
    </RS.Root>
  );
}
