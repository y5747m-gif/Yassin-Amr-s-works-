"use client";

import * as React from "react";
import { Code2, LifeBuoy, Palette, Search } from "lucide-react";
import { Reveal, WordsReveal } from "@/components/site/reveal";
import { useLocale } from "@/components/providers";
import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";

const ICONS = [Palette, Code2, Search, LifeBuoy];

/** Which of the 7 timeline cells each phase covers (days 1–2, 3–5, 6, 7). */
const DAY_CELLS: [number, number][] = [
  [0, 1],
  [2, 4],
  [5, 5],
  [6, 6],
];

export function Services() {
  const { t } = useLocale();
  const s = t.services;

  return (
    <section id="services" className="relative border-t border-border px-6 py-32 md:py-44">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 md:grid-cols-12 md:gap-12">
          <div className="md:sticky md:top-32 md:col-span-5 md:self-start">
            <Reveal>
              <span className="eyebrow">
                <span className="pixel-dot size-1.5" />
                {s.eyebrow}
              </span>
            </Reveal>
            <h2 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-tightest md:text-6xl lg:text-7xl">
              <WordsReveal text={s.title} />
            </h2>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted-foreground">{s.sub}</p>
            </Reveal>
          </div>

          <ol className="md:col-span-7">
            {s.items.map((item, i) => {
              const Icon = ICONS[i] ?? Palette;
              return (
                <Reveal
                  as="li"
                  key={item.title}
                  delay={i * 0.06}
                  className="group grid grid-cols-[auto_1fr] gap-x-6 border-t border-border py-9 first:border-t-0 first:pt-0 md:gap-x-10 md:py-12"
                >
                  <div className="flex flex-col items-start gap-6">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-border bg-card transition-colors duration-700 group-hover:bg-foreground group-hover:text-background">
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-semibold tracking-tightest md:text-4xl">{item.title}</h3>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>

        {/* 7-day timeline */}
        <div className="mt-28 md:mt-36">
          <Reveal>
            <h3 className="eyebrow mb-8">{s.timelineTitle}</h3>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-4">
            {s.days.map((day, i) => {
              const [from, to] = DAY_CELLS[i] ?? [0, 0];
              return (
                <Reveal key={day.label} delay={i * 0.08} className="rounded-[24px] border border-border bg-card p-6 md:p-7">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{day.label}</span>
                  </div>
                  <h4 className="mt-8 text-xl font-semibold tracking-tight">{day.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{day.desc}</p>

                  <div className="mt-8 grid grid-cols-7 gap-1.5" aria-hidden>
                    {Array.from({ length: 7 }).map((_, cell) => {
                      const on = cell >= from && cell <= to;
                      return (
                        <motion.span
                          key={cell}
                          initial={{ scale: 0.4, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: 0.3 + i * 0.12 + cell * 0.04, ease: EASE_OUT_EXPO }}
                          className={
                            on
                              ? "pixel-dot aspect-square rounded-[3px]"
                              : "aspect-square rounded-[3px] bg-muted"
                          }
                        />
                      );
                    })}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
