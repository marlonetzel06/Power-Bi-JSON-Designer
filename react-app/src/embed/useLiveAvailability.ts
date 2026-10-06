import { useAuthStore } from './authStore';
import { resolvePage } from './pageMap';

export type LiveAvailability =
  | { available: true }
  | { available: false; reason: 'unconfigured' | 'signed-out' | 'acquiring' | 'error' | 'no-page' | 'initializing' };

/** Can the live preview show this visual right now, and if not, why? */
export function useLiveAvailability(visualKey: string): LiveAvailability {
  const status = useAuthStore((s) => s.status);
  const pages = useAuthStore((s) => s.pages);
  if (status !== 'ready') return { available: false, reason: status === 'unconfigured' ? 'unconfigured' : status === 'signed-out' ? 'signed-out' : status === 'error' ? 'error' : status === 'initializing' ? 'initializing' : 'acquiring' };
  if (pages.length > 0 && !resolvePage(visualKey, pages)) return { available: false, reason: 'no-page' };
  return { available: true };
}
