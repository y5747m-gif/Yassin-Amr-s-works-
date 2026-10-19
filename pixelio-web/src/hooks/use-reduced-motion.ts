import { useMediaQuery } from '@/hooks/use-media-query';

/** True when the visitor asked the OS to reduce motion — skip non-essential animation. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
