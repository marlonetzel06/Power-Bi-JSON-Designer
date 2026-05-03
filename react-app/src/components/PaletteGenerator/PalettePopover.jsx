import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useThemeStore from '../../store/themeStore';
import { hexToHSL, hslToHex } from '../../utils/colorUtils';
import { Palette, Shuffle, X, Lock, Unlock, Undo2, Plus, Minus } from 'lucide-react';
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

/* ── Mini Bar Preview ─────────────────────────────────────── */
function MiniBarPreview({ colors }) {
  const total = colors.length;
  return (
    <div className="flex items-end gap-[2px] h-[32px]" title="Preview">
      {colors.map((c, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-[2px]"
          style={{ background: c, height: `${30 + Math.sin(i * 1.2) * 40 + 30}%` }}
        />
      ))}
    </div>
  );
}

/* ── component ───────────────────────────────────────────── */
export default function PalettePopover() {
  const { theme, setDataColor, setDataColors, addDataColor, removeDataColor } = useThemeStore();
  const [open, setOpen] = useState(false);
  const [baseColor, setBaseColor] = useState(theme.dataColors?.[0] || '#29b4aa');
  const [rows, setRows] = useState([]);
  const [locked, setLocked] = useState([]); // indices of locked colors
  const [prevColors, setPrevColors] = useState(null); // for undo
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const popRef = useRef(null);

  const colorCount = theme.dataColors?.length || 8;

  useEffect(() => {
    if (open) buildRows(baseColor);
  }, [open, baseColor]);

  useEffect(() => {
    function outside(e) {
      if (
        wrapRef.current && !wrapRef.current.contains(e.target) &&
        popRef.current && !popRef.current.contains(e.target)
      ) setOpen(false);
    }
    if (open) document.addEventListener('click', outside, true);
    return () => document.removeEventListener('click', outside, true);
  }, [open]);

  function buildRows(hex, sJ = 0, lJ = 0) {
    const [h, s, l] = hexToHSL(hex);
    const r = Object.entries(HARMONY_DEFS).map(([name, config]) => {
      let colors = generatePalette(config, h, s, l, sJ, lJ);
      // Adjust to current color count
      if (colors.length < colorCount) {
        // Extend by interpolation
        while (colors.length < colorCount) colors.push(colors[colors.length - 1]);
      } else if (colors.length > colorCount) {
        colors = colors.slice(0, colorCount);
      }
      return { name, colors };
    });
    setRows(r);
  }

  function shuffle() {
    const sJ = (Math.random() - 0.5) * 36;
    const lJ = (Math.random() - 0.5) * 28;
    buildRows(baseColor, sJ, lJ);
  }

  function applyHarmony(colors) {
    // Save current for undo
    setPrevColors([...theme.dataColors]);
    // Apply, respecting locks
    const newColors = colors.map((c, i) => {
      if (locked.includes(i) && i < theme.dataColors.length) return theme.dataColors[i];
      return c.toUpperCase();
    });
    setDataColors(newColors);
  }

  function undo() {
    if (!prevColors) return;
    setDataColors(prevColors);
    setPrevColors(null);
  }

  function toggleLock(i) {
    setLocked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  }

  return (
    <div ref={wrapRef} className="relative inline-block">
      <Button
        ref={btnRef}
        onClick={() => {
          setBaseColor(theme.dataColors?.[0] || '#29b4aa');
          setLocked([]);
          if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const left = Math.min(rect.left, window.innerWidth - 480);
            const spaceBelow = window.innerHeight - rect.bottom;
            const top = spaceBelow > 440 ? rect.bottom + 6 : Math.max(8, rect.top - 440);
            setPos({ top, left });
          }
          setOpen(!open);
        }}
        variant="secondary"
        size="sm"
        title="Generate color harmony"
      >
        <Palette size={13} />
        Palette
      </Button>
      {open && createPortal(
        <div
          ref={popRef}
          className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[10px] p-3.5 w-[460px] shadow-lg"
          style={{ position: 'fixed', zIndex: 99999, top: pos.top, left: pos.left }}
        >
          {/* Header */}
          <div className="text-xs font-bold text-[var(--text-primary)] mb-2.5 pb-2 border-b border-[var(--border-default)] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Palette size={13} />
              Palette Generator
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[10px] font-normal text-[#aaa]">Base:</span>
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
          </div>

          {/* Current palette with lock toggles */}
          <div className="mb-2.5 pb-2 border-b border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-[var(--text-muted)]">Current ({colorCount} colors)</span>
              <div className="flex gap-1">
                <button
                  onClick={() => addDataColor('#888888')}
                  className="w-5 h-5 flex items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-muted)] text-[var(--color-accent)] cursor-pointer hover:bg-[var(--color-accent-light)]"
                  title="Add color"
                >
                  <Plus size={10} />
                </button>
                <button
                  onClick={() => { if (colorCount > 1) removeDataColor(colorCount - 1); }}
                  className="w-5 h-5 flex items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-muted)] text-[var(--color-accent)] cursor-pointer hover:bg-[var(--color-accent-light)] disabled:opacity-30"
                  title="Remove last color"
                  disabled={colorCount <= 1}
                >
                  <Minus size={10} />
                </button>
              </div>
            </div>
            <div className="flex gap-1">
              {theme.dataColors.map((c, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div
                    className="w-[28px] h-[28px] rounded-[4px] border border-black/[.08] shrink-0"
                    style={{ background: c }}
                    title={c}
                  />
                  <button
                    onClick={() => toggleLock(i)}
                    className={`w-4 h-4 flex items-center justify-center rounded transition-colors ${locked.includes(i) ? 'text-[var(--color-accent)]' : 'text-[#ccc] hover:text-[#888]'}`}
                    title={locked.includes(i) ? 'Unlock' : 'Lock (keep during Apply)'}
                  >
                    {locked.includes(i) ? <Lock size={9} /> : <Unlock size={9} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Harmony rows */}
          {rows.map(row => (
            <div key={row.name} className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] text-[var(--text-muted)] w-[85px] shrink-0">{row.name}</span>
              <div className="flex gap-0.5 flex-1 min-w-0">
                {row.colors.map((c, i) => (
                  <div
                    key={i}
                    className={`w-[28px] h-[28px] rounded-[4px] border shrink-0 transition-transform hover:scale-110 hover:z-10 ${locked.includes(i) ? 'border-[var(--color-accent)] border-[2px]' : 'border-black/[.08]'}`}
                    style={{ background: locked.includes(i) && i < theme.dataColors.length ? theme.dataColors[i] : c }}
                    title={locked.includes(i) ? `🔒 ${theme.dataColors[i]}` : c}
                  />
                ))}
              </div>
              <MiniBarPreview colors={row.colors} />
              <button
                onClick={() => applyHarmony(row.colors)}
                className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-muted)] text-[var(--color-accent)] cursor-pointer whitespace-nowrap shrink-0 hover:bg-[var(--color-accent-light)] hover:border-[var(--color-accent)]"
              >
                Apply
              </button>
            </div>
          ))}

          {/* Footer actions */}
          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-[var(--border-default)]">
            <Button onClick={undo} variant="ghost" size="sm" disabled={!prevColors} title="Undo last apply">
              <Undo2 size={13} />
              Undo
            </Button>
            <Button onClick={shuffle} variant="secondary" size="sm">
              <Shuffle size={13} />
              Shuffle
            </Button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
