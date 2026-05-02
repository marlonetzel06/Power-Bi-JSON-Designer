import { useState, useRef, useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import { hexToHSL, hslToHex } from '../../utils/colorUtils';
import { Palette, Shuffle, X } from 'lucide-react';
import Button from '../ui/Button';

/* ── helpers ─────────────────────────────────────────────── */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const normH = (h) => ((h % 360) + 360) % 360;

/* ── harmony definitions ─────────────────────────────────── */
// Each slot: [anchorIndex, saturationDelta, lightnessTarget]
// anchorIndex → which of the harmony's anchor hues to use
// saturationDelta → offset from base saturation
// lightnessTarget → absolute lightness (clamped 18-85)
//
// Designed so the 8 colors span a wide lightness range (28-78)
// with varied saturation for professional, Canva-quality palettes.

const HARMONY_DEFS = {
  Analogous: {
    anchors: (h) => [h, h + 30, h - 30, h + 15, h - 15],
    slots: [
      [0, 'base'],
      [1,  -5, 32],
      [2,   5, 65],
      [3,  12, 25],
      [4, -12, 78],
      [1,  -8, 55],
      [2,   8, 40],
      [0, -18, 72],
    ],
  },
  Complementary: {
    anchors: (h) => [h, h + 180, h + 20, h + 200],
    slots: [
      [0, 'base'],
      [1,   0, 50],
      [0, -10, 28],
      [1, -10, 68],
      [2,   5, 55],
      [3,   5, 35],
      [0, -18, 78],
      [1, -15, 25],
    ],
  },
  Triadic: {
    anchors: (h) => [h, h + 120, h + 240],
    slots: [
      [0, 'base'],
      [1,   0, 48],
      [2,   0, 40],
      [0, -12, 72],
      [1, -10, 28],
      [2,   5, 65],
      [0, -18, 80],
      [1,   8, 33],
    ],
  },
  'Split-Compl.': {
    anchors: (h) => [h, h + 150, h + 210],
    slots: [
      [0, 'base'],
      [1,   0, 48],
      [2,   0, 40],
      [0, -10, 28],
      [1,   5, 68],
      [2,   5, 32],
      [0, -18, 75],
      [1,  -8, 55],
    ],
  },
  Monochromatic: {
    anchors: (h) => [h],
    mono: true,
  },
  Square: {
    anchors: (h) => [h, h + 90, h + 180, h + 270],
    slots: [
      [0, 'base'],
      [1,   0, 48],
      [2,   0, 42],
      [3,   0, 52],
      [0, -12, 72],
      [1, -10, 30],
      [2,   5, 73],
      [3,   8, 33],
    ],
  },
  Tetradic: {
    anchors: (h) => [h, h + 60, h + 180, h + 240],
    slots: [
      [0, 'base'],
      [1,   0, 48],
      [2,   0, 40],
      [3,   0, 55],
      [0, -12, 30],
      [1,   5, 70],
      [2, -10, 73],
      [3,   8, 33],
    ],
  },
  Random: {
    golden: true,
  },
};

/* ── palette generation ──────────────────────────────────── */
function generateMono(baseH, baseS, sJitter, lJitter) {
  // Evenly spread lightness from dark to light, slight saturation variation
  const levels = [25, 33, 41, 49, 57, 65, 73, 82];
  const sVar  = [0, 6, -6, 10, -10, 4, -4, 8];
  return levels.map((l, i) => {
    const s = clamp(baseS + sVar[i] + sJitter * (0.5 + (i % 3) * 0.2), 15, 92);
    const lf = clamp(l + lJitter * (0.4 + (i % 4) * 0.15), 18, 88);
    return hslToHex(baseH, s, lf);
  });
}

function generateGolden(baseH, baseS, sJitter, lJitter) {
  // Golden angle (137.508°) produces maximally-spaced hues
  const lights = [42, 52, 35, 62, 28, 72, 45, 58];
  const sVars  = [0, -8, 10, -15, 5, -20, 12, -5];
  return lights.map((l, i) => {
    const h = normH(baseH + i * 137.508);
    const s = clamp(baseS + sVars[i] + sJitter * (0.4 + (i % 3) * 0.3), 25, 90);
    const lf = clamp(l + lJitter * (0.4 + (i % 4) * 0.2), 20, 82);
    return hslToHex(h, s, lf);
  });
}

function generatePalette(config, baseH, baseS, baseL, sJitter, lJitter) {
  if (config.mono) return generateMono(baseH, baseS, sJitter, lJitter);
  if (config.golden) return generateGolden(baseH, baseS, sJitter, lJitter);

  const anchors = config.anchors(baseH);
  return config.slots.map(([ai, sOffOrBase, lTarget], i) => {
    // First slot marked 'base' → return the exact base color
    if (sOffOrBase === 'base') return hslToHex(baseH, baseS, baseL);
    const h = normH(anchors[ai]);
    const sV = sJitter * (0.6 + (i % 3) * 0.25);
    const lV = lJitter * (0.5 + ((i + 1) % 4) * 0.2);
    const s = clamp(baseS + sOffOrBase + sV, 20, 95);
    const l = clamp(lTarget + lV, 18, 85);
    return hslToHex(h, s, l);
  });
}

/* ── component ───────────────────────────────────────────── */
export default function PalettePopover() {
  const { theme, setDataColor } = useThemeStore();
  const [open, setOpen] = useState(false);
  const [baseColor, setBaseColor] = useState(theme.dataColors?.[0] || '#1F8AC0');
  const [rows, setRows] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (open) buildRows(baseColor);
  }, [open, baseColor]);

  useEffect(() => {
    function outside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('click', outside, true);
    return () => document.removeEventListener('click', outside, true);
  }, [open]);

  function buildRows(hex, sJ = 0, lJ = 0) {
    const [h, s, l] = hexToHSL(hex);
    const r = Object.entries(HARMONY_DEFS).map(([name, config]) => ({
      name,
      colors: generatePalette(config, h, s, l, sJ, lJ),
    }));
    setRows(r);
  }

  function shuffle() {
    const sJ = (Math.random() - 0.5) * 36;   // ±18 saturation jitter
    const lJ = (Math.random() - 0.5) * 28;   // ±14 lightness jitter
    buildRows(baseColor, sJ, lJ);
  }

  function applyHarmony(colors) {
    colors.forEach((c, i) => setDataColor(i, c.toUpperCase()));
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative inline-block">
      <Button
        onClick={() => { setBaseColor(theme.dataColors?.[0] || '#1F8AC0'); setOpen(!open); }}
        variant="secondary"
        size="sm"
        title="Generate color harmony"
      >
        <Palette size={13} />
        Palette
      </Button>
      {open && (
        <div className="absolute z-[500] top-full left-0 mt-1.5 bg-white border border-[#d0dce8] rounded-[10px] p-3.5 w-[370px] shadow-lg dark:bg-[#24263e] dark:border-[#373963] dark:shadow-[0_6px_24px_rgba(0,0,0,.5)]">
          <h4 className="text-xs font-bold text-[#0f4c81] mb-2.5 pb-2 border-b border-[#e6edf5] flex items-center justify-between dark:text-[#89b4fa] dark:border-b-[#373963]">
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="19.5" cy="10.5" r="1.5"/><circle cx="13.5" cy="17.5" r="1.5"/><circle cx="8.5" cy="13.5" r="1.5"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
              Palette &nbsp;<span className="font-normal text-[11px] text-[#aaa]">Base:</span>
            </span>
            <span className="flex items-center gap-2">
              <input
                type="color"
                value={baseColor.toLowerCase()}
                onChange={(e) => setBaseColor(e.target.value)}
                className="w-7 h-7 border-[1.5px] border-[#c8d8e8] rounded cursor-pointer dark:border-[#373963]"
              />
              <button
                onClick={() => setOpen(false)}
                className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-default)] transition-colors leading-none"
              >
                <X size={14} />
              </button>
            </span>
          </h4>

          {rows.map(row => (
            <div key={row.name} className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] text-[#666] w-[90px] shrink-0 dark:text-[#7982a9]">{row.name}</span>
              <div className="flex gap-0.5 flex-1 min-w-0">
                {row.colors.map((c, i) => (
                  <div
                    key={i}
                    className="w-[28px] h-[28px] rounded-[4px] border border-black/[.08] shrink-0 transition-transform hover:scale-110 hover:z-10"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
              <button
                onClick={() => applyHarmony(row.colors)}
                className="text-[10px] px-2 py-0.5 rounded border border-[#c8d8e8] bg-[#f0f5fb] text-[#0f4c81] cursor-pointer whitespace-nowrap shrink-0 hover:bg-[#dceefa] hover:border-[#1f8ac0] dark:bg-[#2d3055] dark:border-[#373963] dark:text-[#89b4fa]"
              >
                Apply
              </button>
            </div>
          ))}

          <div className="flex justify-end mt-2.5 pt-2 border-t border-[var(--border-default)]">
            <Button onClick={shuffle} variant="secondary" size="sm">
              <Shuffle size={13} />
              Shuffle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
