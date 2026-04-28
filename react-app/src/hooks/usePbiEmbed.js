import { useState, useCallback } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest, pbiConfig } from '../config/msalConfig';

/**
 * Hook to acquire a Power BI access token and provide embed config.
 * Returns { getEmbedToken, embedConfig, isReady, error }
 */
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
      const config = {
        type: 'report',
        id: pbiConfig.reportId,
        embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${pbiConfig.reportId}&groupId=${pbiConfig.workspaceId}`,
        accessToken: token,
        tokenType: 1, // Aad
        settings: {
          panes: { filters: { visible: false }, pageNavigation: { visible: false } },
          background: 1, // Transparent
        },
      };
      setEmbedConfig(config);
      setError(null);
      return config;
    } catch (e) {
      // If silent fails, try popup
      try {
        const resp = await instance.acquireTokenPopup(loginRequest);
        const token = resp.accessToken;
        const config = {
          type: 'report',
          id: pbiConfig.reportId,
          embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${pbiConfig.reportId}&groupId=${pbiConfig.workspaceId}`,
          accessToken: token,
          tokenType: 1,
          settings: {
            panes: { filters: { visible: false }, pageNavigation: { visible: false } },
            background: 1,
          },
        };
        setEmbedConfig(config);
        setError(null);
        return config;
      } catch (e2) {
        setError(e2.message);
        return null;
      }
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
