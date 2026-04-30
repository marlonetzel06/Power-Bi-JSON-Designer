import { useState, useCallback } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest, pbiConfig } from '../config/msalConfig';

/**
 * Hook to acquire a Power BI access token and provide embed config.
 * Returns { getEmbedToken, embedConfig, isReady, error }
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

export default function usePbiEmbed() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [embedConfig, setEmbedConfig] = useState(null);
  const [error, setError] = useState(null);

  const getEmbedToken = useCallback(async () => {
    if (!isAuthenticated || !accounts.length) {
      setError('Not authenticated');
      return null;
    }
    try {
      const resp = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      const token = resp.accessToken;
      console.log('PBI token scopes:', resp.scopes);
      console.log('PBI embed URL:', buildEmbedUrl());
      const config = buildConfig(token);
      setEmbedConfig(config);
      setError(null);
      return config;
    } catch (e) {
      console.error('Token acquisition failed:', e);
      // If silent fails, use redirect
      try {
        await instance.acquireTokenRedirect(loginRequest);
      } catch (e2) {
        setError(e2.message);
      }
      return null;
    }
  }, [instance, accounts, isAuthenticated]);

  return {
    getEmbedToken,
    embedConfig,
    isReady: !!embedConfig,
    error,
    isAuthenticated,
  };
}
