/**
 * Live preview configuration (public VITE_* values; none of them are secrets).
 */
export const embedEnv = {
  clientId: import.meta.env.VITE_MSAL_CLIENT_ID ?? '',
  authority: import.meta.env.VITE_MSAL_AUTHORITY || 'https://login.microsoftonline.com/common',
  redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin + import.meta.env.BASE_URL : ''),
  reportId: import.meta.env.VITE_PBI_REPORT_ID ?? '',
  workspaceId: import.meta.env.VITE_PBI_WORKSPACE_ID ?? '',
};

/** Live preview needs an app registration AND a report to embed. */
export const isEmbedConfigured = Boolean(embedEnv.clientId && embedEnv.reportId);

export const PBI_SCOPES = ['https://analysis.windows.net/powerbi/api/Report.Read.All'];

export function buildEmbedUrl(): string {
  const base = `https://app.powerbi.com/reportEmbed?reportId=${encodeURIComponent(embedEnv.reportId)}`;
  return embedEnv.workspaceId ? `${base}&groupId=${encodeURIComponent(embedEnv.workspaceId)}` : base;
}
