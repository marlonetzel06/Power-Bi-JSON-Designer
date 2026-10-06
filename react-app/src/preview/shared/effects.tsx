import type { ReactNode } from 'react';

/** Direction of the shadow/glow presets (lower-case keys; Power BI uses both casings). */
const PRESET_DIR: Record<string, [number, number]> = {
  bottomright: [1, 1], bottom: [0, 1], bottomleft: [-1, 1], centerright: [1, 0], center: [0, 0],
  centerleft: [-1, 0], topright: [1, -1], top: [0, -1], topleft: [-1, -1],
};

/** Offset of a shadow for a preset (or `custom` + angle) and a distance in px. */
export function shadowOffset(preset: string, distance: number, angle: number): [number, number] {
  const key = preset.toLowerCase();
  if (key === 'custom') {
    const rad = (angle * Math.PI) / 180;
    return [Math.cos(rad) * distance, Math.sin(rad) * distance];
  }
  const [dx, dy] = PRESET_DIR[key] ?? [1, 1];
  return [dx * distance, dy * distance];
}

export interface ShadowSpec {
  dx: number;
  dy: number;
  blur: number;
  spread: number;
  color: string;
  /** 0–1 */
  opacity: number;
  inner?: boolean;
  /** Paint only the shadow (the element carrying the filter is a stand-in for the shape, drawn separately). */
  shadowOnly?: boolean;
}

/**
 * One SVG filter for any number of Power BI shadows/glows on the same shape (a button may have a
 * shadow and a glow at once). Outer effects dilate the alpha by `spread` and blur it; inner ones
 * erode and invert the alpha and are clipped to the shape. Outer effects are painted below the
 * source, inner ones above it.
 */
export function effectsFilter(id: string, specs: readonly ShadowSpec[]): ReactNode {
  const chains: ReactNode[] = [];
  const outer: string[] = [];
  const inner: string[] = [];
  specs.forEach((spec, i) => {
    const std = Math.max(0, spec.blur) / 2;
    const spread = Math.max(0, spec.spread);
    const n = (name: string) => `${name}${i}`;
    if (spec.inner) {
      chains.push(
        <g key={i}>
          {spread > 0 ? <feMorphology in="SourceAlpha" operator="erode" radius={spread} result={n('alpha')} /> : <feOffset in="SourceAlpha" dx={0} dy={0} result={n('alpha')} />}
          <feComponentTransfer in={n('alpha')} result={n('inv')}><feFuncA type="table" tableValues="1 0" /></feComponentTransfer>
          <feGaussianBlur in={n('inv')} stdDeviation={std} result={n('blur')} />
          <feOffset in={n('blur')} dx={spec.dx} dy={spec.dy} result={n('off')} />
          <feFlood floodColor={spec.color} floodOpacity={spec.opacity} result={n('flood')} />
          <feComposite in={n('flood')} in2={n('off')} operator="in" result={n('shadow')} />
          <feComposite in={n('shadow')} in2="SourceAlpha" operator="in" result={n('fx')} />
        </g>,
      );
      inner.push(n('fx'));
    } else {
      chains.push(
        <g key={i}>
          {spread > 0 ? <feMorphology in="SourceAlpha" operator="dilate" radius={spread} result={n('alpha')} /> : <feOffset in="SourceAlpha" dx={0} dy={0} result={n('alpha')} />}
          <feGaussianBlur in={n('alpha')} stdDeviation={std} result={n('blur')} />
          <feOffset in={n('blur')} dx={spec.dx} dy={spec.dy} result={n('off')} />
          <feFlood floodColor={spec.color} floodOpacity={spec.opacity} result={n('flood')} />
          <feComposite in={n('flood')} in2={n('off')} operator="in" result={n('fx')} />
        </g>,
      );
      outer.push(n('fx'));
    }
  });
  const shadowOnly = specs.length > 0 && specs.every((s) => s.shadowOnly);
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      {chains}
      <feMerge>
        {outer.map((name) => <feMergeNode key={name} in={name} />)}
        {!shadowOnly && <feMergeNode in="SourceGraphic" />}
        {inner.map((name) => <feMergeNode key={name} in={name} />)}
      </feMerge>
    </filter>
  );
}

/** SVG filter for a single Power BI shadow or glow. */
export function shadowFilter(id: string, spec: ShadowSpec): ReactNode {
  return effectsFilter(id, [spec]);
}
