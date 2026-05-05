import { useCallback, useEffect, useRef } from 'react';

/**
 * Draggable resize handle for panels.
 * @param {Object} props
 * @param {'left'|'right'} props.side - Which side of the panel the handle is on.
 *   'left' = handle on the left edge (panel grows leftward when dragged left, e.g. right-side panels).
 *   'right' = handle on the right edge (panel grows rightward when dragged right, e.g. left-side panels like sidebar).
 * @param {number} props.width - Current width of the panel.
 * @param {function} props.onResize - Callback with new width value.
 * @param {number} [props.min=200] - Minimum width.
 * @param {number} [props.max=800] - Maximum width.
 */
export default function ResizeHandle({ side, width, onResize, min = 200, max = 800 }) {
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      // For a right-side panel (handle on left), dragging left = wider
      const newWidth = side === 'left'
        ? startWidth.current - delta
        : startWidth.current + delta;
      onResize(Math.max(min, Math.min(max, newWidth)));
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [side, onResize, min, max]);

  return (
    <div
      onMouseDown={onMouseDown}
      className={`w-1 flex-shrink-0 cursor-col-resize group relative z-20 hover:bg-[var(--color-accent)] transition-colors duration-150 ${
        side === 'left' ? '-ml-0.5' : '-mr-0.5'
      }`}
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}
