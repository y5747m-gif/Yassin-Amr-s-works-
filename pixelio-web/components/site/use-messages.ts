"use client";

import { useLocale } from "@/components/providers";

/** Convenience hook: the active locale's message dictionary. */
export function useLocaleMessages() {
  return useLocale().t;
}
