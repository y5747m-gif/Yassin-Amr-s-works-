/* Renders the built single-file app in jsdom and checks that the React port
   produces the same structure the vanilla page did. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const here = path.dirname(fileURLToPath(import.meta.url));
const FILE = process.argv[2] || path.join(here, '..', 'dist', 'index.html');
let html = fs.readFileSync(FILE, 'utf8');

/* jsdom runs classic scripts only, and an inline classic script in <head>
   would execute before <body> exists (module scripts are deferred, which is
   why the browser build works). Move the bundle to the end of <body>. */
const bundle = html.match(/<script type="module" crossorigin>([\s\S]*?)<\/script>/);
if (!bundle) {
  console.error('could not find the inlined app bundle in', FILE);
  process.exit(1);
}
html = html.replace(bundle[0], '').replace('</body>', `<script>${bundle[1]}</script></body>`);

const virtualConsole = new VirtualConsole();
const errors = [];
virtualConsole.on('jsdomError', (e) => {
  if (/getContext|not implemented/i.test(e.message)) return; // canvas in jsdom
  errors.push(e.message);
});
virtualConsole.on('error', (...args) => errors.push(args.join(' ')));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'http://localhost:5173/',
  virtualConsole,
  beforeParse(window) {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    });
    window.scrollTo = () => {};
    window.Element.prototype.scrollIntoView = () => {};
    window.fetch = () => Promise.reject(new Error('offline in test'));
  },
});

const { window } = dom;
const { document } = window;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function check(label, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? ` — ${extra}` : ''}`);
  return ok;
}

(async () => {
  await wait(600);

  const q = (s) => document.querySelector(s);
  const qa = (s) => Array.from(document.querySelectorAll(s));
  let failures = 0;
  const ok = (label, condition, extra) => {
    if (!check(label, condition, extra)) failures++;
  };

  ok('page mounted into #app', q('#app') && q('#app').children.length > 3, `${q('#app')?.children.length} children`);
  ok('html lang/dir', document.documentElement.lang === 'en' && document.documentElement.dir === 'ltr');
  ok('document title from the dictionary', document.title.startsWith('Pixelio'), document.title);
  ok('intro splash', Boolean(q('#intro')));
  ok('intro letters', qa('#intro .il').length === 7, `${qa('#intro .il').length}`);
  ok('background layers', qa('.bg .glow').length === 3 && Boolean(q('.bg-curves')) && Boolean(q('.grid-lines')) && Boolean(q('.noise')));
  ok('cube field', qa('#cube-field .pcube').length > 0, `${qa('#cube-field .pcube').length} cubes, ${qa('#cube-field .particle').length} particles`);
  ok('cursor aura + px defs', Boolean(q('#cursor-aura')) && Boolean(q('#pxGrad')));

  /* nav */
  ok('nav', Boolean(q('header.nav#nav')));
  ok('brand mark + name', Boolean(q('.brand .brand-mark svg')) && q('.brand-name').textContent.length > 0, q('.brand-name')?.textContent);
  ok('nav links', qa('.nav-links a').length === 4);
  ok('lang toggle', qa('.lang-toggle button').length === 2 && q('.lang-toggle').dataset.active === 'en');
  ok('owner button + burger', Boolean(q('#owner-btn')) && Boolean(q('#burger')));

  /* hero */
  ok('hero title', Boolean(q('.hero-title .hero-brand')?.innerHTML.includes('grad')), q('.hero-title')?.textContent?.slice(0, 40));
  ok('hero sub + eyebrow', Boolean(q('.hero-sub')) && Boolean(q('.eyebrow .eyebrow-dot')));
  ok('hero CTAs', qa('.hero-cta .btn').length === 2 && q('#hero-order-link').href.startsWith('https://wa.me/20'), q('#hero-order-link')?.href);
  ok('stats', qa('.stats .stat').length === 3 && Boolean(q('#stat-projects')));
  ok('hero device', Boolean(q('#hero-frame.device.device-lg')) && q('#hero-frame').dataset.mode === 'phone');
  ok('hero 3d scene', qa('.hero-3d-scene .glass-cube').length === 2 && qa('.hero-3d-scene .orb').length === 2 && qa('.hero-3d-scene .spark').length === 3);
  ok('device switch', qa('.device-switch button').length === 2 && q('.device-switch button[data-device="phone"]').classList.contains('active'));
  const shots = qa('#hero-frame .screen-stack .shot');
  ok('hero showcase screens', shots.length > 0 && shots[0].classList.contains('active'), `${shots.length} screens`);
  ok('showcase screen is a link with a poster', shots[0]?.tagName === 'A' && Boolean(shots[0]?.querySelector('.shot-poster')), shots[0]?.getAttribute('href'));
  ok('showcase dots', qa('#hero-dots button').length === shots.length && q('#hero-dots button')?.classList.contains('active'), `${qa('#hero-dots button').length}`);
  ok('scroll cue', Boolean(q('.scroll-cue')));

  /* marquee */
  ok('marquee doubled track', qa('#marquee-track .marquee-item').length === 20, `${qa('#marquee-track .marquee-item').length}`);

  /* the flood */
  ok('services section', Boolean(q('section.flood#services')));
  ok('waves', qa('.flood-waves svg.wave').length === 3);
  ok('bubbles', qa('#bubbles .bubble').length >= 7, `${qa('#bubbles .bubble').length}`);
  ok('service cards', qa('#services-grid .svc').length === 12, `${qa('#services-grid .svc').length}`);
  ok('service card anatomy', Boolean(q('#services-grid .svc .svc-num')) && Boolean(q('#services-grid .svc .svc-icon svg path')) && Boolean(q('#services-grid .svc .svc-order')));
  ok('service order links', Boolean(q('#services-grid .svc .svc-order')?.getAttribute('href')?.includes('wa.me')), q('#services-grid .svc .svc-order')?.getAttribute('href'));
  ok('streams', qa('.flood-stream .stream-track').length === 3 && qa('.flood-stream .stream-chip').length > 30, `${qa('.flood-stream .stream-chip').length} chips`);
  ok('flood CTA', Boolean(q('#services-order-btn')));

  /* work */
  const cards = qa('#grid .work-card');
  ok('portfolio cards', cards.length === 11, `${cards.length}`);
  ok('card is builtin', Boolean(cards[0]?.classList.contains('is-builtin')) && cards[0]?.dataset.builtin === '1');
  ok('card device + screen link', Boolean(cards[0]?.querySelector('.device .device-screen')) && cards[0]?.querySelector('.device-screen')?.tagName === 'A');
  ok('card poster', Boolean(cards[0]?.querySelector('.shot-poster .poster-title')) && Boolean(cards[0]?.querySelector('.shot-poster .poster-host')));
  ok('card preview image', Boolean(cards[0]?.querySelector('.shot-img')), cards[0]?.querySelector('.shot-img')?.getAttribute('src')?.slice(0, 50));
  ok('card enter chip + button', Boolean(cards[0]?.querySelector('.screen-enter')) && Boolean(cards[0]?.querySelector('.btn-enter')));
  ok('card host + title link', (cards[0]?.querySelector('.work-host')?.textContent.length ?? 0) > 3 && Boolean(cards[0]?.querySelector('.work-title a')?.href.startsWith('http')));
  ok('empty state hidden', Boolean(q('#empty')?.hasAttribute('hidden')));
  ok('owner panel hidden', Boolean(q('#owner-panel')?.hasAttribute('hidden')));

  /* about + contact */
  ok('about card', Boolean(q('.about-card .about-logo')) && Boolean(q('.about-card .about-text')));
  ok('about tags', qa('#tags li').length === 8, `${qa('#tags li').length}`);
  ok('contact cards', qa('#contact-cards .contact-card').length === 2);
  ok('contact actions', qa('#contact-cards .cc-actions .btn').length === 6);
  ok('contact number link', q('.cc-num')?.getAttribute('href') === 'tel:+201141362626', q('.cc-num')?.getAttribute('href'));
  ok('footer phones', Boolean(q('#footer-phones')?.textContent.includes('0114 136 2626')), q('#footer-phones')?.textContent);

  /* floating bits */
  ok('whatsapp fab', q('#wa-fab-link')?.href === 'https://wa.me/201141362626', q('#wa-fab-link')?.href);
  ok('toast present', Boolean(q('#toast')));
  ok('modals start hidden', Boolean(q('#login-modal')?.hasAttribute('hidden')) && Boolean(q('#project-modal')?.hasAttribute('hidden')));
  ok('body locked during intro', document.body.classList.contains('locked'));

  /* reveals: no IntersectionObserver in jsdom → everything gets .in */
  ok('reveals resolved', qa('.reveal:not(.in)').length === 0 && qa('.svc:not(.in)').length === 0, `${qa('.reveal.in').length} revealed`);

  /* --- switch to Arabic ------------------------------------------------- */
  const arButton = q('.lang-toggle button[data-lang="ar"]');
  arButton?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(120);
  ok('arabic: dir + lang', document.documentElement.dir === 'rtl' && document.documentElement.lang === 'ar');
  ok('arabic: active thumb', q('.lang-toggle').dataset.active === 'ar' && arButton.classList.contains('active'));
  ok('arabic: copy swapped', Boolean(qa('#services-grid .svc h3')[0]?.textContent.includes('الجرافيك')), qa('#services-grid .svc h3')[0]?.textContent);
  ok('arabic: marquee swapped', Boolean(q('#marquee-track .marquee-item span')?.textContent.includes('تصميم')), q('#marquee-track .marquee-item span')?.textContent);
  ok('arabic: tags swapped', Boolean(q('#tags li')?.textContent.includes('جرافيك')), q('#tags li')?.textContent);
  ok('arabic: card title swapped', Boolean(q('#grid .work-card .poster-title')?.textContent.includes('نينجاوي')), q('#grid .work-card .poster-title')?.textContent);
  ok('arabic: enter label', Boolean(q('#grid .work-card .btn-enter span')?.textContent.includes('دخول')), q('#grid .work-card .btn-enter span')?.textContent);
  ok('arabic: persisted', window.localStorage.getItem('twe-lang') === 'ar');

  /* --- device switch ---------------------------------------------------- */
  q('.device-switch button[data-device="laptop"]')?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(60);
  ok('laptop mode applied everywhere', document.documentElement.dataset.deviceMode === 'laptop' && qa('.device[data-mode="laptop"]').length === qa('.device').length, `${qa('.device[data-mode="laptop"]').length}/${qa('.device').length}`);
  ok('device choice persisted', window.localStorage.getItem('twe-device') === 'laptop');

  /* --- intro closes ------------------------------------------------------ */
  q('#intro-skip')?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(850);
  ok('intro removed + unlocked', !q('#intro') && !document.body.classList.contains('locked'));
  ok('intro seen flag', window.sessionStorage.getItem('twe-intro-seen') === '1');

  /* --- owner login dialog ------------------------------------------------ */
  q('#owner-btn')?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(80);
  ok('login modal opens', q('#login-modal') && !q('#login-modal').hasAttribute('hidden') && document.body.classList.contains('locked'));
  ok('login form fields', Boolean(q('#login-user')) && Boolean(q('#login-pass')) && q('#login-pass').type === 'password');
  q('#toggle-pass')?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(20);
  ok('password reveal', q('#login-pass')?.type === 'text');
  q('#login-modal .modal-x')?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(20);
  ok('login modal closes', Boolean(q('#login-modal')?.hasAttribute('hidden')) && !document.body.classList.contains('locked'));

  const runtimeErrors = errors.filter((e) => !/Could not parse CSS|Not implemented|offline in test/i.test(e));
  ok('no runtime errors', runtimeErrors.length === 0, runtimeErrors.slice(0, 3).join(' | '));

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  window.close();
  process.exit(failures === 0 ? 0 : 1);
})();
