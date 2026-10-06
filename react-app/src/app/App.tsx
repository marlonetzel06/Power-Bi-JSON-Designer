import { useEffect } from 'react';
import { EmbedProvider } from '@/embed/EmbedProvider';
import { useUndoShortcuts } from '@/lib/useUndoShortcuts';
import { applyUiToDocument, useUiStore } from '@/store/uiStore';
import { ErrorBoundary, ToastHost, TooltipProvider } from '@/ui';
import { FocusMode } from '@/features/canvas/FocusMode';
import { ReportCanvas } from '@/features/canvas/ReportCanvas';
import { HelpDialog } from '@/features/help/HelpDialog';
import { PaneRail } from '@/features/shell/PaneRail';
import { TopBar } from '@/features/shell/TopBar';

export function App() {
  const colorMode = useUiStore((s) => s.theme);
  const locale = useUiStore((s) => s.locale);
  const focusVisual = useUiStore((s) => s.focusVisual);
  const select = useUiStore((s) => s.select);
  useUndoShortcuts();

  useEffect(() => {
    applyUiToDocument(colorMode, locale);
  }, [colorMode, locale]);

  // Esc on the canvas clears the selection (Radix layers own Esc inside popovers/dialogs).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.closest('[role="dialog"], [data-radix-popper-content-wrapper]') || target.tagName === 'INPUT')) return;
      if (!useUiStore.getState().focusVisual) select({ kind: 'none' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [select]);

  return (
    <TooltipProvider>
      <EmbedProvider>
        <div className="flex h-screen flex-col overflow-hidden bg-surface-page text-text-body">
          <TopBar />
          <div className="flex min-h-0 flex-1">
            <ErrorBoundary>{focusVisual ? <FocusMode visualKey={focusVisual} /> : <ReportCanvas />}</ErrorBoundary>
            <ErrorBoundary>
              <PaneRail />
            </ErrorBoundary>
          </div>
          <HelpDialog />
          <ToastHost />
        </div>
      </EmbedProvider>
    </TooltipProvider>
  );
}
