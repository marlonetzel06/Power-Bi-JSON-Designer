import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Module-level embed concurrency queue.
 * Limits how many PowerBIEmbed iframes load simultaneously.
 * Once an embed finishes rendering, it releases its slot so the next can start.
 */
const MAX_CONCURRENT = 3;
let _activeCount = 0;
const _queue = []; // Array of { id, resolve }

function tryProcessQueue() {
  while (_activeCount < MAX_CONCURRENT && _queue.length > 0) {
    const next = _queue.shift();
    _activeCount++;
    next.resolve();
  }
}

function requestSlot(id) {
  return new Promise((resolve) => {
    if (_activeCount < MAX_CONCURRENT) {
      _activeCount++;
      resolve();
    } else {
      _queue.push({ id, resolve });
    }
  });
}

function releaseSlot(id) {
  _activeCount = Math.max(0, _activeCount - 1);
  // Remove from queue if still waiting (unmounted before slot granted)
  const idx = _queue.findIndex(q => q.id === id);
  if (idx !== -1) _queue.splice(idx, 1);
  tryProcessQueue();
}

/**
 * Hook that manages a single card's position in the embed queue.
 * Returns { hasSlot, onRendered } — render embed when hasSlot is true,
 * call onRendered() when the embed fires its 'rendered' event to free the slot.
 */
const SLOT_TIMEOUT_MS = 20000;

export default function useEmbedQueue(shouldQueue) {
  const [hasSlot, setHasSlot] = useState(false);
  const idRef = useRef(Math.random().toString(36).slice(2));
  const releasedRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!shouldQueue) return;
    let cancelled = false;
    const id = idRef.current;
    releasedRef.current = false;

    requestSlot(id).then(() => {
      if (!cancelled) {
        setHasSlot(true);
        // Auto-release slot after timeout to prevent deadlocks
        timeoutRef.current = setTimeout(() => {
          if (!releasedRef.current) {
            releasedRef.current = true;
            releaseSlot(id);
          }
        }, SLOT_TIMEOUT_MS);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
      if (!releasedRef.current) releaseSlot(id);
      setHasSlot(false);
    };
  }, [shouldQueue]);

  // Call this when the embed has finished rendering to free the slot for the next card
  const onRendered = useCallback(() => {
    if (!releasedRef.current) {
      releasedRef.current = true;
      clearTimeout(timeoutRef.current);
      releaseSlot(idRef.current);
    }
  }, []);

  return { hasSlot, onRendered };
}
