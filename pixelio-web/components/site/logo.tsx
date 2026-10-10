import { cn } from "@/lib/utils";

/**
 * The pixelio wordmark. Both "i"s are set dotless and replaced with a square
 * vermilion pixel, so the dot itself is the brand mark.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      dir="ltr"
      className={cn("group/logo inline-flex items-baseline font-semibold lowercase tracking-tightest", className)}
      aria-label="pixelio"
    >
      <span aria-hidden>p</span>
      <PixelI index={0} />
      <span aria-hidden>x</span>
      <span aria-hidden>e</span>
      <span aria-hidden>l</span>
      <PixelI index={1} />
      <span aria-hidden>o</span>
    </span>
  );
}

function PixelI({ index }: { index: number }) {
  return (
    <span className="relative inline-block" aria-hidden>
      ı
      <span
        className={cn(
          "pixel-dot absolute left-[0.075em] top-[0.12em] size-[0.15em] rounded-[1px] transition-transform duration-700 ease-out-expo group-hover/logo:scale-[1.8]",
          index === 1 && "[animation-delay:180ms]",
        )}
      />
    </span>
  );
}
