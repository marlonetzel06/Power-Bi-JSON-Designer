import * as RT from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

export const TooltipProvider = ({ children }: { children: ReactNode }) => (
  <RT.Provider delayDuration={400} skipDelayDuration={200}>{children}</RT.Provider>
);

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Render nothing but the child (used when a label is already visible). */
  disabled?: boolean;
}

export function Tooltip({ content, children, side = 'bottom', disabled }: TooltipProps) {
  if (disabled || !content) return <>{children}</>;
  return (
    <RT.Root>
      <RT.Trigger asChild>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          sideOffset={6}
          collisionPadding={8}
          className="z-50 max-w-[260px] rounded-sm bg-surface-dark px-2.5 py-1.5 text-[12px] leading-snug text-text-on-dark shadow-md"
        >
          {content}
          <RT.Arrow className="fill-surface-dark" width={10} height={5} />
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  );
}
