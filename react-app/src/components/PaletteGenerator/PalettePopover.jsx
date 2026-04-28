import { useState, useRef, useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import { hexToHSL, hslToHex } from '../../utils/colorUtils';

const HARMONIES = {
  Analogous:      h => [h, h+30, h+60, h-30, h+15, h+45, h-15, h+75],
  Complementary:  h => [h, h+180, h+30, h+210, h+15, h+195, h-15, h+165],
  Triadic:        h => [h, h+120, h+240, h+30, h+150, h+270, h+60, h+180],
  'Split-Compl.': h => [h, h+150, h+210, h+30, h+165, h+195, h+15, h+225],
  Monochromatic:  h => [h, h, h, h, h, h, h, h],
};

function generateHarmonyColors(name, fn, hsl, sJitter = 0, lJitter = 0) {
  const [hh, ss, ll] = hsl;
  const hues = fn(hh);
  return hues.map((hu, i) => {
    const h = ((hu % 360) + 360) % 360;
    const lOff = name === 'Monochromatic' ? (i - 3.5) * 8 + lJitter : lJitter;
    const s = Math.max(20, Math.min(92, ss + sJitter));
    const l = Math.max(22, Math.min(76, ll + lOff));
    return hslToHex(h, s, l);
  });
}

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
    const hsl = hexToHSL(hex);
    const r = Object.entries(HARMONIES).map(([name, fn]) => ({
      name,
      colors: generateHarmonyColors(name, fn, hsl, sJ, lJ),
    }));
    setRows(r);
  }

  function shuffle() {
    const sJ = (Math.random() - 0.5) * 24;
    const lJ = (Math.random() - 0.5) * 20;
    buildRows(baseColor, sJ, lJ);
  }

  function applyHarmony(colors) {
    colors.forEach((c, i) => setDataColor(i, c.toUpperCase()));
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        onClick={() => { setBaseColor(theme.dataColors?.[0] || '#1F8AC0'); setOpen(!open); }}
        className="text-xs px-2 py-1.5 rounded-md border border-[#c8d8ea] bg-white text-[#555] font-medium cursor-pointer hover:border-[#1f8ac0] hover:text-[#1f8ac0] dark:bg-[#24263e] dark:border-[#373963] dark:text-[#a9b1d6] dark:hover:border-[#89b4fa] dark:hover:text-[#89b4fa]"
        title="Generate color harmony"
      >
        ✨ Palette
      </button>
      {open && (
        <div className="absolute z-[500] top-full left-0 mt-1.5 bg-white border border-[#d0dce8] rounded-[10px] p-3.5 w-[340px] shadow-lg dark:bg-[#24263e] dark:border-[#373963] dark:shadow-[0_6px_24px_rgba(0,0,0,.5)]">
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
                className="bg-transparent border-none cursor-pointer text-sm text-[#888] leading-none"
              >
                ✕
              </button>
            </span>
          </h4>

          {rows.map(row => (
            <div key={row.name} className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] text-[#666] w-[90px] shrink-0 dark:text-[#505373]">{row.name}</span>
              <div className="flex gap-0.5 flex-1 min-w-0">
                {row.colors.map((c, i) => (
                  <div
                    key={i}
                    className="w-[18px] h-[18px] rounded-[3px] border border-black/[.08] shrink-0"
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

          <div className="flex justify-end mt-2.5 pt-2 border-t border-[#e6edf5] dark:border-t-[#373963]">
            <button
              onClick={shuffle}
              className="text-[11px] px-3 py-1 rounded-[5px] border border-[#c8d8e8] bg-[#f8fafd] text-[#555] cursor-pointer hover:border-[#1f8ac0] hover:text-[#1f8ac0] dark:bg-[#2d3055] dark:border-[#373963] dark:text-[#a9b1d6] dark:hover:text-[#89b4fa]"
            >
              🔀 Shuffle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
