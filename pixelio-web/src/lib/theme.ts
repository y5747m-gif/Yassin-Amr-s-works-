import { createContext, useCallback, useContext, useEffect, useMemo, type Dispatch, type SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'pixelio-theme';

export interface ThemeContextValue {
  /** What the visitor picked. */
  theme: Theme;
  /** What is actually on screen right now. */
  resolved: ResolvedTheme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  cycleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Resolves the stored theme, keeps `.dark` on <html> and updates
 * <meta name="theme-color"> so the browser chrome matches.
 * Used once, inside <Providers>.
 */
export function useThemeController(): ThemeContextValue {
  const [theme, setTheme] = useLocalStorage<Theme>(STORAGE_KEY, 'system');

  const resolved: ResolvedTheme = useMemo(
    () => (theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme),
    [theme],
  );

  useEffect(() => {
    const apply = () => {
      const dark = theme === 'system' ? systemPrefersDark() : theme === 'dark';
      document.documentElement.classList.toggle('dark', dark);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dark ? '#0A0A0A' : '#FCFCF9');
    };

    apply();

    if (theme !== 'system') return;
    const list = window.matchMedia('(prefers-color-scheme: dark)');
    list.addEventListener('change', apply);
    return () => list.removeEventListener('change', apply);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light'));
  }, [setTheme]);

  return { theme, resolved, setTheme, cycleTheme };
}

/** Consume the theme from anywhere in the tree. */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside <Providers>');
  return value;
}
