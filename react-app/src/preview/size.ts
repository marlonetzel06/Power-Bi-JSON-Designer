import { GLOBAL_KEY, PAGE_KEY } from '@/pbi/types';
import { getRenderer } from './registry';

/** Natural design size of a visual on a 1280×720 page. */
export function mockVisualSize(visualKey: string): { width: number; height: number } {
  if (visualKey === PAGE_KEY) return { width: 640, height: 360 };
  if (visualKey === GLOBAL_KEY) return { width: 480, height: 300 };
  return getRenderer(visualKey)?.size ?? { width: 480, height: 300 };
}
