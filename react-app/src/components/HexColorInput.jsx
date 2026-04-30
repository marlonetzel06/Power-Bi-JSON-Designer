import { useState, useRef, useEffect } from 'react';

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

export default function HexColorInput({ value, onChange, swatchClassName }) {
  const raw = (value || '#888888').toString();
  const storeHex = (raw.startsWith('#') ? raw : `#${raw}`).toUpperCase();
  const [localHex, setLocalHex] = useState(storeHex);
  const [isFocused, setIsFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);
  const swatchRef = useRef(null);

  const displayHex = isFocused ? localHex : storeHex;

  useEffect(() => {
    if (!isFocused) setLocalHex(storeHex);
  }, [storeHex, isFocused]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        popRef.current && !popRef.current.contains(e.target) &&
        swatchRef.current && !swatchRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative inline-flex">
      <div
        ref={swatchRef}
        onClick={() => setOpen((o) => !o)}
        className={swatchClassName || 'w-8 h-8 border-[1.5px] border-[#c8d8e8] rounded cursor-pointer shrink-0 dark:border-[#373963]'}
        style={{ backgroundColor: storeHex }}
      />
      {open && (
        <div
          ref={popRef}
          className="absolute left-0 top-full mt-1 z-50 bg-white border border-[#c8d8e8] rounded-lg shadow-lg p-2 flex flex-col gap-2 dark:bg-[#24263e] dark:border-[#373963]"
        >
          <input
            type="color"
            value={storeHex.toLowerCase()}
            onChange={(e) => {
              const upper = e.target.value.toUpperCase();
              onChange(upper);
              setLocalHex(upper);
            }}
            className="w-[100px] h-[60px] border-none rounded cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={displayHex}
            onChange={(e) => {
              const val = e.target.value;
              setLocalHex(val);
              const normalized = val.startsWith('#') ? val : `#${val}`;
              if (HEX_REGEX.test(normalized)) onChange(normalized.toUpperCase());
            }}
            onFocus={() => { setIsFocused(true); setLocalHex(storeHex); }}
            onBlur={() => setIsFocused(false)}
            className="w-[100px] text-[11px] font-mono px-1.5 py-1 border border-[#c8d8e8] rounded text-center bg-white dark:bg-[#1e2038] dark:border-[#373963] dark:text-[#c0caf5]"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
