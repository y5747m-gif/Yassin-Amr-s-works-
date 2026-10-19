/* The device frame every screen is shown in — a phone on mobile, a laptop on
   desktop — plus the preview image and the designed poster behind it.
   Ported from views/sections.js + app.js (cardTemplate / posterMarkup /
   captureGuard). The mode is chosen by the visitor and animates between
   phone and laptop instead of swapping images. */

import { useState, type CSSProperties, type ReactNode } from 'react';
import { posterAccent, posterInitial, projTitle } from '@/lib/pixelio/content';
import type { Lang } from '@/lib/pixelio/dictionary';
import type { DeviceMode, Project } from '@/lib/pixelio/types';
import { cn } from '@/lib/utils';

export interface DeviceProps {
  mode: DeviceMode;
  /** The hero frame is a size up: `.device-lg`. */
  large?: boolean;
  id?: string;
  /** Turns the screen itself into a link into the site. */
  href?: string;
  ariaLabel?: string;
  className?: string;
  /** Contents of `.screen-stack`. */
  children: ReactNode;
  /** Extra layer inside the screen (the “Enter site” chip). */
  overlay?: ReactNode;
}

export function Device({
  mode,
  large = false,
  id,
  href,
  ariaLabel,
  className,
  children,
  overlay,
}: DeviceProps) {
  const screen = (
    <>
      <div className="screen-stack">{children}</div>
      {overlay}
      <span className="screen-shine" aria-hidden="true" />
    </>
  );

  return (
    <div className={cn('device float', large && 'device-lg', className)} id={id} data-mode={mode}>
      <div className="device-glow" aria-hidden="true" />
      <div className="device-body">
        <span className="notch" aria-hidden="true" />
        <span className="cam" aria-hidden="true" />
        {href ? (
          <a className="device-screen" href={href} target="_blank" rel="noopener" aria-label={ariaLabel}>
            {screen}
          </a>
        ) : (
          <div className="device-screen">{screen}</div>
        )}
      </div>
      <div className="device-base" aria-hidden="true">
        <span />
      </div>
      <div className="device-shadow" aria-hidden="true" />
    </div>
  );
}

/** An image that drops itself when it fails — the poster behind stays visible. */
export function SafeImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [gone, setGone] = useState(false);
  if (gone || !src) return null;
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setGone(true)}
    />
  );
}

/**
 * A live-capture service answers with a small “generating…” placeholder while
 * it renders a page for the first time. Dropping such an image leaves the
 * designed poster visible instead of a grey box.
 */
export function PreviewImage({
  src,
  alt,
  capture = false,
  eager = false,
  className,
}: {
  src: string;
  alt: string;
  capture?: boolean;
  eager?: boolean;
  className?: string;
}) {
  const [gone, setGone] = useState(false);
  if (gone || !src) return null;
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      onLoad={(e) => {
        const img = e.currentTarget;
        if (capture && (img.naturalWidth < 600 || img.naturalHeight < 600)) setGone(true);
      }}
      onError={() => setGone(true)}
    />
  );
}

/** The designed poster that sits behind every preview: what a visitor sees
 *  before the screenshot arrives — and instead of it if it never does. */
export function Poster({ project, lang }: { project: Project; lang: Lang }) {
  const accent = posterAccent(project);
  return (
    <div
      className="shot-poster"
      style={accent ? ({ '--poster': accent } as CSSProperties) : undefined}
    >
      {project.favicon ? (
        <SafeImage src={project.favicon} alt="" className="poster-icon" />
      ) : (
        <span className="poster-letter">{posterInitial(project)}</span>
      )}
      <strong className="poster-title">{projTitle(project, lang)}</strong>
      <span className="poster-host" dir="ltr">
        {project.host || ''}
      </span>
    </div>
  );
}
