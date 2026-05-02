import { forwardRef } from 'react';

const base = 'inline-flex items-center justify-center gap-1.5 font-semibold rounded-[var(--radius-sm)] cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1';

const sizes = {
  sm: 'h-7 px-2.5 text-[11px]',
  md: 'h-8 px-3 text-xs',
  lg: 'h-9 px-4 text-sm',
  icon: 'h-8 w-8 p-0',
};

const variants = {
  primary:
    'bg-[var(--color-primary)] text-white border border-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] hover:border-[var(--color-primary-hover)]',
  secondary:
    'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] border border-transparent hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]',
  danger:
    'bg-[var(--bg-surface)] text-[var(--color-danger)] border border-[var(--border-subtle)] hover:bg-[var(--color-danger-light)] hover:border-[var(--color-danger)]',
};

const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', className = '', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
