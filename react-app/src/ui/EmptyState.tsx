import type { ReactNode } from 'react';
import { cn } from './cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'gap-2 p-4' : 'gap-3 p-8', className)}>
      {icon && <div className="text-text-muted [&>svg]:size-7" aria-hidden>{icon}</div>}
      <p className={cn('font-medium text-text-primary', compact ? 'text-[13px]' : 'text-[14px]')}>{title}</p>
      {description && <p className="max-w-[320px] text-[12.5px] leading-relaxed text-text-muted">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
