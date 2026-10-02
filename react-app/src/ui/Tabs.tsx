import * as RTabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';
import { cn } from './cn';

export const Tabs = RTabs.Root;
export const TabsContent = RTabs.Content;

/** Power BI format pane tabs: underlined text tabs. */
export function TabsList({ className, children, ...rest }: RTabs.TabsListProps) {
  return (
    <RTabs.List className={cn('flex items-end gap-1 border-b border-border-subtle px-1', className)} {...rest}>
      {children}
    </RTabs.List>
  );
}

export function TabsTrigger({ className, children, ...rest }: RTabs.TabsTriggerProps & { children: ReactNode }) {
  return (
    <RTabs.Trigger
      className={cn(
        'relative -mb-px inline-flex h-9 items-center gap-1.5 border-b-2 border-transparent px-3 text-[13px] font-medium text-text-muted transition-colors duration-[var(--dur-fast)]',
        'hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring data-[state=active]:border-brand data-[state=active]:text-text-primary',
        className,
      )}
      {...rest}
    >
      {children}
    </RTabs.Trigger>
  );
}
