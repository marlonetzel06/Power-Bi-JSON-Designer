import { useEffect } from 'react';
import { useThemeStore } from '@/store/theme';

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/** Ctrl/Cmd+Z, Shift+Z, Y — not while typing in a text field (the browser handles that). */
export function useUndoShortcuts(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key !== 'z' && key !== 'y') return;
      if (isEditable(e.target)) return;
      const temporal = useThemeStore.temporal.getState();
      if (key === 'y' || (key === 'z' && e.shiftKey)) {
        if (temporal.futureStates.length) temporal.redo();
      } else if (temporal.pastStates.length) temporal.undo();
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
