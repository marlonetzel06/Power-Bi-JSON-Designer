/** Colour helpers for the UI (hex ⇄ HSL, shades, alpha). Pure, no DOM. */
export const HEX6 = /^#[0-9a-fA-F]{6}$/;
export const HEX_ANY = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Normalise user input to `#RRGGBB` (or `#RRGGBBAA`); returns null when not a colour. */
export function normalizeHex(input: string): string | null {
  let s = input.trim();
  if (!s) return null;
  if (!s.startsWith('#')) s = `#${s}`;
  if (!HEX_ANY.test(s)) return null;
  if (s.length === 4) s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  return s.toUpperCase();
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex) ?? '#000000';
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

export function hexToHsl(hex: string): [number, number, number] {
  const [r0, g0, b0] = hexToRgb(hex);
  const r = r0 / 255, g = g0 / 255, b = b0 / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToHex(h: number, s: number, l: number): string {
  const sat = clamp(s, 0, 100) / 100;
  const lig = clamp(l, 0, 100) / 100;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = lig - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/** Power BI colour picker style shades: 5 variants from lighter to darker. */
export function shadesOf(hex: string): string[] {
  const [h, s, l] = hexToHsl(hex);
  return [60, 40, 20, -20, -40].map((d) => hslToHex(h, s, clamp(l + d, 4, 96)));
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Readable text colour (black/white) for a given background. */
export function onColor(hex: string): string {
  return relativeLuminance(hex) > 0.4 ? '#000000' : '#FFFFFF';
}
