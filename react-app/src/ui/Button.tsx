import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';
import { Tooltip } from './Tooltip';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  active?: boolean;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-text-on-brand hover:bg-brand-hover border border-transparent shadow-xs',
  secondary: 'bg-surface-card text-text-primary border border-border-default hover:border-border-strong hover:bg-surface-subtle',
  ghost: 'bg-transparent text-text-body border border-transparent hover:bg-surface-subtle hover:text-text-primary',
  subtle: 'bg-surface-subtle text-text-body border border-transparent hover:bg-surface-raised hover:text-text-primary',
  danger: 'bg-transparent text-danger-text border border-transparent hover:bg-danger-soft',
};
const SIZE: Record<ButtonSize, string> = {
  sm: 'h-7 px-2 text-[12px] gap-1.5 rounded-sm',
  md: 'h-9 px-3.5 text-[13px] gap-2 rounded-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon, iconRight, active, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-active={active ? '' : undefined}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium leading-none transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
        'disabled:cursor-not-allowed disabled:opacity-45 data-[active]:bg-brand-soft data-[active]:text-text-brand',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {icon && <span className="inline-flex shrink-0 [&>svg]:size-[1em]" style={{ fontSize: size === 'sm' ? 14 : 16 }} aria-hidden>{icon}</span>}
      {children}
      {iconRight && <span className="inline-flex shrink-0 [&>svg]:size-[1em]" style={{ fontSize: size === 'sm' ? 14 : 16 }} aria-hidden>{iconRight}</span>}
    </button>
  );
});

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Required: icon-only buttons need an accessible name; also used as tooltip. */
  label: string;
  children: ReactNode;
  size?: ButtonSize | 'xs';
  variant?: 'ghost' | 'subtle' | 'secondary' | 'danger';
  active?: boolean;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  /** Hide the tooltip (e.g. when the button already shows visible text nearby). */
  noTooltip?: boolean;
}

const ICON_SIZE = { xs: 'size-6 rounded-sm [&>svg]:size-3.5', sm: 'size-7 rounded-sm [&>svg]:size-4', md: 'size-9 rounded-md [&>svg]:size-[18px]' };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, size = 'sm', variant = 'ghost', active, className, type = 'button', tooltipSide, noTooltip, ...rest },
  ref,
) {
  const btn = (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      data-active={active ? '' : undefined}
      className={cn(
        // 44px hit area via pseudo element for small buttons (touch targets) without changing layout
        'relative inline-flex shrink-0 items-center justify-center transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
        'before:absolute before:-inset-1.5 before:content-[""]',
        'disabled:cursor-not-allowed disabled:opacity-45 data-[active]:bg-brand-soft data-[active]:text-text-brand',
        VARIANT[variant],
        ICON_SIZE[size],
        className,
      )}
      {...rest}
    >
      <span className="relative inline-flex" aria-hidden>{children}</span>
    </button>
  );
  if (noTooltip) return btn;
  return <Tooltip content={label} side={tooltipSide}>{btn}</Tooltip>;
});
