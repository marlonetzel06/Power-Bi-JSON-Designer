import * as RD from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { cn } from './cn';
import { useT } from '@/i18n';

export const Dialog = RD.Root;
export const DialogTrigger = RD.Trigger;
export const DialogClose = RD.Close;

export interface DialogContentProps extends Omit<RD.DialogContentProps, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const SIZE = { sm: 'max-w-[420px]', md: 'max-w-[560px]', lg: 'max-w-[760px]' };

export function DialogContent({ title, description, footer, size = 'md', className, children, ...rest }: DialogContentProps) {
  const t = useT();
  return (
    <RD.Portal>
      <RD.Overlay className="fixed inset-0 z-50 bg-stage/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <RD.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-border-default bg-surface-overlay shadow-xl outline-none',
          SIZE[size],
          className,
        )}
        {...rest}
      >
        <div className="flex items-start gap-3 px-5 pt-4">
          <div className="min-w-0 flex-1">
            <RD.Title className="font-display text-[15px] font-bold uppercase tracking-wide text-text-primary">{title}</RD.Title>
            {description ? (
              <RD.Description className="mt-1 text-[13px] leading-relaxed text-text-muted">{description}</RD.Description>
            ) : (
              <RD.Description className="sr-only">{typeof title === 'string' ? title : ''}</RD.Description>
            )}
          </div>
          <RD.Close asChild>
            <button
              type="button"
              aria-label={t('action.close')}
              className="-mr-1 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-text-muted hover:bg-surface-subtle hover:text-text-primary"
            >
              <X size={16} aria-hidden />
            </button>
          </RD.Close>
        </div>
        {children && <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>}
        {footer && <div className="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3">{footer}</div>}
      </RD.Content>
    </RD.Portal>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

/** Confirmation with initial focus on Cancel (destructive-actions rule). */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, cancelLabel, destructive, onConfirm }: ConfirmDialogProps) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="sm"
        title={title}
        description={description}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.querySelector<HTMLButtonElement>('[data-cancel]')?.focus();
        }}
        footer={
          <>
            <RD.Close asChild>
              <Button variant="secondary" data-cancel>{cancelLabel ?? t('action.cancel')}</Button>
            </RD.Close>
            <Button
              variant={destructive ? 'primary' : 'primary'}
              className={cn(destructive && 'bg-danger hover:bg-danger text-text-on-dark')}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </>
        }
      />
    </Dialog>
  );
}
