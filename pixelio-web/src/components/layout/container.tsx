import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Centre-aligned page gutter. Use `wide` for full-bleed strips. */
export function Container({ className, wide = false, ...props }: ComponentProps<'div'> & { wide?: boolean }) {
  return (
    <div
      className={cn('mx-auto w-full px-6 md:px-8', wide ? 'max-w-[1600px]' : 'max-w-6xl', className)}
      {...props}
    />
  );
}
