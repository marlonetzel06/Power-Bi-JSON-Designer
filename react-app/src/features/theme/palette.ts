/** Palette generator: colour harmonies around a base colour (ported from the legacy popover). */
import { hexToHsl, hslToHex } from '@/lib/color';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const normH = (h: number) => ((h % 360) + 360) % 360;

type Slot = [anchor: number, satDelta: number | 'base', light?: number];
interface Harmony {
  anchors?: (h: number) => number[];
  slots?: Slot[];
  mono?: boolean;
  golden?: boolean;
}

export const HARMONIES: Record<string, Harmony> = {
  analogous: { anchors: (h) => [h, h + 30, h - 30, h + 15, h - 15], slots: [[0, 'base'], [1, -5, 32], [2, 5, 65], [3, 12, 25], [4, -12, 78], [1, -8, 55], [2, 8, 40], [0, -18, 72]] },
  complementary: { anchors: (h) => [h, h + 180, h + 20, h + 200], slots: [[0, 'base'], [1, 0, 50], [0, -10, 28], [1, -10, 68], [2, 5, 55], [3, 5, 35], [0, -18, 78], [1, -15, 25]] },
  triadic: { anchors: (h) => [h, h + 120, h + 240], slots: [[0, 'base'], [1, 0, 48], [2, 0, 40], [0, -12, 72], [1, -10, 28], [2, 5, 65], [0, -18, 80], [1, 8, 33]] },
  split: { anchors: (h) => [h, h + 150, h + 210], slots: [[0, 'base'], [1, 0, 48], [2, 0, 40], [0, -10, 28], [1, 5, 68], [2, 5, 32], [0, -18, 75], [1, -8, 55]] },
  monochromatic: { mono: true },
  square: { anchors: (h) => [h, h + 90, h + 180, h + 270], slots: [[0, 'base'], [1, 0, 48], [2, 0, 42], [3, 0, 52], [0, -12, 72], [1, -10, 30], [2, 5, 73], [3, 8, 33]] },
  golden: { golden: true },
};

export const HARMONY_LABELS: Record<string, { de: string; en: string }> = {
  analogous: { de: 'Analog', en: 'Analogous' },
  complementary: { de: 'Komplementär', en: 'Complementary' },
  triadic: { de: 'Triade', en: 'Triadic' },
  split: { de: 'Teilkomplementär', en: 'Split complementary' },
  monochromatic: { de: 'Monochrom', en: 'Monochromatic' },
  square: { de: 'Quadrat', en: 'Square' },
  golden: { de: 'Goldener Winkel', en: 'Golden angle' },
};

export function generatePalette(harmony: string, baseHex: string, count = 8, sJitter = 0, lJitter = 0): string[] {
  const cfg = HARMONIES[harmony] ?? HARMONIES.analogous!;
  const [h, s, l] = hexToHsl(baseHex);
  let out: string[];
  if (cfg.mono) {
    const levels = [25, 33, 41, 49, 57, 65, 73, 82];
    const sVar = [0, 6, -6, 10, -10, 4, -4, 8];
    out = levels.map((lv, i) => hslToHex(h, clamp(s + (sVar[i] ?? 0) + sJitter * (0.5 + (i % 3) * 0.2), 15, 92), clamp(lv + lJitter * (0.4 + (i % 4) * 0.15), 18, 88)));
  } else if (cfg.golden) {
    const lights = [42, 52, 35, 62, 28, 72, 45, 58];
    const sVars = [0, -8, 10, -15, 5, -20, 12, -5];
    out = lights.map((lv, i) => hslToHex(normH(h + i * 137.508), clamp(s + (sVars[i] ?? 0) + sJitter * (0.4 + (i % 3) * 0.3), 25, 90), clamp(lv + lJitter * (0.4 + (i % 4) * 0.2), 20, 82)));
  } else {
    const anchors = cfg.anchors!(h);
    out = cfg.slots!.map(([ai, sOff, lTarget], i) => {
      if (sOff === 'base') return hslToHex(h, s, l);
      const sV = sJitter * (0.6 + (i % 3) * 0.25);
      const lV = lJitter * (0.5 + ((i + 1) % 4) * 0.2);
      return hslToHex(normH(anchors[ai] ?? h), clamp(s + sOff + sV, 20, 95), clamp((lTarget ?? 50) + lV, 18, 85));
    });
  }
  // Fit to the requested count: repeat with lightness shift when more are needed.
  while (out.length < count) {
    const src = out[out.length % 8] ?? baseHex;
    const [hh, ss, ll] = hexToHsl(src);
    out.push(hslToHex(hh, ss, clamp(ll + (out.length % 2 ? 14 : -14), 15, 88)));
  }
  return out.slice(0, count);
}
