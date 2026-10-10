"use client";

import { ArrowUp } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Magnetic } from "@/components/site/magnetic";
import { useLocale, useScrollToId } from "@/components/providers";
import { CONTACT_EMAIL } from "@/components/site/contact";

export function Footer() {
  const { t } = useLocale();
  const scrollTo = useScrollToId();

  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Logo className="text-2xl" />
          <p className="max-w-xs text-sm text-muted-foreground">{t.footer.tagline}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline">
            {CONTACT_EMAIL}
          </a>
          <a href="https://pixelio.studio" className="link-underline text-muted-foreground">
            pixelio.studio
          </a>
        </div>

        <Magnetic>
          <button
            type="button"
            onClick={() => scrollTo("top")}
            className="group inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors duration-500 hover:bg-foreground hover:text-background"
          >
            <ArrowUp className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5" />
            {t.footer.top}
          </button>
        </Magnetic>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:justify-between">
        <span>{t.footer.rights}</span>
      </div>
    </footer>
  );
}
