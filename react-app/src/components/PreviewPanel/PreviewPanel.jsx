import { useState, useEffect } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import PbiReportEmbed from '../PbiEmbed/PbiReportEmbed';
import usePbiEmbed from '../../hooks/usePbiEmbed';

const hasMsal = !!import.meta.env.VITE_MSAL_CLIENT_ID;

function PreviewContent() {
  const isAuthenticated = useIsAuthenticated();
  const { getEmbedToken, embedConfig, error } = usePbiEmbed();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !embedConfig && !loading) {
      setLoading(true);
      getEmbedToken?.().finally(() => setLoading(false));
    }
  }, [isAuthenticated, embedConfig, loading, getEmbedToken]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
        <div className="text-3xl">🔒</div>
        <div className="text-[13px] font-semibold text-[#0f4c81] dark:text-[#89b4fa]">Nicht angemeldet</div>
        <div className="text-[11px] text-[#777] dark:text-[#505373]">
          Melde dich über den <strong>Sign In</strong>-Button in der Toolbar an, um die Live-Preview zu laden.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-[#999]">
        Loading report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-2">
        <div className="text-2xl">⚠️</div>
        <div className="text-[11px] text-[#d44]">{error}</div>
      </div>
    );
  }

  if (embedConfig) {
    return (
      <PbiReportEmbed
        embedConfig={embedConfig}
        className="w-full h-full rounded-md overflow-hidden"
      />
    );
  }

  return null;
}

function NoMsalMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
      <div className="text-3xl">🔑</div>
      <div className="text-[13px] font-semibold text-[#0f4c81] dark:text-[#89b4fa]">Azure AD nicht konfiguriert</div>
      <div className="text-[11px] text-[#777] dark:text-[#505373] leading-relaxed">
        Um die Live-Preview zu nutzen, konfiguriere die <code className="bg-[#f0f5fb] px-1 rounded text-[10px] dark:bg-[#24263e]">.env.local</code> Datei mit deinen Azure AD Credentials:
      </div>
      <pre className="text-[10px] text-left bg-[#f8fafd] border border-[#e6edf5] rounded-lg p-3 w-full overflow-x-auto dark:bg-[#24263e] dark:border-[#373963] dark:text-[#a9b1d6]">
{`VITE_MSAL_CLIENT_ID=<client-id>
VITE_MSAL_AUTHORITY=https://login.../<tenant-id>
VITE_PBI_REPORT_ID=<report-id>
VITE_PBI_WORKSPACE_ID=<workspace-id>`}
      </pre>
      <div className="text-[10px] text-[#999] dark:text-[#505373]">Dann den Dev-Server neu starten.</div>
    </div>
  );
}

export default function PreviewPanel({ onClose }) {
  return (
    <div className="w-[520px] shrink-0 border-l border-[#e0e6ed] bg-white flex flex-col dark:bg-[#1e2038] dark:border-[#2d3555]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e6edf5] shrink-0 dark:border-[#2d3555]">
        <span className="text-[13px] font-bold text-[#0f4c81] dark:text-[#89b4fa]">
          📊 Live Preview
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-[#f3f6fa] text-[#888] font-bold text-sm flex items-center justify-center cursor-pointer hover:bg-[#e8edf4] dark:bg-[#2d3055] dark:text-[#a9b1d6]"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-2">
        {hasMsal ? <PreviewContent /> : <NoMsalMessage />}
      </div>
    </div>
  );
}
