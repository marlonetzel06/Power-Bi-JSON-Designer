import type { ReactNode } from 'react';

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border-default bg-surface-subtle px-1.5 font-mono text-[11px] text-text-body">
      {children}
    </kbd>
  );
}
