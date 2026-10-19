/* The hero — headline, stats and the floating device that shows the published
   project screens. Ported from views/sections.js (ns.hero) plus the showcase
   carousel from app.js (buildShowcase / goShot / startShowcase). */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Editable } from '@/components/site/editable';
import { Device, Poster, PreviewImage } from '@/components/site/device';
import { LaptopIcon, MobileIcon, WhatsAppIcon } from '@/lib/pixelio/icons';
import { waLink } from '@/lib/pixelio/contacts';
import { useCountUp } from '@/hooks/use-count-up';
import { useSite } from '@/site/site-context';
import { cn } from '@/lib/utils';

export function Hero() {
  const { t, lang, contacts, showcase, visible, deviceMode, setDeviceMode } = useSite();
  const main = contacts[0];
  const orderHref = main ? waLink(main.e164, t('hero.orderMsg')) : '#';
  const projects = useCountUp(visible.length);

  const heroRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [restart, setRestart] = useState(0);

  /* The carousel rebuilds (and restarts) whenever the set of screens changes. */
  const shotKey = useMemo(
    () =>
      showcase.length
        ? showcase.map((s) => `${s.cover ? 'cover' : 'pan'}:${s.src}:${s.url || ''}:${s.title || ''}`).join('|')
        : `empty:${t('showcase.empty')}`,
    [showcase, t],
  );

  useEffect(() => {
    setIndex(0);
  }, [shotKey]);

  useEffect(() => {
    if (showcase.length < 2) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (heroRef.current?.classList.contains('offscreen')) return;
      setIndex((i) => (i + 1) % showcase.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [showcase.length, shotKey, restart]);

  const goShot = (i: number) => {
    if (!showcase.length) return;
    setIndex((i + showcase.length) % showcase.length);
    setRestart((n) => n + 1);
  };

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-copy">
        <p className="eyebrow reveal">
          <span className="eyebrow-dot" aria-hidden="true" />
          <Editable k="hero.eyebrow" />
        </p>

        <h1 className="hero-title reveal" data-delay="80">
          <Editable k="hero.title" html as="span" className="hero-brand" />
        </h1>

        <Editable k="hero.sub" as="p" className="hero-sub reveal" delay={160} />

        <div className="hero-cta reveal" data-delay="240">
          <a className="btn btn-grad" id="hero-order-link" href={orderHref} target="_blank" rel="noopener">
            <WhatsAppIcon size={18} />
            <Editable k="hero.order" />
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </a>
          <a className="btn btn-ghost" href="#work">
            <Editable k="hero.cta1" />
          </a>
        </div>

        <div className="stats reveal" data-delay="320">
          <div className="stat">
            <strong id="stat-projects">{projects}</strong>
            <Editable k="stat.projects" />
          </div>
          <div className="stat-sep" aria-hidden="true" />
          <div className="stat">
            <Editable k="stat.services" as="strong" />
            <Editable k="stat.services-label" />
          </div>
          <div className="stat-sep" aria-hidden="true" />
          <div className="stat">
            <Editable k="stat.support" as="strong" />
            <Editable k="stat.support-label" />
          </div>
        </div>
      </div>

      {/* floating 3D device showcase */}
      <div className="hero-device reveal" data-delay="200" id="hero-visual">
        <div className="hero-3d-scene" aria-hidden="true">
          <span className="orb orb-a" />
          <span className="orb orb-b" />
          <span className="glass-cube cube-a">
            {Array.from({ length: 6 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
          <span className="glass-cube cube-b">
            {Array.from({ length: 6 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
          <span className="orbit orbit-a">
            <b />
          </span>
          <span className="orbit orbit-b">
            <b />
          </span>
          <span className="spark s1">✦</span>
          <span className="spark s2">✦</span>
          <span className="spark s3">✦</span>
        </div>

        <div className="device-switch" role="group" aria-label="View mode">
          <button
            type="button"
            data-device="phone"
            className={deviceMode === 'phone' ? 'active' : undefined}
            aria-pressed={deviceMode === 'phone'}
            data-i18n-title="device.phone"
            title={t('device.phone')}
            onClick={() => setDeviceMode('phone')}
          >
            <MobileIcon />
          </button>
          <button
            type="button"
            data-device="laptop"
            className={deviceMode === 'laptop' ? 'active' : undefined}
            aria-pressed={deviceMode === 'laptop'}
            data-i18n-title="device.laptop"
            title={t('device.laptop')}
            onClick={() => setDeviceMode('laptop')}
          >
            <LaptopIcon />
          </button>
        </div>

        <Device mode={deviceMode} large id="hero-frame">
          {showcase.length ? (
            showcase.map((shot, i) => {
              const inner = (
                <>
                  {shot.project ? <Poster project={shot.project} lang={lang} /> : null}
                  <PreviewImage
                    src={shot.src}
                    alt={shot.title || ''}
                    capture={shot.capture}
                    eager={i === 0}
                  />
                </>
              );
              const cls = cn('shot', shot.cover && 'cover', i === index && 'active');
              /* A screen that belongs to a portfolio entry is itself a way into the site. */
              return shot.url ? (
                <a
                  key={`${shot.src}-${i}`}
                  className={cls}
                  href={shot.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={shot.title || ''}
                >
                  {inner}
                </a>
              ) : (
                <div key={`${shot.src}-${i}`} className={cls}>
                  {inner}
                </div>
              );
            })
          ) : (
            <div className="showcase-empty">
              <span aria-hidden="true">✦</span>
              <p>{t('showcase.empty')}</p>
            </div>
          )}
        </Device>

        <div
          className="device-dots"
          id="hero-dots"
          role="tablist"
          aria-label="Showcase"
          hidden={!showcase.length}
        >
          {showcase.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              className={i === index ? 'active' : undefined}
              aria-label={`Screen ${i + 1}`}
              onClick={() => goShot(i)}
            />
          ))}
        </div>
      </div>

      <a className="scroll-cue" href="#services" aria-label="Scroll">
        <span />
      </a>
    </section>
  );
}
