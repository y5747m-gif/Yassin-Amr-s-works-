"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal, WordsReveal } from "@/components/site/reveal";
import { ProjectModal } from "@/components/site/project-modal";
import { useLocale } from "@/components/providers";
import { projects, type Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function Work() {
  const { t, locale } = useLocale();
  const [active, setActive] = React.useState<Project | null>(null);

  return (
    <section id="work" className="relative px-6 py-32 md:py-44">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <span className="eyebrow">
                <span className="pixel-dot size-1.5" />
                {t.work.eyebrow}
              </span>
            </Reveal>
            <h2 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-tightest md:text-7xl">
              <WordsReveal text={t.work.title} />
            </h2>
          </div>
          <Reveal delay={0.15} className="max-w-sm md:pb-2">
            <p className="text-muted-foreground">{t.work.sub}</p>
          </Reveal>
        </div>

        {/* Masonry: CSS columns let each card keep its own aspect ratio. */}
        <div className="mt-16 columns-1 gap-6 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={(i % 3) * 0.08} className="mb-10 break-inside-avoid">
              <ProjectCard project={project} label={t.work.view} locale={locale} onOpen={() => setActive(project)} />
            </Reveal>
          ))}
        </div>
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}

function ProjectCard({
  project,
  label,
  locale,
  onOpen,
}: {
  project: Project;
  label: string;
  locale: "en" | "ar";
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group block w-full text-start transition-transform duration-[900ms] ease-out-expo hover:-translate-y-1.5"
    >
      <div className={cn("relative overflow-hidden rounded-[24px] border border-border bg-muted", project.aspect)}>
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-background/0 transition-colors duration-700 group-hover:bg-background/10" />
        <div className="absolute inset-x-4 bottom-4 flex translate-y-3 items-center justify-between opacity-0 transition-all duration-700 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
          <span className="glass rounded-full border border-border/70 px-4 py-2 text-xs font-medium">{label}</span>
          <span className="glass grid size-11 place-items-center rounded-full border border-border/70">
            <ArrowUpRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:rotate-45 [[dir=rtl]_&]:-scale-x-100" />
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4 px-1">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{project.client}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{project.type[locale]}</p>
        </div>
        <span className="pt-1 text-sm tabular-nums text-muted-foreground">{project.year}</span>
      </div>
    </button>
  );
}
