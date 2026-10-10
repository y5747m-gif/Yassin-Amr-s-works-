"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Magnetic } from "@/components/site/magnetic";
import { Reveal, WordsReveal } from "@/components/site/reveal";
import { useLocale } from "@/components/providers";
import { cn } from "@/lib/utils";
import { EASE_OUT_EXPO } from "@/lib/motion";

export const CONTACT_EMAIL = "hello@pixelio.studio";

type Status = "idle" | "sending" | "success" | "error";
type FieldErrors = Partial<Record<"name" | "email", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contact() {
  const { t, locale } = useLocale();
  const c = t.contact;
  const [status, setStatus] = React.useState<Status>("idle");
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [budget, setBudget] = React.useState<number | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = c.required;
    if (!email) nextErrors.email = c.required;
    else if (!EMAIL_RE.test(email)) nextErrors.email = c.invalidEmail;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          message,
          budget: budget === null ? null : c.budgetOptions[budget],
          locale,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus("success");
      form.reset();
      setBudget(null);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden border-t border-border px-6 pb-20 pt-32 md:pt-44">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-70" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-6">
          <Reveal>
            <span className="eyebrow">
              <span className="pixel-dot size-1.5" />
              {c.eyebrow}
            </span>
          </Reveal>
          <h2 className="mt-6 text-[clamp(3rem,8.5vw,8.5rem)] font-semibold leading-[0.9] tracking-tightest text-balance">
            <WordsReveal text={c.title} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-sm text-lg text-muted-foreground">{c.sub}</p>
          </Reveal>

          <Reveal delay={0.3} className="mt-12">
            <p className="text-sm text-muted-foreground">{c.orEmail}</p>
            <Magnetic className="mt-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="link-underline group inline-flex items-center gap-3 text-2xl font-medium tracking-tight md:text-4xl"
              >
                <Mail className="size-6 text-brand md:size-8" />
                {CONTACT_EMAIL}
                <ArrowRight className="size-5 opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-x-1 group-hover:opacity-100 [[dir=rtl]_&]:-scale-x-100" />
              </a>
            </Magnetic>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="md:col-span-6">
          <form
            onSubmit={onSubmit}
            noValidate
            className="rounded-[24px] border border-border bg-card/80 p-6 backdrop-blur-sm md:p-10"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label={c.fields.name} error={errors.name} htmlFor="name">
                <Input id="name" name="name" autoComplete="name" placeholder={c.placeholders.name} />
              </Field>
              <Field label={c.fields.email} error={errors.email} htmlFor="email">
                <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder={c.placeholders.email} />
              </Field>
            </div>

            <div className="mt-6">
              <Field label={c.fields.company} htmlFor="company">
                <Input id="company" name="company" autoComplete="organization" placeholder={c.placeholders.company} />
              </Field>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{c.fields.budget}</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={c.fields.budget}>
                {c.budgetOptions.map((option, i) => {
                  const active = budget === i;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setBudget(active ? null : i)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm transition-all duration-500 ease-out-expo",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <Field label={c.fields.message} htmlFor="message">
                <Textarea id="message" name="message" placeholder={c.placeholders.message} />
              </Field>
            </div>

            <div className="mt-8 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p
                role="status"
                aria-live="polite"
                className={cn(
                  "min-h-5 text-sm",
                  status === "error" ? "text-destructive" : "text-muted-foreground",
                )}
              >
                <AnimatePresence mode="wait">
                  {status === "success" && (
                    <motion.span
                      key="ok"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                      className="inline-flex items-center gap-2 text-foreground"
                    >
                      <Check className="size-4 text-brand" /> {c.success}
                    </motion.span>
                  )}
                  {status === "error" && (
                    <motion.span key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {c.error}
                    </motion.span>
                  )}
                </AnimatePresence>
              </p>

              <Magnetic className="sm:self-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "sending"}
                  className="group h-14 w-full rounded-full px-8 sm:w-auto"
                >
                  {status === "sending" ? c.sending : c.submit}
                  <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1 [[dir=rtl]_&]:-scale-x-100" />
                </Button>
              </Magnetic>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
