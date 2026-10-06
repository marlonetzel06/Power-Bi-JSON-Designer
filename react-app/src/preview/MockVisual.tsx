import { memo, useId, useMemo } from 'react';
import { CartesianChart } from './cartesian/CartesianChart';
import { PagePreview } from './PagePreview';
import { getRenderer } from './registry';
import { mockVisualSize } from './size';
import { createResolver } from './resolver';
import { VisualFrame } from './VisualFrame';
import { GLOBAL_KEY, PAGE_KEY, type ReportTheme } from '@/pbi/types';
import { visualThemeEqual } from './themeSlice';

export interface MockVisualProps {
  theme: ReportTheme;
  visualKey: string;
  /** Design size in px (defaults to the renderer's natural size). The SVG scales to its container. */
  width?: number;
  height?: number;
  className?: string;
  /** Static preview: no pointer events, decorative. */
  decorative?: boolean;
  title?: string;
  /** `$id` state to render (buttons: hover/selected/disabled, slicers: selected tile …). */
  stateId?: string;
}


/**
 * Theme-driven SVG mock of a Power BI visual. Pure function of (theme, visualKey, size).
 */
export const MockVisual = memo(function MockVisual({ theme, visualKey, width, height, className, decorative = true, title, stateId }: MockVisualProps) {
  const uid = useId().replace(/:/g, '');
  const size = mockVisualSize(visualKey);
  const w = width ?? size.width;
  const h = height ?? size.height;
  const r = useMemo(() => createResolver(theme, visualKey, { stateId }), [theme, visualKey, stateId]);
  const entry = getRenderer(visualKey);
  const label = title ?? entry?.title ?? visualKey;

  let content;
  if (visualKey === PAGE_KEY) {
    content = <PagePreview r={r} width={w} height={h} />;
  } else if (visualKey === GLOBAL_KEY) {
    // "All visuals": the container defaults applied to a representative chart.
    content = (
      <VisualFrame r={r} width={w} height={h} uid={uid} defaultTitle="Alle Visuals (Standardformat)">
        {(rect) => <CartesianChart r={r} rect={rect} uid={uid} options={{ variant: 'column', stack: 'none', series: 2 }} />}
      </VisualFrame>
    );
  } else if (entry) {
    content = (
      <VisualFrame r={r} width={w} height={h} uid={uid} defaultTitle={entry.title} suppressTitle={entry.suppressTitle}>
        {(rect) => entry.body({ r, rect, uid })}
      </VisualFrame>
    );
  } else {
    content = (
      <g>
        <rect x={0} y={0} width={w} height={h} fill={r.structural.third} />
        <text x={w / 2} y={h / 2} textAnchor="middle" fontSize={12} fill={r.structural.second}>{visualKey}</text>
      </g>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      data-visual={visualKey}
      data-state={stateId}
      style={{ display: 'block', pointerEvents: decorative ? 'none' : undefined }}
    >
      {content}
    </svg>
  );
}, (prev, next) =>
  prev.visualKey === next.visualKey &&
  prev.width === next.width &&
  prev.height === next.height &&
  prev.className === next.className &&
  prev.decorative === next.decorative &&
  prev.title === next.title &&
  prev.stateId === next.stateId &&
  visualThemeEqual(prev.theme, next.theme, next.visualKey));
