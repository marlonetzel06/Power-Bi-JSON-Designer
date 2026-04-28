import { useRef, useEffect, useCallback } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import useThemeStore from '../../store/themeStore';
import { buildExportTheme } from '../../utils/themeBuilder';

/**
 * Embeds a Power BI report and applies the current theme live.
 * Props:
 *   embedConfig - from usePbiEmbed hook
 *   className   - optional CSS class for the container
 */
export default function PbiReportEmbed({ embedConfig, className = '' }) {
  const reportRef = useRef(null);
  const { theme, pageSettings } = useThemeStore();

  const applyTheme = useCallback(async () => {
    const report = reportRef.current;
    if (!report) return;
    try {
      const themeJson = buildExportTheme(theme, pageSettings);
      await report.applyTheme({ themeJson });
    } catch (e) {
      console.warn('Theme apply failed:', e);
    }
  }, [theme, pageSettings]);

  // Re-apply theme whenever it changes
  useEffect(() => {
    if (reportRef.current) {
      const t = setTimeout(applyTheme, 300); // debounce
      return () => clearTimeout(t);
    }
  }, [applyTheme]);

  if (!embedConfig) {
    return (
      <div className={`flex items-center justify-center text-xs text-[#999] ${className}`}>
        Sign in to see live preview
      </div>
    );
  }

  return (
    <PowerBIEmbed
      embedConfig={embedConfig}
      eventHandlers={
        new Map([
          ['loaded', () => { applyTheme(); }],
          ['error', (event) => { console.error('PBI embed error:', event.detail); }],
        ])
      }
      getEmbeddedComponent={(report) => { reportRef.current = report; }}
      cssClassName={className || 'w-full h-full'}
    />
  );
}
