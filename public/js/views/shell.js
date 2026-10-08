/* ==========================================================================
   views/shell.js — the page frame, built entirely by JavaScript.

   index.html only holds the <head> (search-engine and link-preview metadata,
   the stylesheet), a <noscript> notice and an empty #app mount point. app.js calls
   PixelioViews.page(ctx) once at start-up, mounts the returned markup into
   #app and then wires up behaviour exactly as before.

   Every view is a plain function that returns an HTML string, so the page can
   be produced (and tested) without a browser.

     ctx.t         translation lookup (built-in I18N + owner overrides)
     ctx.lang      'en' | 'ar'
     ctx.contacts  effective phone list: [{ display, e164, … }]

   txt()  – escaped plain text (for data-i18n nodes)
   rich() – trusted inline markup (for data-i18n-html nodes, e.g. <span class="grad">)

   Load order (index.html): shell.js → sections.js → dialogs.js → app.js
   ========================================================================== */

(function (ns) {
  'use strict';

  /* ------------------------------- helpers ------------------------------- */

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  const txt = (ctx, key) => esc(ctx.t(key));
  const rich = (ctx, key) => ctx.t(key);

  /** WhatsApp deep link, optionally with a prefilled message. */
  function waLink(e164, msg) {
    return `https://wa.me/${e164}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
  }

  const WA_PATH =
    'M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2zm0 18.06h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.05-.2-.31a8.22 8.22 0 0 1-1.26-4.39c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.25-8.24 8.25zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07s.9 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28z';

  /** Shared glyphs. */
  const icons = {
    wa: (size) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${WA_PATH}"/></svg>`,
  };

  Object.assign(ns, { esc, txt, rich, waLink, icons });

  /* ------------------------------ intro splash ----------------------------- */

  ns.intro = function (ctx) {
    const letters = 'PIXELIO'
      .split('')
      .map((ch, i) => `<span class="il" style="--i:${i}">${ch}</span>`)
      .join('');
    return `
<div class="intro" id="intro" role="presentation">
  <canvas class="intro-particles" id="intro-particles" aria-hidden="true"></canvas>
  <div class="intro-rings" aria-hidden="true">${'<span></span>'.repeat(3)}</div>

  <div class="intro-stage">
    <div class="intro-logo" aria-label="Pixelio">
      ${letters}
      <span class="intro-sweep" aria-hidden="true"></span>
    </div>
    <div class="intro-word">
      <span class="intro-designer">STUDIO</span>
      <span class="intro-line" aria-hidden="true"></span>
    </div>
    <p class="intro-tag" id="intro-tag">${txt(ctx, 'intro.tag')}</p>
  </div>

  <div class="intro-bars" aria-hidden="true">${'<i></i>'.repeat(6)}</div>
  <button class="intro-skip" id="intro-skip" type="button">${txt(ctx, 'intro.skip')}</button>
  <div class="intro-progress" aria-hidden="true"><i></i></div>
</div>`;
  };

  /* ---------------------------- ambient background ------------------------- */

  const BG_CURVES = [
    'M-40 210 C 320 90 700 330 1100 180 C 1280 112 1380 140 1480 112',
    'M-40 330 C 300 210 760 470 1140 300 C 1300 228 1390 262 1480 232',
    'M-40 640 C 340 540 720 790 1120 620 C 1290 548 1390 582 1480 552',
    'M-40 760 C 300 680 760 900 1160 730 C 1310 666 1400 692 1480 668',
  ];

  ns.background = function () {
    const glows = ['cyan', 'violet', 'pink'].map((c) => `<div class="glow glow-${c}"></div>`).join('');
    const curves = BG_CURVES.map((d) => `<path d="${d}"/>`).join('');
    return `
<div class="bg" aria-hidden="true">
  ${glows}
  <svg class="bg-curves" viewBox="0 0 1440 900" preserveAspectRatio="none">${curves}</svg>
  <div class="grid-lines"></div>
  <div class="noise"></div>
</div>`;
  };

  // The cursor aura and the glass-cube field are filled in by app.js.
  ns.cursorAura = () => '<div class="cursor-aura" id="cursor-aura" aria-hidden="true"></div>';
  ns.cubeField = () => '<div class="cube-field" id="cube-field" aria-hidden="true"></div>';

  ns.pxDefs = () => `
<svg class="px-defs" aria-hidden="true" focusable="false" width="0" height="0">
  <defs>
    <linearGradient id="pxGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#168cff"/><stop offset=".55" stop-color="#6c3bff"/><stop offset="1" stop-color="#e83baf"/>
    </linearGradient>
  </defs>
</svg>`;

  /* -------------------------------- navigation ----------------------------- */

  const NAV_LINKS = [
    { key: 'nav.services', href: '#services' },
    { key: 'nav.work', href: '#work' },
    { key: 'nav.about', href: '#about' },
    { key: 'nav.contact', href: '#contact' },
  ];

  ns.nav = function (ctx) {
    const links = NAV_LINKS
      .map(({ key, href }) => `<a href="${href}" data-i18n="${key}">${txt(ctx, key)}</a>`)
      .join('');
    const langButton = (code, label) =>
      `<button type="button" data-lang="${code}"${ctx.lang === code ? ' class="active"' : ''}>${label}</button>`;

    return `
<header class="nav" id="nav">
  <a class="brand" href="#top" aria-label="Pixelio — home">
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48" width="26" height="26" fill="none">
        <defs>
          <linearGradient id="bm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#25c7ff"/><stop offset=".55" stop-color="#6c3bff"/><stop offset="1" stop-color="#e83baf"/>
          </linearGradient>
        </defs>
        <rect x="6" y="18" width="16" height="16" rx="3.5" fill="url(#bm)" opacity=".22"/>
        <rect x="6" y="18" width="16" height="16" rx="3.5" stroke="url(#bm)" stroke-width="2"/>
        <rect x="24" y="8" width="18" height="18" rx="4" fill="url(#bm)" opacity=".14"/>
        <rect x="24" y="8" width="18" height="18" rx="4" stroke="url(#bm)" stroke-width="2"/>
        <rect x="18" y="30" width="12" height="12" rx="3" stroke="url(#bm)" stroke-width="2" opacity=".75"/>
      </svg>
    </span>
    <span class="brand-name" data-i18n-html="brand.name">${rich(ctx, 'brand.name')}</span>
  </a>

  <nav class="nav-links" aria-label="Primary">${links}</nav>

  <div class="nav-right">
    <div class="lang-toggle" dir="ltr" role="group" aria-label="Language" data-active="${ctx.lang}">
      <span class="lang-thumb" aria-hidden="true"></span>
      ${langButton('en', 'EN')}
      ${langButton('ar', 'عربي')}
    </div>
    <button class="owner-btn" id="owner-btn" type="button" data-i18n-title="owner.open" title="${txt(ctx, 'owner.open')}">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <span class="owner-btn-label" id="owner-btn-label" data-i18n="owner.btn" data-no-edit>${txt(ctx, 'owner.btn')}</span>
      <span class="owner-dot" id="owner-dot" hidden aria-hidden="true"></span>
    </button>
    <button class="burger" id="burger" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>
  </div>
</header>`;
  };

  /* ------------------------- floating button & feedback -------------------- */

  ns.waFab = function (ctx) {
    const main = ctx.contacts[0];
    return `
<a class="wa-fab" id="wa-fab-link" href="https://wa.me/${main.e164}" target="_blank" rel="noopener" aria-label="WhatsApp">
  ${icons.wa(26)}
  <span class="wa-pulse" aria-hidden="true"></span>
</a>`;
  };

  ns.toast = () => '<div class="toast" id="toast" role="status" aria-live="polite"></div>';

  /* ---------------------------------- page -------------------------------- */

  /** The complete page, in document order. */
  ns.page = function (ctx) {
    return [
      ns.cursorAura(),
      ns.intro(ctx),
      ns.background(),
      ns.cubeField(),
      ns.pxDefs(),
      ns.nav(ctx),
      ns.main(ctx),
      ns.waFab(ctx),
      ns.loginModal(ctx),
      ns.projectModal(ctx),
      ns.toast(),
    ].join('');
  };
})((window.PixelioViews = window.PixelioViews || {}));
