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
 * SVG filter for a Power BI shadow or glow. Outer shadows use feDropShadow (spread via
 * feMorphology); inner shadows invert the alpha and composite back onto the source.
 */
export function shadowFilter(id: string, spec: ShadowSpec): ReactNode {
  const std = Math.max(0, spec.blur) / 2;
  const spread = Math.max(0, spec.spread);
  if (spec.inner) {
    // spread grows the shadow inwards: erode the alpha before inverting it
    return (
      <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
        {spread > 0 ? <feMorphology in="SourceAlpha" operator="erode" radius={spread} result="alpha" /> : <feOffset in="SourceAlpha" dx={0} dy={0} result="alpha" />}
        <feComponentTransfer in="alpha" result="inv"><feFuncA type="table" tableValues="1 0" /></feComponentTransfer>
        <feGaussianBlur in="inv" stdDeviation={std} result="blur" />
        <feOffset in="blur" dx={spec.dx} dy={spec.dy} result="off" />
        <feFlood floodColor={spec.color} floodOpacity={spec.opacity} result="flood" />
        <feComposite in="flood" in2="off" operator="in" result="shadow" />
        <feComposite in="shadow" in2="SourceAlpha" operator="in" result="clipped" />
        {spec.shadowOnly ? <feMerge><feMergeNode in="clipped" /></feMerge> : <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="clipped" /></feMerge>}
      </filter>
    );
  }
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      {spread > 0 ? <feMorphology in="SourceAlpha" operator="dilate" radius={spread} result="alpha" /> : <feOffset in="SourceAlpha" dx={0} dy={0} result="alpha" />}
      <feGaussianBlur in="alpha" stdDeviation={std} result="blur" />
      <feOffset in="blur" dx={spec.dx} dy={spec.dy} result="off" />
      <feFlood floodColor={spec.color} floodOpacity={spec.opacity} result="flood" />
      <feComposite in="flood" in2="off" operator="in" result="shadow" />
      {spec.shadowOnly ? <feMerge><feMergeNode in="shadow" /></feMerge> : <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>}
    </filter>
  );
}
