import type { ReactNode } from 'react';
import type { Resolver } from '../resolver';
import { effectsFilter, shadowOffset, type ShadowSpec } from './effects';
import type { CornerRadii } from './shapes';

/** Corner radii of the card visual / button slicer tiles (layout card or shapeCustomRectangle). */
export function cornerRadii(r: Resolver, card: 'layout' | 'shapeCustomRectangle', fallback: number): { radius: number; radii?: CornerRadii } {
  const radius = r.num(card, 'rectangleRoundedCurve', fallback);
  if (r.hasProp(card, 'rectangleRoundedCurveCustomStyle') && r.bool(card, 'rectangleRoundedCurveCustomStyle', false)) {
    return {
      radius,
      radii: {
        lt: r.num(card, 'rectangleRoundedCurveLeftTop', radius),
        rt: r.num(card, 'rectangleRoundedCurveRightTop', radius),
        lb: r.num(card, 'rectangleRoundedCurveLeftBottom', radius),
        rb: r.num(card, 'rectangleRoundedCurveRightBottom', radius),
      },
    };
  }
  return { radius };
}

/** Shadow/glow of the card visual and button slicer (shadowCustom / glowCustom cards). */
export function customEffects(r: Resolver, uid: string): { defs: ReactNode; filter: string | undefined } {
  const specs: ShadowSpec[] = [];
  if (r.hasCard('shadowCustom') && r.bool('shadowCustom', 'show', false)) {
    const [dx, dy] = shadowOffset(r.str('shadowCustom', 'shadowPositionPreset', 'bottomRight'), r.num('shadowCustom', 'shadowDistance', 2), r.num('shadowCustom', 'angle', 45));
    specs.push({ dx, dy, blur: r.num('shadowCustom', 'shadowBlur', 4), spread: r.num('shadowCustom', 'shadowSpread', 0), color: r.color('shadowCustom', 'color', '#000000'), opacity: 1 - r.num('shadowCustom', 'transparency', 60) / 100, inner: r.str('shadowCustom', 'position', 'Outer') === 'Inner' });
  }
  if (r.hasCard('glowCustom') && r.bool('glowCustom', 'show', false)) {
    const [dx, dy] = shadowOffset(r.str('glowCustom', 'glowPositionPreset', 'center'), r.num('glowCustom', 'glowDistance', 0), r.num('glowCustom', 'angle', 0));
    specs.push({ dx, dy, blur: r.num('glowCustom', 'shadowBlur', 4) * 2, spread: r.num('glowCustom', 'glowSpread', 0), color: r.color('glowCustom', 'color', r.dataColor(0)), opacity: 1 - r.num('glowCustom', 'transparency', 60) / 100, inner: r.str('glowCustom', 'position', 'Outer') === 'Inner' });
  }
  // shadow and glow share one filter, so both show when both are on
  const id = `${uid}-fx`;
  return { defs: specs.length ? <defs>{effectsFilter(id, specs)}</defs> : null, filter: specs.length ? `url(#${id})` : undefined };
}

