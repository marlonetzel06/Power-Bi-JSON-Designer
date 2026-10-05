import { toast } from 'react-hot-toast';
import type { StateStorage } from 'zustand/middleware';

let warned = false;

/**
 * localStorage that never throws: private mode, blocked storage or a full quota
 * degrade to "not persisted" with one warning toast instead of crashing the app.
 */
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      if (!warned) {
        warned = true;
        const quota = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22);
        toast.error(quota ? 'Speicher voll – Änderungen werden nicht mehr lokal gesichert. / Storage full – changes are no longer saved locally.' : 'Lokaler Speicher nicht verfügbar – Änderungen gehen beim Neuladen verloren. / Local storage unavailable – changes are lost on reload.', { duration: 8000 });
      }
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};
