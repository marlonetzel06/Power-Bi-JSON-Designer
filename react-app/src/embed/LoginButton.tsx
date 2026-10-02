import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useAuthStore } from './authStore';

/** Sign-in/out for the live preview. Renders nothing when the embed is not configured. */
export function LoginButton({ className = '' }: { className?: string }) {
  const status = useAuthStore((s) => s.status);
  const accountName = useAuthStore((s) => s.accountName);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  if (status === 'unconfigured') return null;
  const busy = status === 'initializing' || status === 'acquiring';
  const signedIn = status === 'ready' || (status === 'error' && accountName);
  return (
    <button
      type="button"
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold ${className}`}
      onClick={() => void (signedIn ? signOut() : signIn())}
      disabled={busy}
      title={signedIn ? `Abmelden (${accountName})` : 'Für Live-Vorschau anmelden'}
    >
      {busy ? <Loader2 size={14} className="animate-spin" /> : signedIn ? <LogOut size={14} /> : <LogIn size={14} />}
      <span className="max-w-[120px] truncate">{busy ? '…' : signedIn ? accountName : 'Anmelden'}</span>
    </button>
  );
}
