"use client";

import { Code2, MessageCircle, Palette, TrendingUp } from "lucide-react";
import { Reveal, WordsReveal } from "@/components/site/reveal";
import { useLocale } from "@/components/providers";

const TEAM_ICONS = [Palette, Code2, TrendingUp, MessageCircle];

export function About() {
  const { t } = useLocale();
  const a = t.about;

  return (
    <section id="about" className="relative border-t border-border px-6 py-32 md:py-44">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <Reveal>
              <span className="eyebrow">
                <span className="pixel-dot size-1.5" />
                {a.eyebrow}
              </span>
            </Reveal>
            <h2 className="mt-6 text-[clamp(2.75rem,6vw,5.6rem)] font-semibold leading-[0.98] tracking-tightest text-balance">
              <WordsReveal text={a.title} />
            </h2>
          </div>
          <div className="flex flex-col gap-6 md:col-span-5 md:pt-24">
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed">{a.p1}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="leading-relaxed text-muted-foreground">{a.p2}</p>
            </Reveal>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-4 md:mt-28 md:grid-cols-4">
          {a.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="rounded-[24px] border border-border bg-card p-6 md:p-8">
              <div className="text-5xl font-semibold tabular-nums tracking-tightest md:text-6xl">{stat.value}</div>
              <div className="mt-4 text-sm leading-snug text-muted-foreground">{stat.label}</div>
            </Reveal>
          ))}
        </div>

        <div className="mt-24 md:mt-32">
          <Reveal>
            <h3 className="eyebrow mb-8">{a.teamTitle}</h3>
          </Reveal>
          <div className="grid gap-px overflow-hidden rounded-[24px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {a.team.map((member, i) => {
              const Icon = TEAM_ICONS[i] ?? Palette;
              return (
                <Reveal key={member.role} delay={i * 0.07} className="group bg-background p-7 transition-colors duration-700 hover:bg-card md:p-8">
                  <Icon className="size-5 text-brand transition-transform duration-700 ease-out-expo group-hover:-rotate-12" />
                  <h4 className="mt-10 text-xl font-semibold tracking-tight">{member.role}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{member.line}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
