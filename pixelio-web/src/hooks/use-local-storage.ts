import { useEffect, useState } from 'react';

/**
 * `useState` mirrored into localStorage. Values are stored as JSON, so the
 * pre-paint script in index.html strips the surrounding quotes.
 */
export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const fallback = () => (typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : fallback();
    } catch {
      return fallback();
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode / quota — the app still works, it just forgets on reload */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
