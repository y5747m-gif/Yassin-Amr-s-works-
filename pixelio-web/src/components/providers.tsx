import type { ReactNode } from 'react';
import { LanguageContext, useLanguageController } from '@/lib/i18n';
import { ThemeContext, useThemeController } from '@/lib/theme';

/**
 * App-wide context: theme (light / dark / system) and language (en / ar + RTL).
 * Mirrors the old Next.js `components/providers.tsx`, minus next-themes.
 */
export function Providers({ children }: { children: ReactNode }) {
  const theme = useThemeController();
  const language = useLanguageController();

  return (
    <ThemeContext.Provider value={theme}>
      <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}
