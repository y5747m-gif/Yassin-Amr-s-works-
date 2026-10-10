"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "article";
}

/** Fades and lifts its children into view the first time they scroll on screen. */
export function Reveal({ children, className, delay = 0, y = 40, as = "div" }: RevealProps) {
  const Comp = motion[as];
  return (
    <Comp
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, delay, ease: EASE_OUT_EXPO }}
      className={cn(className)}
    >
      {children}
    </Comp>
  );
}

const wordContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const wordItem: Variants = {
  hidden: { y: "105%", rotate: 2 },
  show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE_OUT_EXPO } },
};

/**
 * Reveals a headline word by word, each word rising out of a mask.
 * The inner component is keyed by its text so a language switch remounts it
 * and the new words animate in again.
 */
export function WordsReveal(props: { text: string; className?: string; delay?: number }) {
  return <WordsRevealInner key={props.text} {...props} />;
}

function WordsRevealInner({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <motion.span
      variants={wordContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delayChildren: delay }}
      className={cn("inline-block", className)}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="mr-[0.22em] inline-block overflow-hidden py-[0.12em] -my-[0.12em] align-top last:mr-0"
        >
          <motion.span variants={wordItem} className="inline-block origin-bottom-left will-change-transform" aria-hidden>
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
