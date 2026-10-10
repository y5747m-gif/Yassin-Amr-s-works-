"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/site/magnetic";
import { WordsReveal, Reveal } from "@/components/site/reveal";
import { useLocale, useScrollToId } from "@/components/providers";
import { EASE_OUT_EXPO } from "@/lib/motion";

export function Hero() {
  const { t } = useLocale();
  const scrollTo = useScrollToId();
  const ref = React.useRef<HTMLElement>(null);

  // Scroll-linked parallax: the two project previews drift at different speeds.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yFront = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yBack = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // Pointer parallax: a soft spring that tilts the previews toward the cursor.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });
  const frontX = useTransform(sx, (v) => v * 28);
  const frontY = useTransform(sy, (v) => v * 20);
  const backX = useTransform(sx, (v) => v * -22);
  const backY = useTransform(sy, (v) => v * -26);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    px.set(e.clientX / window.innerWidth - 0.5);
    py.set(e.clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={onPointerMove}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden px-6 pb-10 pt-32 md:pt-36"
    >
      {/* Soft grid + vignette backdrop */}
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgb(var(--brand) / 0.18), transparent)" }}
      />

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-16 md:grid-cols-12">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="md:col-span-6 xl:col-span-6">
          <Reveal>
            <span className="eyebrow">
              <span className="pixel-dot size-1.5" />
              {t.hero.eyebrow}
            </span>
          </Reveal>

          <h1 className="mt-7 text-[clamp(2.9rem,7vw,6.9rem)] font-semibold leading-[0.95] tracking-tightest text-balance">
            <WordsReveal text={t.hero.title} delay={0.1} />
          </h1>

          <Reveal delay={0.45} className="mt-8 max-w-md">
            <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">{t.hero.sub}</p>
          </Reveal>

          <Reveal delay={0.6} className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Button size="lg" className="group h-14 rounded-full px-8" onClick={() => scrollTo("contact")}>
                {t.hero.primary}
                <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1 [[dir=rtl]_&]:-scale-x-100" />
              </Button>
            </Magnetic>
            <Magnetic>
              <Button variant="outline" size="lg" className="h-14 rounded-full px-8" onClick={() => scrollTo("work")}>
                {t.hero.secondary}
              </Button>
            </Magnetic>
          </Reveal>

          <Reveal delay={0.8} className="mt-14 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex size-8 items-center justify-center rounded-full border border-border">
              <ArrowDown className="size-3.5 animate-bounce" />
            </span>
            <span className="tracking-tight">{t.hero.tagline}</span>
          </Reveal>
        </motion.div>

        {/* Floating project previews */}
        <div className="relative mx-auto h-[460px] w-full max-w-[520px] sm:h-[540px] md:col-span-6 md:h-[620px] md:max-w-none xl:col-span-6">
          <motion.div style={{ y: yBack, x: backX }} className="absolute end-[4%] top-[2%] w-[52%] md:w-[46%]">
            <motion.div style={{ y: backY }}>
              <FloatingCard
                src="/work/kiln.jpg"
                alt=""
                label={t.hero.floatB}
                className="aspect-square"
                delay={1.2}
                floatDuration={8}
              />
            </motion.div>
          </motion.div>

          <motion.div style={{ y: yFront, x: frontX }} className="absolute start-[2%] bottom-[4%] w-[58%] md:w-[52%]">
            <motion.div style={{ y: frontY }}>
              <FloatingCard
                src="/work/relay.jpg"
                alt=""
                label={t.hero.floatA}
                className="aspect-[4/5]"
                delay={0.9}
                floatDuration={7}
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  src,
  alt,
  label,
  className,
  delay,
  floatDuration,
  priority,
}: {
  src: string;
  alt: string;
  label: string;
  className: string;
  delay: number;
  floatDuration: number;
  priority?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.4, delay, ease: EASE_OUT_EXPO }}
    >
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" }}
        className="group relative"
      >
        <div className={`relative overflow-hidden rounded-[24px] border border-border bg-card shadow-[0_40px_80px_-30px_rgb(0,0,0,0.25)] ${className}`}>
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 768px) 30vw, 60vw"
            className="object-cover object-top transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.04]"
          />
        </div>
        <span className="glass absolute -bottom-3 start-4 rounded-full border border-border/70 px-3 py-1.5 text-[11px] font-medium tracking-tight shadow-sm">
          {label}
        </span>
      </motion.div>
    </motion.div>
  );
}
