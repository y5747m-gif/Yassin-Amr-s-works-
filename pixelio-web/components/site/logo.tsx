import { cn } from "@/lib/utils";

/**
 * The pixelio wordmark. Both "i"s are set dotless and replaced with a square
 * vermilion pixel, so the dot itself is the brand mark.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span dir="ltr" className={cn("inline-flex items-baseline font-semibold lowercase tracking-tightest", className)} aria-label="pixelio">
      <span aria-hidden>p</span>
      <PixelI />
      <span aria-hidden>x</span>
      <span aria-hidden>e</span>
      <span aria-hidden>l</span>
      <PixelI />
      <span aria-hidden>o</span>
    </span>
  );
}

function PixelI() {
  return (
    <span className="relative inline-block" aria-hidden>
      ı
      <span className="pixel-dot absolute left-[0.075em] top-[0.12em] size-[0.15em] rounded-[1px]" />
    </span>
  );
}
