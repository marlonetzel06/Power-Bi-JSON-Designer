/** No renderer may emit NaN/undefined attribute values at any size (they surface as browser console errors). */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MockVisual } from './MockVisual';
import { THEME_INITIAL } from '@/pbi/defaults';
import { VISUAL_KEYS } from '@/pbi/curation/selection';

describe('renderer attribute sanity', () => {
  it.each([...VISUAL_KEYS, '*', 'page'])('%s has no NaN or undefined attributes at common sizes', (key) => {
    const bad: string[] = [];
    for (const [w, h] of [[600, 400], [240, 150], [220, 80], [1280, 720]] as const) {
      const c = render(<MockVisual theme={THEME_INITIAL} visualKey={key} width={w} height={h} />).container;
      for (const el of c.querySelectorAll('*')) for (const a of el.getAttributeNames()) if (/NaN|undefined/.test(el.getAttribute(a) ?? '')) bad.push(`${w}x${h} <${el.tagName}> ${a}=${el.getAttribute(a)}`);
    }
    expect(bad).toEqual([]);
  });
});
