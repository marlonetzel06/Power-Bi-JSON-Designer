import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Module-level embed concurrency queue.
 * Limits how many PowerBIEmbed iframes render simultaneously.
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
 * Returns { hasSlot } — only render the embed when hasSlot is true.
 */
export default function useEmbedQueue(shouldQueue) {
  const [hasSlot, setHasSlot] = useState(false);
  const idRef = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    if (!shouldQueue) return;
    let cancelled = false;
    const id = idRef.current;

    requestSlot(id).then(() => {
      if (!cancelled) setHasSlot(true);
    });

    return () => {
      cancelled = true;
      releaseSlot(id);
      setHasSlot(false);
    };
  }, [shouldQueue]);

  // Notify queue when this embed is done rendering (call from onRendered)
  const onRendered = useCallback(() => {
    // Slot stays active — no release on render.
    // Release only happens on unmount (visibility lost / component destroyed).
  }, []);

  return { hasSlot, onRendered };
}
