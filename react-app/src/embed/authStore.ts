/**
 * Power BI live preview auth: MSAL state machine in a store (not persisted),
 * so every component sees the same status and errors.
 */
import { InteractionRequiredAuthError, PublicClientApplication, type AccountInfo } from '@azure/msal-browser';
import { create } from 'zustand';
import { PBI_SCOPES, buildEmbedUrl, embedEnv, isEmbedConfigured } from './config';

export type AuthStatus = 'unconfigured' | 'initializing' | 'signed-out' | 'acquiring' | 'ready' | 'error';

export interface EmbedConfig {
  type: 'report';
  id: string;
  embedUrl: string;
  accessToken: string;
  tokenType: 0;
  settings: Record<string, unknown>;
}

export interface AuthState {
  status: AuthStatus;
  accountName: string | null;
  embedConfig: EmbedConfig | null;
  error: string | null;
  /** Report pages discovered at runtime (filled by LiveReport). */
  pages: { name: string; displayName: string; visualTypes: string[] }[];
  setPages: (pages: AuthState['pages']) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => Promise<void>;
  setEmbedError: (message: string) => void;
}

let msal: PublicClientApplication | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let initPromise: Promise<void> | null = null;

function buildConfig(token: string): EmbedConfig {
  return {
    type: 'report',
    id: embedEnv.reportId,
    embedUrl: buildEmbedUrl(),
    accessToken: token,
    tokenType: 0,
    settings: {
      panes: { filters: { visible: false }, pageNavigation: { visible: false } },
      navContentPaneEnabled: false,
      background: 1,
    },
  };
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: isEmbedConfigured ? 'initializing' : 'unconfigured',
  accountName: null,
  embedConfig: null,
  error: null,
  pages: [],
  setPages: (pages) => set({ pages }),
  signIn: async () => {
    if (!msal) return;
    try {
      await msal.loginRedirect({ scopes: PBI_SCOPES });
    } catch (e) {
      set({ status: 'error', error: (e as Error).message });
    }
  },
  signOut: async () => {
    if (!msal) return;
    if (refreshTimer) clearTimeout(refreshTimer);
    try {
      await msal.logoutRedirect({ postLogoutRedirectUri: embedEnv.redirectUri });
    } catch (e) {
      set({ status: 'error', error: (e as Error).message });
    }
  },
  retry: async () => {
    set({ error: null });
    await acquireToken();
  },
  setEmbedError: (message) => set({ status: 'error', error: message }),
}));

async function acquireToken(): Promise<void> {
  if (!msal) return;
  const account: AccountInfo | null = msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? null;
  if (!account) {
    useAuthStore.setState({ status: 'signed-out', accountName: null, embedConfig: null });
    return;
  }
  useAuthStore.setState({ status: 'acquiring', accountName: account.name ?? account.username });
  try {
    const result = await msal.acquireTokenSilent({ scopes: PBI_SCOPES, account });
    useAuthStore.setState({ status: 'ready', embedConfig: buildConfig(result.accessToken), error: null });
    if (refreshTimer) clearTimeout(refreshTimer);
    if (result.expiresOn) {
      const refreshIn = Math.max(result.expiresOn.getTime() - Date.now() - 5 * 60 * 1000, 30_000);
      refreshTimer = setTimeout(() => void acquireToken(), refreshIn);
    }
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      // Only an interaction-required error justifies a redirect (the theme is persisted, nothing is lost).
      try {
        await msal.acquireTokenRedirect({ scopes: PBI_SCOPES, account });
        return;
      } catch (e2) {
        useAuthStore.setState({ status: 'error', error: (e2 as Error).message });
        return;
      }
    }
    useAuthStore.setState({ status: 'error', error: (e as Error).message });
  }
}

/** Create and initialise MSAL once. Safe to call multiple times. */
export function initializeAuth(): Promise<void> {
  if (!isEmbedConfigured) return Promise.resolve();
  if (initPromise) return initPromise;
  msal = new PublicClientApplication({
    auth: { clientId: embedEnv.clientId, authority: embedEnv.authority, redirectUri: embedEnv.redirectUri },
    cache: { cacheLocation: 'sessionStorage' },
  });
  const instance = msal;
  initPromise = (async () => {
    try {
      await instance.initialize();
      const redirect = await instance.handleRedirectPromise();
      if (redirect?.account) instance.setActiveAccount(redirect.account);
      else if (!instance.getActiveAccount() && instance.getAllAccounts()[0]) instance.setActiveAccount(instance.getAllAccounts()[0]!);
      await acquireToken();
    } catch (e) {
      useAuthStore.setState({ status: 'error', error: (e as Error).message });
    }
  })();
  return initPromise;
}
