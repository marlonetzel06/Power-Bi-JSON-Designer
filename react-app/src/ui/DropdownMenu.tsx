import * as RDM from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from './cn';

export const DropdownMenu = RDM.Root;
export const DropdownMenuTrigger = RDM.Trigger;
export const DropdownMenuGroup = RDM.Group;
export const DropdownMenuSub = RDM.Sub;
export const DropdownMenuRadioGroup = RDM.RadioGroup;

const contentClass = 'z-50 min-w-[220px] overflow-hidden rounded-md border border-border-default bg-surface-overlay p-1 shadow-lg';
const itemClass =
  'relative flex cursor-default select-none items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-[13px] text-text-body outline-none data-[highlighted]:bg-brand-soft data-[highlighted]:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-45 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-text-muted';

export function DropdownMenuContent({ className, children, ...rest }: RDM.DropdownMenuContentProps & { children: ReactNode }) {
  return (
    <RDM.Portal>
      <RDM.Content sideOffset={6} collisionPadding={8} align="end" className={cn(contentClass, className)} {...rest}>
        {children}
      </RDM.Content>
    </RDM.Portal>
  );
}

export function DropdownMenuItem({ className, shortcut, children, ...rest }: RDM.DropdownMenuItemProps & { shortcut?: string }) {
  return (
    <RDM.Item className={cn(itemClass, className)} {...rest}>
      {children}
      {shortcut && <span className="ml-auto pl-4 font-mono text-[11px] text-text-muted">{shortcut}</span>}
    </RDM.Item>
  );
}

export function DropdownMenuCheckboxItem({ className, children, ...rest }: RDM.DropdownMenuCheckboxItemProps) {
  return (
    <RDM.CheckboxItem className={cn(itemClass, 'pl-8', className)} {...rest}>
      <RDM.ItemIndicator className="absolute left-2 inline-flex text-text-brand"><Check size={14} aria-hidden /></RDM.ItemIndicator>
      {children}
    </RDM.CheckboxItem>
  );
}

export function DropdownMenuRadioItem({ className, children, ...rest }: RDM.DropdownMenuRadioItemProps) {
  return (
    <RDM.RadioItem className={cn(itemClass, 'pl-8', className)} {...rest}>
      <RDM.ItemIndicator className="absolute left-2 inline-flex text-text-brand"><Check size={14} aria-hidden /></RDM.ItemIndicator>
      {children}
    </RDM.RadioItem>
  );
}

export function DropdownMenuLabel({ className, ...rest }: RDM.DropdownMenuLabelProps) {
  return <RDM.Label className={cn('px-2.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-text-muted', className)} {...rest} />;
}

export function DropdownMenuSeparator({ className, ...rest }: RDM.DropdownMenuSeparatorProps) {
  return <RDM.Separator className={cn('my-1 h-px bg-border-subtle', className)} {...rest} />;
}

export function DropdownMenuSubTrigger({ className, children, ...rest }: RDM.DropdownMenuSubTriggerProps) {
  return (
    <RDM.SubTrigger className={cn(itemClass, 'data-[state=open]:bg-brand-soft', className)} {...rest}>
      {children}
      <ChevronRight size={14} className="ml-auto" aria-hidden />
    </RDM.SubTrigger>
  );
}

export function DropdownMenuSubContent({ className, ...rest }: RDM.DropdownMenuSubContentProps) {
  return (
    <RDM.Portal>
      <RDM.SubContent sideOffset={4} collisionPadding={8} className={cn(contentClass, className)} {...rest} />
    </RDM.Portal>
  );
}
