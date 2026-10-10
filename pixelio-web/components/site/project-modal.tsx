"use client";

import * as React from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useScrollToId } from "@/components/providers";
import type { Project } from "@/lib/projects";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

/**
 * Case-study dialog. Radix handles focus trapping, Esc and scroll locking;
 * Framer Motion handles the enter/exit choreography (AnimatePresence keeps the
 * dialog mounted long enough to play its exit).
 */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { t, locale } = useLocale();
  const scrollTo = useScrollToId();

  const startSimilar = () => {
    onClose();
    window.setTimeout(() => scrollTo("contact"), 450);
  };

  return (
    <Dialog.Root open={!!project} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {project && (
          <Dialog.Portal forceMount key={project.id}>
            <motion.div
              aria-hidden
              className="fixed inset-0 z-[90] bg-background/70 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            />

            <Dialog.Content forceMount asChild>
              <motion.div
                className="fixed inset-0 z-[95] overflow-y-auto overscroll-contain p-3 md:p-8"
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) onClose();
                }}
              >
                <motion.article
                  initial={{ opacity: 0, y: 48, scale: 0.97, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 24, scale: 0.98, filter: "blur(6px)" }}
                  transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
                  className="relative mx-auto max-w-5xl rounded-[24px] border border-border bg-background p-4 shadow-[0_60px_120px_-40px_rgb(0,0,0,0.45)] md:p-8"
                >
                  <Dialog.Title className="sr-only">{project.client}</Dialog.Title>
                  <Dialog.Description className="sr-only">
                    {project.summary[locale]}
                  </Dialog.Description>

                  <div className="flex items-center justify-between gap-4 px-2 pb-6 pt-2 md:px-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="pixel-dot size-1.5" />
                      <span className="font-medium text-foreground">{project.client}</span>
                      <span aria-hidden>·</span>
                      <span>{project.type[locale]}</span>
                      <span aria-hidden>·</span>
                      <span className="tabular-nums">{project.year}</span>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label={t.case.close}
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-muted transition-transform duration-500 ease-out-expo hover:rotate-90"
                      >
                        <X className="size-[18px]" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-muted md:aspect-[2/1]">
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 900px, 100vw"
                      loading="eager"
                      className="object-cover object-top"
                    />
                  </div>

                  <div className="grid gap-12 px-2 pt-12 md:grid-cols-12 md:px-4 md:pt-16">
                    <div className="md:col-span-5">
                      <h2 className="text-5xl font-semibold leading-[0.95] tracking-tightest md:text-6xl">
                        {project.client}
                      </h2>
                      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                        {project.summary[locale]}
                      </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 md:col-span-7">
                      <div>
                        <p className="eyebrow mb-3">{t.case.challenge}</p>
                        <p className="leading-relaxed">{project.challenge[locale]}</p>
                      </div>
                      <div>
                        <p className="eyebrow mb-3">{t.case.outcome}</p>
                        <p className="leading-relaxed">{project.outcome[locale]}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-14 px-2 md:px-4">
                    <p className="eyebrow mb-4">{t.case.results}</p>
                    <div className="grid gap-4 md:grid-cols-3">
                      {project.metrics.map((m, i) => (
                        <motion.div
                          key={m.label.en}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.25 + i * 0.09, ease: EASE_OUT_EXPO }}
                          className="rounded-[24px] border border-border bg-card p-6 md:p-7"
                        >
                          <div className="text-4xl font-semibold tabular-nums tracking-tightest md:text-5xl">
                            {m.value}
                          </div>
                          <div className="mt-3 text-sm text-muted-foreground">{m.label[locale]}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-[24px] bg-foreground p-6 text-background md:flex-row md:items-center md:p-8">
                    <p className="max-w-md text-xl font-medium leading-snug tracking-tight md:text-2xl">
                      {t.case.cta}
                    </p>
                    <Button
                      variant="brand"
                      size="lg"
                      className="group h-14 rounded-full px-7"
                      onClick={startSimilar}
                    >
                      {t.case.startSimilar}
                      <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1 [[dir=rtl]_&]:-scale-x-100" />
                    </Button>
                  </div>
                </motion.article>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
