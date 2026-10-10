"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { Magnetic } from "@/components/site/magnetic";
import { useLocale, useScrollToId } from "@/components/providers";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO } from "@/lib/motion";

const SECTIONS = ["work", "services", "about", "contact"] as const;

export function Navbar() {
  const { t, locale, setLocale } = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const scrollTo = useScrollToId();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const labels: Record<(typeof SECTIONS)[number], string> = {
    work: t.nav.work,
    services: t.nav.services,
    about: t.nav.about,
    contact: t.nav.contact,
  };

  const go = (id: string) => {
    setMenuOpen(false);
    scrollTo(id);
  };

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-3 md:px-6">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.15 }}
        className={cn(
          "glass pointer-events-auto relative flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-border/70 py-2 ps-5 pe-2 transition-shadow duration-700",
          scrolled && "shadow-[0_12px_40px_-12px_rgb(0,0,0,0.18)]",
        )}
        aria-label="Primary"
      >
        <a href="#top" onClick={(e) => { e.preventDefault(); scrollTo("top"); }} className="text-[19px] leading-none">
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {SECTIONS.map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => { e.preventDefault(); go(id); }}
                className="link-underline rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors duration-500 hover:text-foreground"
              >
                {labels[id]}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            aria-label={t.nav.language}
            className="hidden h-10 min-w-10 items-center justify-center rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors duration-500 hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            {locale === "en" ? "عربي" : "EN"}
          </button>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={t.nav.theme}
            className="hidden size-10 items-center justify-center rounded-full text-muted-foreground transition-colors duration-500 hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            {mounted && isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>

          <Magnetic className="hidden sm:inline-flex">
            <Button
              size="default"
              className="group h-10 rounded-full px-5 text-[13px]"
              onClick={() => scrollTo("contact")}
            >
              {t.nav.cta}
              <ArrowRight className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 [[dir=rtl]_&]:-scale-x-100" />
            </Button>
          </Magnetic>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t.nav.close : t.nav.menu}
            className="inline-flex size-10 items-center justify-center rounded-full bg-muted md:hidden"
          >
            {menuOpen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
              className="glass absolute inset-x-0 top-full mt-3 origin-top overflow-hidden rounded-[24px] border border-border/70 p-3 md:hidden"
            >
              <ul className="flex flex-col">
                {SECTIONS.map((id) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => { e.preventDefault(); go(id); }}
                      className="flex items-center justify-between rounded-2xl px-4 py-4 text-2xl font-medium tracking-tightest hover:bg-muted"
                    >
                      {labels[id]}
                      <ArrowRight className="size-5 text-muted-foreground [[dir=rtl]_&]:-scale-x-100" />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center gap-2 border-t border-border p-2 pt-4">
                <Button className="flex-1 rounded-full" onClick={() => go("contact")}>
                  {t.nav.cta}
                </Button>
                <button
                  type="button"
                  onClick={() => setLocale(locale === "en" ? "ar" : "en")}
                  className="h-10 rounded-full bg-muted px-4 text-sm font-medium"
                >
                  {locale === "en" ? "عربي" : "EN"}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  aria-label={t.nav.theme}
                  className="inline-flex size-10 items-center justify-center rounded-full bg-muted"
                >
                  {mounted && isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
