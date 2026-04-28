/**
 * MSAL Configuration for Power BI Embedded
 *
 * To configure:
 * 1. Register an app in Azure AD (Entra ID)
 * 2. Add redirect URI: http://localhost:5173 (dev) or your production URL
 * 3. Grant API permissions: Power BI Service > Report.Read.All
 * 4. Fill in the values below or use environment variables
 */

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || '',
    authority: import.meta.env.VITE_MSAL_AUTHORITY || 'https://login.microsoftonline.com/common',
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['https://analysis.windows.net/powerbi/api/.default'],
};

/**
 * Power BI Embed configuration
 * VITE_PBI_REPORT_ID   - The report GUID from Power BI Service
 * VITE_PBI_WORKSPACE_ID - The workspace (group) GUID
 */
export const pbiConfig = {
  reportId: import.meta.env.VITE_PBI_REPORT_ID || '',
  workspaceId: import.meta.env.VITE_PBI_WORKSPACE_ID || '',
};
