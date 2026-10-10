"use client";

import { useLocaleMessages } from "@/components/site/use-messages";

export function Marquee() {
  const items = useLocaleMessages().marquee;
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-border py-6" aria-hidden>
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap pe-10">
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-10 text-3xl font-medium tracking-tightest text-muted-foreground/80 md:text-4xl">
            {item}
            <span className="pixel-dot size-2.5 shrink-0 rounded-[2px]" />
          </span>
        ))}
      </div>
    </div>
  );
}
