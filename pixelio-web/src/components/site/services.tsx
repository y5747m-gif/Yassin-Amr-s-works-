/* “The Flood” — animated wave layers and rising bubbles behind the service
   cards, each with its own WhatsApp order button, followed by the three
   counter-scrolling keyword streams.
   Ported from views/sections.js (ns.services) + app.js (buildServices /
   buildBubbles). */

import { useMemo, type CSSProperties } from 'react';
import { Editable } from '@/components/site/editable';
import { Streams } from '@/components/site/marquee';
import { ServiceGlyph, WhatsAppIcon } from '@/lib/pixelio/icons';
import { waLink } from '@/lib/pixelio/contacts';
import { baseText, isLowEndDevice, type ListItem } from '@/lib/pixelio/content';
import type { ServiceItem } from '@/lib/pixelio/dictionary';
import { useSite } from '@/site/site-context';

const FLOOD_WAVES = [
  'M0 120 C 180 40 360 200 720 120 C 1080 40 1260 200 1440 120 L1440 220 L0 220 Z',
  'M0 140 C 200 60 420 210 720 140 C 1020 70 1240 210 1440 140 L1440 220 L0 220 Z',
  'M0 160 C 240 100 460 220 720 160 C 980 100 1200 220 1440 160 L1440 220 L0 220 Z',
];

const asService = (item: ListItem): ServiceItem =>
  typeof item === 'string' ? { t: item, d: '' } : item;

export function Services() {
  const { t, lang, list, contacts } = useSite();
  const main = contacts[0];
  const items = list('services.items').map(asService);
  const defaults = (baseText(lang, 'services.items') as ServiceItem[] | undefined) ?? [];
  const orderLabel = t('services.order');
  const orderDefaultRaw = baseText(lang, 'services.order') ?? baseText('en', 'services.order') ?? '';
  const orderDefault = typeof orderDefaultRaw === 'string' ? orderDefaultRaw : '';

  /* The bubbles are random once per page load, exactly like buildBubbles(). */
  const bubbles = useMemo(() => {
    const count = isLowEndDevice() || window.innerWidth < 640 ? 7 : 14;
    return Array.from({ length: count }, () => {
      const size = 6 + Math.random() * 26;
      return {
        start: (Math.random() * 100).toFixed(1),
        size: size.toFixed(0),
        duration: (7 + Math.random() * 9).toFixed(1),
        delay: (Math.random() * 9).toFixed(1),
      };
    });
  }, []);

  return (
    <section className="flood section" id="services">
      <div className="flood-waves" aria-hidden="true">
        {FLOOD_WAVES.map((d, i) => (
          <svg
            key={`w${i + 1}`}
            className={`wave w${i + 1}`}
            viewBox="0 0 1440 220"
            preserveAspectRatio="none"
          >
            <path d={d} />
          </svg>
        ))}
        <div className="bubbles" id="bubbles">
          {bubbles.map((b, i) => (
            <span
              key={i}
              className="bubble"
              style={
                {
                  insetInlineStart: `${b.start}%`,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  animationDuration: `${b.duration}s`,
                  animationDelay: `${b.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>

      <div className="section-head reveal">
        <Editable k="services.kicker" as="p" className="section-kicker" />
        <Editable k="services.title" html as="h2" className="section-title" />
        <Editable k="services.sub" as="p" className="section-sub" />
      </div>

      <div className="flood-grid" id="services-grid">
        {items.map((s, i) => {
          const msg = String(t('services.orderMsg')).replace('{s}', s.t);
          return (
            <article
              className="svc"
              key={`${i}-${s.t}`}
              style={
                {
                  '--rd': `${(i % 4) * 90 + Math.floor(i / 4) * 120}ms`,
                  '--rot': `${i % 2 ? 2 : -2}deg`,
                } as CSSProperties
              }
            >
              <span className="svc-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="svc-icon" aria-hidden="true">
                <ServiceGlyph index={i} />
              </span>
              <Editable
                as="h3"
                path={`services.items.${i}.t`}
                scope={lang}
                defaultValue={defaults[i]?.t ?? ''}
              >
                {s.t}
              </Editable>
              <Editable
                as="p"
                path={`services.items.${i}.d`}
                scope={lang}
                defaultValue={defaults[i]?.d ?? ''}
              >
                {s.d}
              </Editable>
              <a
                className="svc-order"
                data-msg={msg}
                href={waLink(main ? main.e164 : '', msg)}
                target="_blank"
                rel="noopener"
              >
                <WhatsAppIcon size={15} />
                <Editable path="services.order" scope={lang} defaultValue={orderDefault}>
                  {orderLabel}
                </Editable>
              </a>
            </article>
          );
        })}
      </div>

      <div className="flood-cta reveal">
        <a
          className="btn btn-grad btn-lg"
          id="services-order-btn"
          href={main ? waLink(main.e164, t('hero.orderMsg')) : '#'}
          target="_blank"
          rel="noopener"
        >
          <WhatsAppIcon size={18} />
          <Editable k="services.orderCta" />
          <span className="btn-arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>

      <Streams />
    </section>
  );
}
