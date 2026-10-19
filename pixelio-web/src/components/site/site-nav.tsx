/* The sticky navigation — brand mark, section links, the EN/عربي switch with
   its sliding thumb, the owner button and the burger.
   Ported from views/shell.js (ns.nav) + app.js (bindEvents). */

import { useEffect, useState } from 'react';
import { BrandMark, LockIcon } from '@/lib/pixelio/icons';
import { useSite } from '@/site/site-context';
import { Editable } from '@/components/site/editable';

const NAV_LINKS = [
  { key: 'nav.services', href: '#services' },
  { key: 'nav.work', href: '#work' },
  { key: 'nav.about', href: '#about' },
  { key: 'nav.contact', href: '#contact' },
];

export function SiteNav() {
  const { lang, setLang, isOwner, t, openLogin } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* nav scroll state (only mutate DOM when the scrolled state flips) */
  useEffect(() => {
    let last: boolean | null = null;
    const onScroll = () => {
      const next = window.scrollY > 24;
      if (next !== last) {
        last = next;
        setScrolled(next);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onOwnerClick = () => {
    if (isOwner) {
      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    openLogin();
  };

  const pick = (next: 'en' | 'ar') => {
    if (next === lang) return;
    setLang(next, { animate: true });
  };

  return (
    <header className={scrolled ? 'nav scrolled' : 'nav'} id="nav">
      <a className="brand" href="#top" aria-label="Pixelio — home">
        <span className="brand-mark" aria-hidden="true">
          <BrandMark />
        </span>
        <Editable k="brand.name" html as="span" className="brand-name" />
      </a>

      <nav
        className={menuOpen ? 'nav-links open' : 'nav-links'}
        aria-label="Primary"
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName === 'A') setMenuOpen(false);
        }}
      >
        {NAV_LINKS.map(({ key, href }) => (
          <Editable key={key} k={key} as="a" href={href} />
        ))}
      </nav>

      <div className="nav-right">
        <div className="lang-toggle" dir="ltr" role="group" aria-label="Language" data-active={lang}>
          <span className="lang-thumb" aria-hidden="true" />
          <button
            type="button"
            data-lang="en"
            className={lang === 'en' ? 'active' : undefined}
            onClick={() => pick('en')}
          >
            EN
          </button>
          <button
            type="button"
            data-lang="ar"
            className={lang === 'ar' ? 'active' : undefined}
            onClick={() => pick('ar')}
          >
            عربي
          </button>
        </div>

        <button
          className={isOwner ? 'owner-btn is-owner' : 'owner-btn'}
          id="owner-btn"
          type="button"
          data-i18n-title="owner.open"
          title={t('owner.open')}
          onClick={onOwnerClick}
        >
          <LockIcon size={17} />
          <span className="owner-btn-label" id="owner-btn-label" data-i18n="owner.btn" data-no-edit="">
            {isOwner ? t('owner.signedIn').split('—')[0].trim() : t('owner.btn')}
          </span>
          <span className="owner-dot" id="owner-dot" hidden={!isOwner} aria-hidden="true" />
        </button>

        <button
          className="burger"
          id="burger"
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i />
          <i />
          <i />
        </button>
      </div>
    </header>
  );
}
