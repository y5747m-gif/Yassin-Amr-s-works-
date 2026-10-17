import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Vertical rhythm wrapper for a page section, with an optional anchor id. */
export function Section({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cn('relative py-20 md:py-28', className)} {...props} />;
}
