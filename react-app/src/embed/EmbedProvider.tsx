import { useEffect, type ReactNode } from 'react';
import { initializeAuth } from './authStore';

/** Starts MSAL (when configured) without blocking the app. */
export function EmbedProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void initializeAuth();
  }, []);
  return <>{children}</>;
}
