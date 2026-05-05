import { useState, useEffect } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import PbiReportEmbed from '../PbiEmbed/PbiReportEmbed';
import usePbiEmbed from '../../hooks/usePbiEmbed';
import { Lock, AlertTriangle, KeyRound, Monitor } from 'lucide-react';

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
        <Lock size={28} className="text-[var(--text-muted)]" />
        <div className="text-sm font-semibold text-[var(--text-primary)]">Nicht angemeldet</div>
        <div className="text-[11px] text-[var(--text-muted)]">
          Melde dich über den <strong>Sign In</strong>-Button in der Toolbar an, um die Live-Preview zu laden.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)]">
        Loading report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-2">
        <AlertTriangle size={24} className="text-[var(--color-danger)]" />
        <div className="text-[11px] text-[var(--color-danger)]">{error}</div>
      </div>
    );
  }

  if (embedConfig) {
    return (
      <PbiReportEmbed
        embedConfig={embedConfig}
        className="w-full h-full rounded-[var(--radius-sm)] overflow-hidden"
      />
    );
  }

  return null;
}

function NoMsalMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-3">
      <KeyRound size={28} className="text-[var(--text-muted)]" />
      <div className="text-sm font-semibold text-[var(--text-primary)]">Azure AD nicht konfiguriert</div>
      <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
        Um die Live-Preview zu nutzen, konfiguriere die <code className="bg-[var(--bg-elevated)] px-1 rounded text-[10px]">.env.local</code> Datei mit deinen Azure AD Credentials:
      </div>
      <pre className="text-[10px] text-left bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-3 w-full overflow-x-auto text-[var(--text-secondary)]">
{`VITE_MSAL_CLIENT_ID=<client-id>
VITE_MSAL_AUTHORITY=https://login.../<tenant-id>
VITE_PBI_REPORT_ID=<report-id>
VITE_PBI_WORKSPACE_ID=<workspace-id>`}
      </pre>
      <div className="text-[10px] text-[var(--text-muted)]">Dann den Dev-Server neu starten.</div>
    </div>
  );
}

export default function PreviewPanel() {
  return (
    <div className="w-[520px] shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[var(--border-default)] shrink-0">
        <Monitor size={13} className="text-[var(--text-primary)]" />
        <span className="text-sm font-bold text-[var(--text-primary)]">
          Live Preview
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-2">
        {hasMsal ? <PreviewContent /> : <NoMsalMessage />}
      </div>
    </div>
  );
}
