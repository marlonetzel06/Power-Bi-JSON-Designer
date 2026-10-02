import { useEffect, useRef } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import type { Report } from 'powerbi-client';
import { useAuthStore } from './authStore';
import { resolvePage } from './pageMap';
import { useExportTheme } from '@/store/selectors';

export interface LiveReportProps {
  visualKey: string;
  className?: string;
}

/**
 * The single live Power BI embed. Applies the theme (debounced) and switches to the
 * page that shows `visualKey`. Pages and their visual types are discovered once.
 */
export function LiveReport({ visualKey, className }: LiveReportProps) {
  const embedConfig = useAuthStore((s) => s.embedConfig);
  const pages = useAuthStore((s) => s.pages);
  const setPages = useAuthStore((s) => s.setPages);
  const setEmbedError = useAuthStore((s) => s.setEmbedError);
  const exportTheme = useExportTheme();
  const reportRef = useRef<Report | null>(null);
  const loadedRef = useRef(false);
  const pendingKeyRef = useRef(visualKey);
  const lastAppliedRef = useRef<string>('');

  // Discover pages → visual types once per report load.
  const discover = async (report: Report) => {
    try {
      const list = await report.getPages();
      const infos = await Promise.all(
        list.map(async (p) => {
          let visualTypes: string[] = [];
          try {
            visualTypes = (await p.getVisuals()).map((v) => v.type);
          } catch {
            /* page may not expose visuals */
          }
          return { name: p.name, displayName: p.displayName, visualTypes };
        }),
      );
      setPages(infos);
    } catch (e) {
      console.warn('Could not read report pages', e);
    }
  };

  const goToPage = async (key: string) => {
    const report = reportRef.current;
    if (!report || !loadedRef.current) return;
    const target = resolvePage(key, useAuthStore.getState().pages);
    if (!target) return;
    try {
      const current = await report.getActivePage();
      if (current?.name !== target.name) await report.setPage(target.name);
    } catch (e) {
      console.warn('Page switch failed', e);
    }
  };

  const applyTheme = async () => {
    const report = reportRef.current;
    if (!report || !loadedRef.current) return;
    const json = JSON.stringify(exportTheme);
    if (json === lastAppliedRef.current) return;
    lastAppliedRef.current = json;
    try {
      await report.applyTheme({ themeJson: exportTheme as unknown as Record<string, unknown> });
    } catch (e) {
      console.warn('applyTheme failed', e);
    }
  };

  // debounce theme application
  useEffect(() => {
    const t = setTimeout(() => void applyTheme(), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportTheme]);

  useEffect(() => {
    pendingKeyRef.current = visualKey;
    void goToPage(visualKey);
  }, [visualKey, pages.length]);

  // Latest callbacks for the embed events (registered once per report instance).
  const latest = useRef({ onLoaded: () => {}, onError: (_detail: unknown) => {} });
  useEffect(() => {
    latest.current = {
      onLoaded: () => {
        loadedRef.current = true;
        const report = reportRef.current;
        if (!report) return;
        void (async () => {
          await discover(report);
          await applyTheme();
          await goToPage(pendingKeyRef.current);
        })();
      },
      onError: (detail) => {
        const d = detail as { message?: string; detailedMessage?: string } | undefined;
        const msg = d?.detailedMessage || d?.message || 'Embed error';
        console.error('Power BI embed error', detail);
        setEmbedError(msg);
      },
    };
  });

  const attach = (report: Report) => {
    reportRef.current = report;
    loadedRef.current = false;
    report.off('loaded');
    report.off('error');
    report.on('loaded', () => latest.current.onLoaded());
    report.on('error', (event) => latest.current.onError((event as { detail?: unknown }).detail));
  };

  if (!embedConfig) return null;
  return (
    <PowerBIEmbed
      embedConfig={embedConfig}
      getEmbeddedComponent={(component) => attach(component as Report)}
      cssClassName={className ?? 'h-full w-full'}
    />
  );
}
