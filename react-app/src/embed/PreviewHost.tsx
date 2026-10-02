import { useAuthStore } from './authStore';
import { LiveReport } from './LiveReport';
import { useLiveAvailability } from './useLiveAvailability';
import { MockVisual } from '@/preview/MockVisual';
import { useTheme } from '@/store/selectors';
import type { PreviewMode } from '@/store/uiStore';

export interface PreviewHostProps {
  visualKey: string;
  mode: PreviewMode;
  className?: string;
}

/**
 * Shows the mock or the single live embed for a visual. The live embed stays mounted
 * (hidden) while the mock is shown so switching is instant; it is only created once
 * the live mode was requested with a ready embed config.
 */
export function PreviewHost({ visualKey, mode, className }: PreviewHostProps) {
  const theme = useTheme();
  const availability = useLiveAvailability(visualKey);
  const hasConfig = useAuthStore((s) => s.embedConfig !== null);
  const showLive = mode === 'live' && availability.available;
  return (
    <div className={className} style={{ position: 'relative' }}>
      {!showLive && <MockVisual theme={theme} visualKey={visualKey} />}
      {hasConfig && (
        <div style={{ position: 'absolute', inset: 0, visibility: showLive ? 'visible' : 'hidden', pointerEvents: showLive ? 'auto' : 'none' }} aria-hidden={!showLive}>
          <LiveReport visualKey={visualKey} className="h-full w-full" />
        </div>
      )}
    </div>
  );
}
