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

    _fetchPromise = (async () => {
      try {
        const resp = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });
        const token = resp.accessToken;
        console.log('PBI token scopes:', resp.scopes);
        console.log('PBI embed URL:', buildEmbedUrl());
        _cachedConfig = buildConfig(token);
        notify();
      } catch (e) {
        console.error('Token acquisition failed, trying redirect:', e);
        try {
          await instance.acquireTokenRedirect(loginRequest);
        } catch (e2) {
          setError(e2.message);
        }
      } finally {
        _fetchPromise = null;
      }
    })();
  }, [isAuthenticated, accounts, instance]);

  return {
    embedConfig,
    isReady: !!embedConfig,
    error,
    isAuthenticated,
  };
}
