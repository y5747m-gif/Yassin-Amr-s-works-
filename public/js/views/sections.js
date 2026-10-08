/* ==========================================================================
   views/sections.js — the <main> sections of the page: hero, marquee,
   services ("the flood"), portfolio, about, contact and the footer.

   Lists that depend on live data (service cards, portfolio cards, contact
   cards, tags, marquee/stream words, showcase screens, bubbles) are rendered
   as empty containers here and filled by app.js after mounting.
   ========================================================================== */

(function (ns) {
  'use strict';

  /* Helpers come from shell.js; they are looked up when a view runs, so the
     file order of the views does not matter. */

  const PHONE_ICON =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18.5h2"/></svg>';
  const LAPTOP_ICON =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/></svg>';

  /* ---------------------------------- hero -------------------------------- */

  ns.hero = function (ctx) {
    const { esc, txt, rich, icons, waLink } = ns;
    const main = ctx.contacts[0];
    const orderHref = waLink(main.e164, ctx.t('hero.orderMsg'));

    return `
<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow reveal"><span class="eyebrow-dot" aria-hidden="true"></span><span data-i18n="hero.eyebrow">${txt(ctx, 'hero.eyebrow')}</span></p>

    <h1 class="hero-title reveal" data-delay="80">
      <span class="hero-brand" data-i18n-html="hero.title">${rich(ctx, 'hero.title')}</span>
    </h1>

    <p class="hero-sub reveal" data-delay="160" data-i18n="hero.sub">${txt(ctx, 'hero.sub')}</p>

    <div class="hero-cta reveal" data-delay="240">
      <a class="btn btn-grad" id="hero-order-link" href="${esc(orderHref)}" target="_blank" rel="noopener">
        ${icons.wa(18)}
        <span data-i18n="hero.order">${txt(ctx, 'hero.order')}</span>
        <span class="btn-arrow" aria-hidden="true">→</span>
      </a>
      <a class="btn btn-ghost" href="#work"><span data-i18n="hero.cta1">${txt(ctx, 'hero.cta1')}</span></a>
    </div>

    <div class="stats reveal" data-delay="320">
      <div class="stat"><strong id="stat-projects">0</strong><span data-i18n="stat.projects">${txt(ctx, 'stat.projects')}</span></div>
      <div class="stat-sep" aria-hidden="true"></div>
      <div class="stat"><strong data-i18n="stat.services">${txt(ctx, 'stat.services')}</strong><span data-i18n="stat.services-label">${txt(ctx, 'stat.services-label')}</span></div>
      <div class="stat-sep" aria-hidden="true"></div>
      <div class="stat"><strong data-i18n="stat.support">${txt(ctx, 'stat.support')}</strong><span data-i18n="stat.support-label">${txt(ctx, 'stat.support-label')}</span></div>
    </div>
  </div>

  <!-- floating 3D device showcase -->
  <div class="hero-device reveal" data-delay="200" id="hero-visual">
    <div class="hero-3d-scene" aria-hidden="true">
      <span class="orb orb-a"></span>
      <span class="orb orb-b"></span>
      <span class="glass-cube cube-a">${'<i></i>'.repeat(6)}</span>
      <span class="glass-cube cube-b">${'<i></i>'.repeat(6)}</span>
      <span class="orbit orbit-a"><b></b></span>
      <span class="orbit orbit-b"><b></b></span>
      <span class="spark s1">✦</span><span class="spark s2">✦</span><span class="spark s3">✦</span>
    </div>

    <div class="device-switch" role="group" aria-label="View mode">
      <button type="button" data-device="phone" class="active" data-i18n-title="device.phone" title="${txt(ctx, 'device.phone')}">${PHONE_ICON}</button>
      <button type="button" data-device="laptop" data-i18n-title="device.laptop" title="${txt(ctx, 'device.laptop')}">${LAPTOP_ICON}</button>
    </div>

    <div class="device device-lg float" id="hero-frame" data-mode="phone">
      <div class="device-glow" aria-hidden="true"></div>
      <div class="device-body">
        <span class="notch" aria-hidden="true"></span>
        <span class="cam" aria-hidden="true"></span>
        <div class="device-screen">
          <div class="screen-stack" id="hero-stack"></div>
          <span class="screen-shine" aria-hidden="true"></span>
        </div>
      </div>
      <div class="device-base" aria-hidden="true"><span></span></div>
      <div class="device-shadow" aria-hidden="true"></div>
    </div>

    <div class="device-dots" id="hero-dots" role="tablist" aria-label="Showcase"></div>
  </div>

  <a class="scroll-cue" href="#services" aria-label="Scroll"><span></span></a>
</section>`;
  };

  /* -------------------------------- marquee ------------------------------- */

  // The scrolling words are filled by app.js (buildMarquee).
  ns.marquee = () =>
    '<div class="marquee" aria-hidden="true"><div class="marquee-track" id="marquee-track"></div></div>';

  /* ---------------------------- services (flood) -------------------------- */

  const FLOOD_WAVES = [
    'M0 120 C 180 40 360 200 720 120 C 1080 40 1260 200 1440 120 L1440 220 L0 220 Z',
    'M0 140 C 200 60 420 210 720 140 C 1020 70 1240 210 1440 140 L1440 220 L0 220 Z',
    'M0 160 C 240 100 460 220 720 160 C 980 100 1200 220 1440 160 L1440 220 L0 220 Z',
  ];

  ns.services = function (ctx) {
    const { esc, txt, rich, icons, waLink } = ns;
    const main = ctx.contacts[0];
    const waves = FLOOD_WAVES
      .map((d, i) => `<svg class="wave w${i + 1}" viewBox="0 0 1440 220" preserveAspectRatio="none"><path d="${d}"/></svg>`)
      .join('');

    return `
<section class="flood section" id="services">
  <div class="flood-waves" aria-hidden="true">
    ${waves}
    <div class="bubbles" id="bubbles"></div>
  </div>

  <div class="section-head reveal">
    <p class="section-kicker" data-i18n="services.kicker">${txt(ctx, 'services.kicker')}</p>
    <h2 class="section-title" data-i18n-html="services.title">${rich(ctx, 'services.title')}</h2>
    <p class="section-sub" data-i18n="services.sub">${txt(ctx, 'services.sub')}</p>
  </div>

  <div class="flood-grid" id="services-grid"></div>

  <div class="flood-cta reveal">
    <a class="btn btn-grad btn-lg" id="services-order-btn" href="${esc(waLink(main.e164, ctx.t('hero.orderMsg')))}" target="_blank" rel="noopener">
      ${icons.wa(18)}
      <span data-i18n="services.orderCta">${txt(ctx, 'services.orderCta')}</span>
      <span class="btn-arrow" aria-hidden="true">→</span>
    </a>
  </div>

  <div class="flood-stream" aria-hidden="true">
    <div class="stream-row"><div class="stream-track" data-dir="ltr"></div></div>
    <div class="stream-row"><div class="stream-track" data-dir="rtl"></div></div>
    <div class="stream-row"><div class="stream-track" data-dir="ltr"></div></div>
  </div>
</section>`;
  };

  /* -------------------------------- portfolio ----------------------------- */

  ns.work = function (ctx) {
    const { txt, rich } = ns;
    return `
<section class="work section" id="work">
  <div class="section-head reveal">
    <p class="section-kicker" data-i18n="work.kicker">${txt(ctx, 'work.kicker')}</p>
    <h2 class="section-title" data-i18n-html="work.title">${rich(ctx, 'work.title')}</h2>
    <p class="section-sub" data-i18n="work.sub">${txt(ctx, 'work.sub')}</p>
  </div>

  <!-- owner-only composer -->
  <div class="owner-panel" id="owner-panel" hidden>
    <div class="owner-panel-head">
      <span class="owner-chip"><span class="owner-live" aria-hidden="true"></span><span data-i18n="owner.signedIn">${txt(ctx, 'owner.signedIn')}</span></span>
      <div class="owner-panel-actions">
        <button class="btn-mini btn-edit-toggle" type="button" id="edit-toggle-btn" data-i18n="owner.editOn" data-no-edit>${txt(ctx, 'owner.editOn')}</button>
        <button class="btn-mini" type="button" id="logout-btn" data-i18n="owner.logout" data-no-edit>${txt(ctx, 'owner.logout')}</button>
      </div>
    </div>
    <p class="hint edit-hint" id="edit-hint" hidden data-i18n="owner.editHint">${txt(ctx, 'owner.editHint')}</p>

    <form class="add-bar" id="add-form">
      <label class="add-input">
        <span class="add-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </span>
        <input type="text" id="url-input" name="url" autocomplete="off" spellcheck="false" placeholder="${txt(ctx, 'form.placeholder')}" data-i18n-ph="form.placeholder">
      </label>
      <button class="btn btn-grad add-btn" type="submit" id="add-btn">
        <span class="spinner" id="add-spinner" hidden aria-hidden="true"></span>
        <span id="add-label" data-i18n="form.btn">${txt(ctx, 'form.btn')}</span>
      </button>
    </form>
    <p class="hint" data-i18n="form.hint">${txt(ctx, 'form.hint')}</p>

    <details class="owner-settings" id="owner-settings">
      <summary data-i18n="owner.moreSettings">${txt(ctx, 'owner.moreSettings')}</summary>
      <div class="owner-settings-body" id="owner-settings-body"></div>
    </details>
  </div>

  <div class="work-grid" id="grid"></div>

  <div class="empty" id="empty" hidden>
    <div class="empty-art" aria-hidden="true">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/><circle cx="6.5" cy="6.5" r=".6" fill="currentColor"/><circle cx="9" cy="6.5" r=".6" fill="currentColor"/></svg>
    </div>
    <h3 data-i18n="empty.title">${txt(ctx, 'empty.title')}</h3>
    <p data-i18n="empty.sub">${txt(ctx, 'empty.sub')}</p>
  </div>
</section>`;
  };

  /* ---------------------------------- about ------------------------------- */

  ns.about = function (ctx) {
    const { txt } = ns;
    return `
<section class="about section" id="about">
  <div class="about-card reveal">
    <div class="about-glow" aria-hidden="true"></div>
    <div class="about-logo" aria-hidden="true">Pixelio</div>
    <p class="section-kicker" data-i18n="about.kicker">${txt(ctx, 'about.kicker')}</p>
    <h2 class="section-title" data-i18n="about.title">${txt(ctx, 'about.title')}</h2>
    <p class="about-text" data-i18n="about.text">${txt(ctx, 'about.text')}</p>
    <ul class="tags" id="tags"></ul>
  </div>
</section>`;
  };

  /* ------------------------------ contact + footer ------------------------ */

  ns.contact = function (ctx) {
    const { esc, txt, rich } = ns;
    const phones = ctx.contacts.map((c) => c.display).join(' · ');

    return `
<section class="contact section" id="contact">
  <div class="contact-inner">
    <p class="section-kicker reveal" data-i18n="contact.kicker">${txt(ctx, 'contact.kicker')}</p>
    <h2 class="contact-title reveal" data-delay="70" data-i18n-html="contact.title">${rich(ctx, 'contact.title')}</h2>
    <p class="contact-sub reveal" data-delay="140" data-i18n="contact.sub">${txt(ctx, 'contact.sub')}</p>

    <div class="contact-cards" id="contact-cards"></div>

    <p class="contact-note reveal" data-delay="320" data-i18n="contact.note">${txt(ctx, 'contact.note')}</p>
  </div>

  <footer class="footer">
    <span data-i18n="footer.left">${txt(ctx, 'footer.left')}</span>
    <span class="footer-phones" id="footer-phones" dir="ltr">${esc(phones)}</span>
    <span data-i18n="footer.right">${txt(ctx, 'footer.right')}</span>
  </footer>
</section>`;
  };

  /* ---------------------------------- main -------------------------------- */

  ns.main = function (ctx) {
    return `
<main id="top">
  ${ns.hero(ctx)}
  ${ns.marquee()}
  ${ns.services(ctx)}
  ${ns.work(ctx)}
  ${ns.about(ctx)}
  ${ns.contact(ctx)}
</main>`;
  };
})((window.PixelioViews = window.PixelioViews || {}));
