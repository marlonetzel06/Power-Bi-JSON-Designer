/**
 * MSAL state machine with a simulated PublicClientApplication (no network, no redirects).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const msalMock = vi.hoisted(() => {
  const state = {
    accounts: [] as { name?: string; username: string; homeAccountId: string }[],
    active: null as { name?: string; username: string; homeAccountId: string } | null,
    redirectResult: null as { account: { name?: string; username: string; homeAccountId: string } } | null,
    silent: vi.fn(),
    loginRedirect: vi.fn(),
    logoutRedirect: vi.fn(),
    acquireTokenRedirect: vi.fn(),
    initialize: vi.fn(async () => {}),
  };
  class InteractionRequiredAuthError extends Error {}
  class PublicClientApplication {
    initialize = state.initialize;
    handleRedirectPromise = async () => state.redirectResult;
    getActiveAccount = () => state.active;
    setActiveAccount = (a: typeof state.active) => { state.active = a; };
    getAllAccounts = () => state.accounts;
    acquireTokenSilent = state.silent;
    loginRedirect = state.loginRedirect;
    logoutRedirect = state.logoutRedirect;
    acquireTokenRedirect = state.acquireTokenRedirect;
  }
  return { state, InteractionRequiredAuthError, PublicClientApplication };
});

vi.mock('@azure/msal-browser', () => ({ PublicClientApplication: msalMock.PublicClientApplication, InteractionRequiredAuthError: msalMock.InteractionRequiredAuthError }));
vi.mock('./config', () => ({
  embedEnv: { clientId: 'client', authority: 'https://login.microsoftonline.com/common', redirectUri: 'http://localhost', reportId: 'report', workspaceId: 'ws' },
  isEmbedConfigured: true,
  PBI_SCOPES: ['scope'],
  buildEmbedUrl: () => 'https://app.powerbi.com/reportEmbed?reportId=report',
}));

const account = { name: 'Max Mustermann', username: 'max@example.com', homeAccountId: 'h1' };

async function freshStore() {
  vi.resetModules();
  const mod = await import('./authStore');
  return mod;
}

beforeEach(() => {
  msalMock.state.accounts = [];
  msalMock.state.active = null;
  msalMock.state.redirectResult = null;
  msalMock.state.silent.mockReset();
  msalMock.state.loginRedirect.mockReset();
  msalMock.state.logoutRedirect.mockReset();
  msalMock.state.acquireTokenRedirect.mockReset();
  vi.useRealTimers();
});

describe('auth state machine', () => {
  it('ends signed-out when no account is cached', async () => {
    const { initializeAuth, useAuthStore } = await freshStore();
    expect(useAuthStore.getState().status).toBe('initializing');
    await initializeAuth();
    expect(useAuthStore.getState().status).toBe('signed-out');
    expect(useAuthStore.getState().embedConfig).toBeNull();
  });

  it('acquires a token silently for a cached account and builds the embed config', async () => {
    msalMock.state.accounts = [account];
    msalMock.state.silent.mockResolvedValue({ accessToken: 'tok', expiresOn: new Date(Date.now() + 3600_000) });
    const { initializeAuth, useAuthStore } = await freshStore();
    await initializeAuth();
    const s = useAuthStore.getState();
    expect(s.status).toBe('ready');
    expect(s.accountName).toBe('Max Mustermann');
    expect(s.embedConfig?.accessToken).toBe('tok');
    expect(s.embedConfig?.id).toBe('report');
    expect(msalMock.state.silent).toHaveBeenCalledTimes(1);
  });

  it('uses the account from a redirect result', async () => {
    msalMock.state.redirectResult = { account };
    msalMock.state.silent.mockResolvedValue({ accessToken: 'tok2', expiresOn: null });
    const { initializeAuth, useAuthStore } = await freshStore();
    await initializeAuth();
    expect(useAuthStore.getState().status).toBe('ready');
    expect(msalMock.state.active).toEqual(account);
  });

  it('redirects only on InteractionRequiredAuthError', async () => {
    msalMock.state.accounts = [account];
    msalMock.state.silent.mockRejectedValue(new msalMock.InteractionRequiredAuthError('interaction_required'));
    msalMock.state.acquireTokenRedirect.mockResolvedValue(undefined);
    const { initializeAuth } = await freshStore();
    await initializeAuth();
    expect(msalMock.state.acquireTokenRedirect).toHaveBeenCalledTimes(1);
  });

  it('reports other token errors as error state and recovers on retry', async () => {
    msalMock.state.accounts = [account];
    msalMock.state.silent.mockRejectedValueOnce(new Error('network down')).mockResolvedValueOnce({ accessToken: 'tok3', expiresOn: null });
    const { initializeAuth, useAuthStore } = await freshStore();
    await initializeAuth();
    expect(useAuthStore.getState().status).toBe('error');
    expect(useAuthStore.getState().error).toBe('network down');
    expect(msalMock.state.acquireTokenRedirect).not.toHaveBeenCalled();
    await useAuthStore.getState().retry();
    expect(useAuthStore.getState().status).toBe('ready');
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('refreshes the token five minutes before expiry', async () => {
    vi.useFakeTimers();
    msalMock.state.accounts = [account];
    msalMock.state.silent.mockResolvedValue({ accessToken: 'tok', expiresOn: new Date(Date.now() + 10 * 60_000) });
    const { initializeAuth } = await freshStore();
    await initializeAuth();
    expect(msalMock.state.silent).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5 * 60_000 + 10);
    expect(msalMock.state.silent).toHaveBeenCalledTimes(2);
  });

  it('signIn and signOut go through MSAL redirects; initialization failure is surfaced', async () => {
    msalMock.state.loginRedirect.mockResolvedValue(undefined);
    msalMock.state.logoutRedirect.mockResolvedValue(undefined);
    const { initializeAuth, useAuthStore } = await freshStore();
    await initializeAuth();
    await useAuthStore.getState().signIn();
    expect(msalMock.state.loginRedirect).toHaveBeenCalledWith({ scopes: ['scope'] });
    await useAuthStore.getState().signOut();
    expect(msalMock.state.logoutRedirect).toHaveBeenCalled();
    useAuthStore.getState().setEmbedError('embed failed');
    expect(useAuthStore.getState().status).toBe('error');
  });
});
