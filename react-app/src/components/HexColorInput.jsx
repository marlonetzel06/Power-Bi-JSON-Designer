import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

export default function HexColorInput({ value, onChange, swatchClassName }) {
  const raw = (value || '#888888').toString();
  const storeHex = (raw.startsWith('#') ? raw : `#${raw}`).toUpperCase();
  const [localHex, setLocalHex] = useState(storeHex);
  const [isFocused, setIsFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const popRef = useRef(null);
  const swatchRef = useRef(null);

  const displayHex = isFocused ? localHex : storeHex;

  useEffect(() => {
    if (!isFocused) setLocalHex(storeHex);
  }, [storeHex, isFocused]);

  const openPicker = useCallback(() => {
    if (swatchRef.current) {
      const rect = swatchRef.current.getBoundingClientRect();
      // Position below the swatch, flip up if too close to bottom
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow > 140 ? rect.bottom + 4 : rect.top - 140;
      const left = Math.min(rect.left, window.innerWidth - 130);
      setPos({ top, left });
    }
    setOpen(o => !o);
  }, []);

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
        onClick={openPicker}
        className={swatchClassName || 'w-8 h-8 border-[1.5px] border-[var(--border-subtle)] rounded-[var(--radius-sm)] cursor-pointer shrink-0'}
        style={{ backgroundColor: storeHex }}
      />
      {open && createPortal(
        <div
          ref={popRef}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] shadow-lg p-2 flex flex-col gap-2"
          style={{ position: 'fixed', zIndex: 99999, top: pos.top, left: pos.left }}
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
            className="w-[100px] text-[11px] font-mono px-1.5 py-1 border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-center bg-[var(--bg-surface)] text-[var(--text-default)]"
            spellCheck={false}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
