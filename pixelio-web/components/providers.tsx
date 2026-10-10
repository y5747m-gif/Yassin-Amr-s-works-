"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import { messages, type Locale, type Messages } from "@/lib/messages";

/* ---------------- Locale ---------------- */

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
  isAr: boolean;
}

const LocaleContext = React.createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: messages.en,
  isAr: false,
});

const STORAGE_KEY = "pixelio-locale";

function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");

  // Pick the stored choice, otherwise follow the browser language. Runs after mount
  // so server and client markup match on the first render.
  React.useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (stored === "en" || stored === "ar") {
      setLocaleState(stored);
    } else if (navigator.language?.toLowerCase().startsWith("ar")) {
      setLocaleState("ar");
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — keep the in-memory choice */
    }
  }, []);

  const value = React.useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: messages[locale], isAr: locale === "ar" }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return React.useContext(LocaleContext);
}

/* ---------------- Smooth scroll (Lenis) ---------------- */

const LenisContext = React.createContext<Lenis | null>(null);

function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = React.useState<Lenis | null>(null);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      duration: 1.25,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    setLenis(instance);

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

/** Returns a function that smoothly scrolls to an element id (falls back to native jump). */
export function useScrollToId() {
  const lenis = React.useContext(LenisContext);
  return React.useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (lenis) {
        lenis.scrollTo(el, { offset: -88, duration: 1.4 });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [lenis],
  );
}

/* ---------------- Root ---------------- */

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
      <LocaleProvider>
        <MotionConfig reducedMotion="user">
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </MotionConfig>
      </LocaleProvider>
    </ThemeProvider>
  );
}
