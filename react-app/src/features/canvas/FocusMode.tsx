import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { useEffect } from 'react';
import { useAuthStore } from '@/embed/authStore';
import { PreviewHost } from '@/embed/PreviewHost';
import { useLiveAvailability } from '@/embed/useLiveAvailability';
import { useLocale, useT } from '@/i18n';
import { visualLabel } from '@/pbi/curation/labels';
import { useModifiedCount } from '@/store/selectors';
import { useUiStore, type PreviewMode } from '@/store/uiStore';
import { Badge, Button, SegmentedControl, Tooltip } from '@/ui';
import { VisualIcon } from '../visualGallery/icons';

const ZOOMS = [0, 0.5, 1, 1.5] as const;

/** Power BI "Fokusmodus": one visual on a full page, Vorschau | Live, zoom. */
export function FocusMode({ visualKey }: { visualKey: string }) {
  const t = useT();
  const locale = useLocale();
  const setFocusVisual = useUiStore((s) => s.setFocusVisual);
  const mode = useUiStore((s) => s.previewMode);
  const setMode = useUiStore((s) => s.setPreviewMode);
  const zoom = useUiStore((s) => s.focusZoom);
  const setZoom = useUiStore((s) => s.setFocusZoom);
  const live = useLiveAvailability(visualKey);
  const authError = useAuthStore((s) => s.error);
  const count = useModifiedCount(visualKey);
  const label = visualLabel(locale, visualKey);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement)) setFocusVisual(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setFocusVisual]);

  const liveReason = live.available ? null : live.reason;
  const liveTooltip = liveReason ? t(`preview.liveUnavailable.${liveReason}` as const, { error: authError ?? '' }) : t('preview.liveHint');
  const effectiveMode: PreviewMode = mode === 'live' && live.available ? 'live' : 'mock';

  return (
    <section aria-label={t('action.focusMode')} className="flex min-h-0 min-w-0 flex-1 flex-col bg-canvas" data-testid="focus-mode">
      <div className="flex min-h-11 shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border-subtle bg-surface-card px-2 py-1">
        <Button variant="ghost" size="sm" icon={<ArrowLeft />} onClick={() => setFocusVisual(null)} data-testid="focus-back">{t('action.back')}</Button>
        <div className="flex min-w-0 items-center gap-2">
          <VisualIcon visualKey={visualKey} size={16} className="shrink-0 text-text-muted" />
          <h2 className="truncate text-[13px] font-semibold text-text-primary">{label}</h2>
          {count > 0 && <Badge tone="brand">{count}</Badge>}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <SegmentedControl<PreviewMode>
            aria-label={t('pane.visualizations')}
            size="sm"
            value={effectiveMode}
            onValueChange={setMode}
            options={[
              { value: 'mock', label: t('preview.mock'), tooltip: t('preview.mockHint') },
              { value: 'live', label: t('preview.live'), disabled: !live.available, tooltip: liveTooltip },
            ]}
          />
          <SegmentedControl<string>
            aria-label={t('canvas.zoom')}
            size="sm"
            value={String(zoom)}
            onValueChange={(v) => setZoom(Number(v))}
            options={ZOOMS.map((z) => ({ value: String(z), label: z === 0 ? t('canvas.fitShort') : `${Math.round(z * 100)} %`, 'aria-label': z === 0 ? t('canvas.fit') : `${t('canvas.zoom')} ${Math.round(z * 100)} %` }))}
          />
          <Tooltip content={t('action.exitFocusMode')}>
            <Button variant="ghost" size="sm" aria-label={t('action.exitFocusMode')} onClick={() => setFocusVisual(null)}>
              {zoom ? <Minimize2 size={14} aria-hidden /> : <Maximize2 size={14} aria-hidden />}
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-5">
        <div className="mx-auto" style={zoom ? { width: 1280 * zoom, height: 720 * zoom } : { width: '100%', maxWidth: 'calc((100vh - 180px) * 16 / 9)', aspectRatio: '16 / 9' }}>
          <PreviewHost visualKey={visualKey} mode={effectiveMode} className="h-full w-full bg-surface-card shadow-md" />
        </div>
        {effectiveMode === 'mock' && <p className="mx-auto mt-3 max-w-[720px] text-center text-[12px] text-text-muted">{t('preview.mockHint')}</p>}
      </div>
    </section>
  );
}
