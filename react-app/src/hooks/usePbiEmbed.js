import { useState, useCallback, useEffect, useRef } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest, pbiConfig } from '../config/msalConfig';

/**
 * Hook to acquire a Power BI access token and provide embed config.
 * Uses module-level cache so all components share the same config.
 */
function buildEmbedUrl() {
  const base = `https://app.powerbi.com/reportEmbed?reportId=${pbiConfig.reportId}`;
  return pbiConfig.workspaceId ? `${base}&groupId=${pbiConfig.workspaceId}` : base;
}

function buildConfig(token) {
  return {
    type: 'report',
    id: pbiConfig.reportId,
    embedUrl: buildEmbedUrl(),
    accessToken: token,
    tokenType: 0, // 0 = Aad (User Owns Data), 1 = Embed (App Owns Data)
    settings: {
      panes: { filters: { visible: false }, pageNavigation: { visible: true } },
      background: 1, // Transparent
    },
  };
}

// Module-level shared state
let _cachedConfig = null;
let _fetchPromise = null;
let _tokenExpiresAt = 0;
let _refreshTimer = null;
const _listeners = new Set();

function notify() {
  _listeners.forEach(fn => fn(_cachedConfig));
}

export default function usePbiEmbed() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [embedConfig, setEmbedConfig] = useState(_cachedConfig);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  // Subscribe to shared config updates
  useEffect(() => {
    const listener = (config) => setEmbedConfig(config);
    _listeners.add(listener);
    // Sync in case it was set before mount
    if (_cachedConfig) setEmbedConfig(_cachedConfig);
    return () => _listeners.delete(listener);
  }, []);

  // Auto-fetch token when authenticated
  useEffect(() => {
    if (!isAuthenticated || !accounts.length || _cachedConfig || _fetchPromise || fetchedRef.current) return;
    fetchedRef.current = true;

    const acquireToken = async () => {
      try {
        const resp = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });
        const token = resp.accessToken;
        _cachedConfig = buildConfig(token);
        // Schedule refresh 5 minutes before expiry
        if (resp.expiresOn) {
          _tokenExpiresAt = resp.expiresOn.getTime();
          const refreshIn = Math.max((_tokenExpiresAt - Date.now()) - 5 * 60 * 1000, 30000);
          clearTimeout(_refreshTimer);
          _refreshTimer = setTimeout(() => {
            _cachedConfig = null;
            fetchedRef.current = false;
            acquireToken();
          }, refreshIn);
        }
        notify();
      } catch (e) {
        if (import.meta.env.DEV) console.error('Token acquisition failed, trying redirect:', e);
        try {
          await instance.acquireTokenRedirect(loginRequest);
        } catch (e2) {
          setError(e2.message);
        }
      } finally {
        _fetchPromise = null;
      }
    };

    _fetchPromise = acquireToken();
  }, [isAuthenticated, accounts, instance]);

  return {
    embedConfig,
    isReady: !!embedConfig,
    error,
    isAuthenticated,
  };
}
