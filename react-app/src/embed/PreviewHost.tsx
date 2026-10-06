import type { CSSProperties } from 'react';
import { useAuthStore } from './authStore';
import { LiveReport } from './LiveReport';
import { useLiveAvailability } from './useLiveAvailability';
import { MockVisual } from '@/preview/MockVisual';
import { useTheme } from '@/store/selectors';
import { useUiStore, type PreviewMode } from '@/store/uiStore';

export interface PreviewHostProps {
  visualKey: string;
  mode: PreviewMode;
  className?: string;
  /** Design size of the mock in px (keeps fonts at real point sizes instead of scaling the natural size up). */
  width?: number;
  height?: number;
  style?: CSSProperties;
}

/**
 * Shows the mock or the single live embed for a visual. The live embed stays mounted
 * (hidden) while the mock is shown so switching is instant; it is only created once
 * the live mode was requested with a ready embed config.
 */
export function PreviewHost({ visualKey, mode, className, width, height, style }: PreviewHostProps) {
  const theme = useTheme();
  const stateId = useUiStore((s) => s.previewState[visualKey]);
  const availability = useLiveAvailability(visualKey);
  const hasConfig = useAuthStore((s) => s.embedConfig !== null);
  const showLive = mode === 'live' && availability.available;
  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      {!showLive && <MockVisual theme={theme} visualKey={visualKey} width={width} height={height} stateId={stateId} />}
      {hasConfig && (
        <div style={{ position: 'absolute', inset: 0, visibility: showLive ? 'visible' : 'hidden', pointerEvents: showLive ? 'auto' : 'none' }} aria-hidden={!showLive}>
          <LiveReport visualKey={visualKey} className="h-full w-full" />
        </div>
      )}
    </div>
  );
}
