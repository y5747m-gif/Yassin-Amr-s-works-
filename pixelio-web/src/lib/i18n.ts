import { createContext, useCallback, useContext, useEffect, useMemo, type Dispatch, type SetStateAction } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { messages, type Locale, type Messages } from '@/lib/messages';
import type { Localized } from '@/lib/projects';

export const STORAGE_KEY = 'pixelio-lang';
export const LOCALES: readonly Locale[] = ['en', 'ar'] as const;

export type Direction = 'ltr' | 'rtl';

export const dirOf = (locale: Locale): Direction => (locale === 'ar' ? 'rtl' : 'ltr');

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  return (navigator.language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

/* ------------------------------------------------------------------
   Scaffolding strings.
   The real marketing copy lives in @/lib/messages (both languages).
   ------------------------------------------------------------------ */
const uiMessages = {
  en: {
    foundationTitle: 'Foundation ready',
    foundationSub: 'Stack, tokens, language and theme are wired up. Drop the site components into src/components/site.',
    language: 'Language',
    theme: 'Theme',
    direction: 'Direction',
    locale: 'Locale',
    sampleLatin: 'Inter — the quick brown fox jumps over the lazy dog',
    sampleArabic: 'Tajawal — نص عربي تجريبي للتأكد من اتجاه الكتابة والخط',
    tokens: 'Design tokens',
    typography: 'Typography',
    structure: 'Project structure',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
  ar: {
    foundationTitle: 'الأساس جاهز',
    foundationSub: 'المكتبات والألوان واللغة والوضع الليلي متوصّلين. ضيف مكوّنات الموقع في src/components/site.',
    language: 'اللغة',
    theme: 'المظهر',
    direction: 'الاتجاه',
    locale: 'اللغة الحالية',
    sampleLatin: 'Inter — نص إنجليزي للتأكد من الخط اللاتيني',
    sampleArabic: 'Tajawal — نص عربي تجريبي للتأكد من اتجاه الكتابة والخط',
    tokens: 'ألوان النظام',
    typography: 'الخطوط',
    structure: 'هيكل المشروع',
    light: 'فاتح',
    dark: 'داكن',
    system: 'النظام',
  },
} satisfies Record<Locale, Record<string, string>>;

export type UiMessages = (typeof uiMessages)['en'];

export interface LanguageContextValue {
  locale: Locale;
  dir: Direction;
  /** Marketing copy for the active locale (nav, hero, work, contact, footer…). */
  t: Messages;
  /** Small scaffolding labels used by the shell itself. */
  ui: UiMessages;
  setLocale: Dispatch<SetStateAction<Locale>>;
  toggleLocale: () => void;
  /** Pick the right side of a `{ en, ar }` field. */
  tr: (value: Localized) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Used once, inside <Providers>. */
export function useLanguageController(): LanguageContextValue {
  const [locale, setLocale] = useLocalStorage<Locale>(STORAGE_KEY, detectLocale);
  const dir = dirOf(locale);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
  }, [locale, dir]);

  const toggleLocale = useCallback(() => {
    setLocale((current) => (current === 'ar' ? 'en' : 'ar'));
  }, [setLocale]);

  const tr = useCallback((value: Localized) => value[locale], [locale]);

  return useMemo(
    () => ({
      locale,
      dir,
      t: messages[locale],
      ui: uiMessages[locale],
      setLocale,
      toggleLocale,
      tr,
    }),
    [locale, dir, setLocale, toggleLocale, tr],
  );
}

/** Consume the active language from anywhere in the tree. */
export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside <Providers>');
  return value;
}
