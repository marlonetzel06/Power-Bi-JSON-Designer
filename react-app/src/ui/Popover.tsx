import * as RP from '@radix-ui/react-popover';
import type { ReactNode } from 'react';
import { cn } from './cn';

export const Popover = RP.Root;
export const PopoverTrigger = RP.Trigger;
export const PopoverAnchor = RP.Anchor;
export const PopoverClose = RP.Close;

export function PopoverContent({ className, children, ...rest }: RP.PopoverContentProps & { children: ReactNode }) {
  return (
    <RP.Portal>
      <RP.Content
        sideOffset={6}
        collisionPadding={8}
        className={cn('z-50 rounded-md border border-border-default bg-surface-overlay p-3 shadow-lg outline-none', className)}
        {...rest}
      >
        {children}
      </RP.Content>
    </RP.Portal>
  );
}
