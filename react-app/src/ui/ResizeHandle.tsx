import { useCallback, useRef } from 'react';
import { cn } from './cn';

export interface ResizeHandleProps {
  /** Current size in px. */
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Which way does dragging *towards* the handle increase the size? 'left' = pane is on the right. */
  edge: 'left' | 'right';
  label: string;
  className?: string;
}

/** Accessible separator: drag with the mouse, or arrow keys (±16 px, Shift ±64). */
export function ResizeHandle({ value, min, max, onChange, edge, label, className }: ResizeHandleProps) {
  const start = useRef<{ x: number; v: number } | null>(null);
  const clamp = useCallback((v: number) => Math.round(Math.max(min, Math.min(max, v))), [min, max]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={(e) => {
        start.current = { x: e.clientX, v: value };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const dx = e.clientX - start.current.x;
        onChange(clamp(start.current.v + (edge === 'left' ? -dx : dx)));
      }}
      onPointerUp={(e) => {
        start.current = null;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 64 : 16;
        if (e.key === 'ArrowLeft') onChange(clamp(value + (edge === 'left' ? step : -step)));
        else if (e.key === 'ArrowRight') onChange(clamp(value + (edge === 'left' ? -step : step)));
        else if (e.key === 'Home') onChange(min);
        else if (e.key === 'End') onChange(max);
        else return;
        e.preventDefault();
      }}
      className={cn(
        'group relative z-10 w-1.5 shrink-0 cursor-col-resize touch-none select-none outline-none',
        'before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-border-subtle before:transition-colors before:duration-[var(--dur-fast)]',
        'hover:before:w-[3px] hover:before:bg-brand focus-visible:before:w-[3px] focus-visible:before:bg-focus-ring',
        className,
      )}
    />
  );
}
