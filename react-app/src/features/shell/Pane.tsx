import { ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useT } from '@/i18n';
import { IconButton, ResizeHandle, cn } from '@/ui';

export interface PaneProps {
  id: string;
  title: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange: (w: number) => void;
  collapsed: boolean;
  onCollapsedChange: (c: boolean) => void;
  onClose?: () => void;
  headerExtra?: ReactNode;
  children: ReactNode;
  testId?: string;
}

/**
 * Power BI Desktop style pane: title bar with collapse (to a vertical strip) and close,
 * resizable on its left edge. Optics (tokens, motion) are M&M.
 */
export function Pane({ id, title, width, minWidth = 280, maxWidth = 640, onWidthChange, collapsed, onCollapsedChange, onClose, headerExtra, children, testId }: PaneProps) {
  const t = useT();
  const reduce = useReducedMotion();
  const dur = reduce ? 0 : 0.32;
  if (collapsed) {
    return (
      <motion.aside
        key={`${id}-collapsed`}
        aria-label={title}
        data-testid={testId}
        data-collapsed=""
        initial={{ width: 36 }}
        animate={{ width: 36 }}
        transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-full shrink-0 flex-col items-center border-l border-border-subtle bg-surface-card"
      >
        <button
          type="button"
          aria-label={`${t('pane.expand')}: ${title}`}
          aria-expanded={false}
          onClick={() => onCollapsedChange(false)}
          className="flex h-full w-full flex-col items-center gap-2 pt-2 text-text-muted hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus-ring"
        >
          <ChevronsLeft size={14} aria-hidden />
          <span className="text-[11.5px] font-semibold tracking-wide [writing-mode:vertical-rl]">{title}</span>
        </button>
      </motion.aside>
    );
  }
  return (
    <div className="flex h-full shrink-0" data-testid={testId}>
      <ResizeHandle value={width} min={minWidth} max={maxWidth} onChange={onWidthChange} edge="left" label={`${t('pane.resize')}: ${title}`} />
      <motion.aside
        key={`${id}-open`}
        aria-label={title}
        initial={{ width: Math.min(width, 36), opacity: 0.6 }}
        animate={{ width, opacity: 1 }}
        transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
        className={cn('flex h-full min-w-0 flex-col overflow-hidden border-l border-border-subtle bg-surface-card')}
        style={{ width }}
      >
        <header className="flex h-10 shrink-0 items-center gap-1 border-b border-border-subtle pl-3 pr-1">
          <h2 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-text-primary">{title}</h2>
          {headerExtra}
          <IconButton label={`${t('pane.collapse')}: ${title}`} size="xs" aria-expanded onClick={() => onCollapsedChange(true)}><ChevronsRight size={14} /></IconButton>
          {onClose && <IconButton label={`${t('action.close')}: ${title}`} size="xs" onClick={onClose}><X size={14} /></IconButton>}
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </motion.aside>
    </div>
  );
}
