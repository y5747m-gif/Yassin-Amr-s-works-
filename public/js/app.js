/* ==========================================================================
   Yassin Amr — Portfolio · app.js
   Bilingual EN/AR · auto card generation from live site data · animations
   ========================================================================== */

'use strict';

/* ------------------------------ i18n dictionary ---------------------------- */

const I18N = {
  en: {
    'nav.work': 'My Work',
    'nav.about': 'About',
    'nav.contact': 'Contact',

    'hero.eyebrow': 'Web Designer — Giza, Egypt',
    'hero.title': 'I design <span class="grad">websites</span><br>people remember.',
    'hero.sub': 'This is my portfolio — every card below is generated straight from the live website it showcases. Paste a link and watch it become a card.',
    'hero.cta1': 'Browse my work',
    'hero.cta2': 'Add a project',

    'stat.projects': 'Projects',
    'stat.responsive': '100%',
    'stat.responsive-label': 'Responsive',
    'stat.care': '∞',
    'stat.care-label': 'Pixels of care',

    'marquee': ['Web Design', 'UI / UX', 'Landing Pages', 'E-Commerce', 'Responsive', 'Branding', 'WordPress', 'React'],

    'work.kicker': 'Portfolio',
    'work.title': 'My Work',
    'work.sub': 'Each card is built from the live website — its title, description and image are pulled straight from the page.',
    'form.placeholder': 'Paste a website link — e.g. https://yoursite.com',
    'form.btn': 'Analyze & Add',
    'form.btnLoading': 'Analyzing…',
    'form.hint': 'How it works: I read the site’s public data (title, description, image, favicon) and build the card for you — no typing.',

    'card.visit': 'Visit',
    'card.remove': 'Remove this card',
    'card.example': 'Example',

    'empty.title': 'No projects yet',
    'empty.sub': 'Paste your first website link above and I’ll build the card for you.',

    'about.kicker': 'Who I am',
    'about.title': 'About me',
    'about.text': 'I’m Yassin Amr, a web designer based in Giza, Egypt. I turn ideas into fast, elegant and easy-to-use websites — from landing pages to full e-commerce stores. Every project in this portfolio links straight to the live site, so you can click through and explore for yourself.',
    'about.tags': ['Web Design', 'UI / UX', 'Landing Pages', 'E-Commerce', 'Branding', 'Responsive Design'],

    'contact.kicker': 'Contact',
    'contact.title': 'Let’s build something <span class="grad">great</span>.',
    'contact.sub': 'Have a project in mind? My phone is one tap away.',
    'contact.role': 'Web Designer',
    'contact.name': 'Yassin Amr',
    'contact.phoneDisplay': '+20 114 136 2626',
    'contact.call': 'Call',
    'contact.whatsapp': 'WhatsApp',
    'contact.copy': 'Copy number',
    'contact.copied': 'Copied ✓',

    'toast.duplicate': 'This link is already in your portfolio.',
    'toast.added': 'added to your portfolio',
    'toast.invalid': 'Please enter a valid link, e.g. https://yoursite.com',
    'toast.failed': 'Couldn’t read that site — check the link and try again.',

    'footer.left': 'Yassin Amr — Web Designer, Giza, Egypt',
    'footer.right': '© 2026 · Designed & built by Yassin Amr',
    'doc.title': 'Yassin Amr — Web Designer & Portfolio',
  },

  ar: {
    'nav.work': 'أعمالي',
    'nav.about': 'عني',
    'nav.contact': 'تواصل',

    'hero.eyebrow': 'مصمم مواقع — الجيزة، مصر',
    'hero.title': 'أصمّم <span class="grad">مواقع</span><br>لا تُنسى.',
    'hero.sub': 'هذا هو بورتفوليو ياسين عمرو — كل بطاقة بالأسفل تُبنى تلقائياً من الموقع الحيّ الذي تعرضه. الصق رابطاً وشاهده يتحول إلى بطاقة.',
    'hero.cta1': 'شاهد أعمالي',
    'hero.cta2': 'أضف مشروعاً',

    'stat.projects': 'مشاريع',
    'stat.responsive': '100%',
    'stat.responsive-label': 'متجاوب',
    'stat.care': '∞',
    'stat.care-label': 'بكسل بعناية',

    'marquee': ['تصميم مواقع', 'تجربة واجهة المستخدم', 'صفحات تعريفية', 'متاجر إلكترونية', 'تصميم متجاوب', 'هوية بصرية', 'ووردبريس', 'رياكت'],

    'work.kicker': 'أعمال',
    'work.title': 'أعمالي',
    'work.sub': 'كل بطاقة تُبنى من الموقع مباشرة — العنوان والوصف والصورة تُجلب من الصفحة نفسها.',
    'form.placeholder': 'الصق رابط الموقع — مثال: https://example.com',
    'form.btn': 'تحليل وإضافة',
    'form.btnLoading': 'جارٍ التحليل…',
    'form.hint': 'كيف يعمل: أقرأ البيانات العامة للموقع (العنوان، الوصف، الصورة، أيقونة الموقع) وأبني لك البطاقة — بدون أي كتابة.',

    'card.visit': 'زيارة',
    'card.remove': 'حذف هذه البطاقة',
    'card.example': 'مثال',

    'empty.title': 'لا توجد مشاريع بعد',
    'empty.sub': 'الصق رابط أول موقع لك بالأعلى وسأبني لك البطاقة.',

    'about.kicker': 'من أنا',
    'about.title': 'عنّي',
    'about.text': 'أنا ياسين عمرو، مصمم مواقع من الجيزة، مصر. أُحوّل الأفكار إلى مواقع سريعة وأنيقة وسهلة الاستخدام — من الصفحات التعريفية إلى متاجر إلكترونية كاملة. كل مشروع هنا يوصلك إلى الموقع الحيّ مباشرةً لتستكشفه بنفسك.',
    'about.tags': ['تصميم مواقع', 'تجربة وواجهة المستخدم', 'صفحات تعريفية', 'متاجر إلكترونية', 'هوية بصرية', 'تصميم متجاوب'],

    'contact.kicker': 'تواصل',
    'contact.title': 'لنبنِ شيئاً <span class="grad">رائعاً</span> معاً.',
    'contact.sub': 'لديك مشروع في ذهنك؟ هاتفي على بُعد ضغطة واحدة.',
    'contact.role': 'مصمم مواقع',
    'contact.name': 'ياسين عمرو',
    'contact.phoneDisplay': '0114 136 2626',
    'contact.call': 'اتصال',
    'contact.whatsapp': 'واتساب',
    'contact.copy': 'نسخ الرقم',
    'contact.copied': 'تم النسخ ✓',

    'toast.duplicate': 'هذا الرابط موجود مسبقاً في أعمالك.',
    'toast.added': 'تمت الإضافة إلى أعمالك',
    'toast.invalid': 'الرجاء إدخال رابط صحيح، مثال: https://example.com',
    'toast.failed': 'تعذرت قراءة الموقع — تحقق من الرابط وحاول مجدداً.',

    'footer.left': 'ياسين عمرو — مصمم مواقع، الجيزة، مصر',
    'footer.right': '© 2026 · صُمم وبُني بواسطة ياسين عمرو',
    'doc.title': 'ياسين عمرو — مصمم مواقع وبورتفوليو',
  },
};

const PHONE_E164 = '+201141362626';
const PHONE_DISPLAY = { en: '+20 114 136 2626', ar: '0114 136 2626' };

/* ----------------------------- starter projects ---------------------------- */
/* The three starter cards are examples demonstrating the card format.
   Remove them and paste your own links to build the real portfolio. */

const DEFAULT_PROJECTS = [
  {
    id: 'ex-1',
    example: true,
    url: 'https://example.com',
    host: 'example.com',
    title: 'Lumière — Fashion Boutique',
    description:
      'A high-end e-commerce concept for a minimalist fashion label: editorial layouts, product storytelling, and a checkout flow that feels as good as the clothes.',
    image: '/img/work-1.jpg',
    favicon: null,
  },
  {
    id: 'ex-2',
    example: true,
    url: 'https://example.com',
    host: 'example.com',
    title: 'Nova — Fintech Dashboard',
    description:
      'SaaS marketing site and dashboard UI for a personal-finance platform. Clear data hierarchy, bold gradients, and a pricing page built to convert.',
    image: '/img/work-2.jpg',
    favicon: null,
  },
  {
    id: 'ex-3',
    example: true,
    url: 'https://example.com',
    host: 'example.com',
    title: 'Aroma — Coffee Roasters',
    description:
      'Brand site for an artisan roastery: warm palette, bean-origin storytelling, and a subscription flow for fresh-roast deliveries across the city.',
    image: '/img/work-3.jpg',
    favicon: null,
  },
];

/* --------------------------------- state ----------------------------------- */

const STORAGE_KEY = 'ya-projects-v1';
const LANG_KEY = 'ya-lang';

let lang = localStorage.getItem(LANG_KEY) || 'en';
let projects = loadProjects();

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* fall through */ }
  return DEFAULT_PROJECTS.map((p) => ({ ...p }));
}

function saveProjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch { /* storage full/blocked — non-fatal */ }
}

const t = (key) => (I18N[lang] && I18N[lang][key]) ?? I18N.en[key] ?? key;

/* --------------------------------- helpers --------------------------------- */

const $ = (sel) => document.querySelector(sel);

function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeUrl(input) {
  let value = String(input || '').trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
  try {
    const u = new URL(value);
    if (!u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function uniqueKey(url) {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/+$/, '')).toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

let toastTimer = null;
function toast(message, kind = 'success') {
  const el = $('#toast');
  el.textContent = message;
  el.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ------------------------------- language ---------------------------------- */

function applyLang(next, { animate = false } = {}) {
  if (!I18N[next]) next = 'en';
  lang = next;
  localStorage.setItem(LANG_KEY, lang);

  if (animate) {
    document.body.classList.add('lang-fade');
    setTimeout(() => document.body.classList.remove('lang-fade'), 260);
  }

  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = t('doc.title');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });

  const phoneEl = document.querySelector('.phone-num');
  if (phoneEl) phoneEl.textContent = PHONE_DISPLAY[lang];

  // language toggle
  const toggle = document.querySelector('.lang-toggle');
  if (toggle) {
    toggle.dataset.active = lang;
    toggle.querySelectorAll('button').forEach((b) =>
      b.classList.toggle('active', b.dataset.lang === lang)
    );
  }

  buildMarquee();
  buildTags();
  renderGrid();
  updateStatCount(false);
}

/* --------------------------------- marquee --------------------------------- */

function buildMarquee() {
  const track = $('#marquee-track');
  if (!track) return;
  const items = t('marquee');
  const one = items
    .map((s) => `<span class="marquee-item"><i>✦</i>${esc(s)}</span>`)
    .join('');
  track.innerHTML = one + one; // duplicate for a seamless -50% loop
}

/* ---------------------------------- tags ----------------------------------- */

function buildTags() {
  const el = $('#tags');
  if (!el) return;
  el.innerHTML = t('about.tags').map((s) => `<li>${esc(s)}</li>`).join('');
}

/* ---------------------------------- grid ----------------------------------- */

function cardTemplate(p, index) {
  const img = p.image
    ? `<img class="card-img" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"
         onerror="this.outerHTML='<div class=&quot;card-fallback&quot;><span class=&quot;mono&quot;>${esc((p.host || '•')[0].toUpperCase())}</span></div>'">`
    : `<div class="card-fallback"><span class="mono">${esc((p.host || '•')[0].toUpperCase())}</span>
       ${p.favicon ? `<img class="fav" src="${esc(p.favicon)}" alt="" loading="lazy" onerror="this.remove()">` : ''}</div>`;

  const favicon = p.favicon
    ? `<img src="${esc(p.favicon)}" alt="" loading="lazy" onerror="this.remove()">`
    : '';

  return `
  <article class="card reveal${p.justAdded ? ' just-added' : ''}" data-id="${esc(p.id)}" style="--d:${Math.min(index * 70, 420)}ms">
    <a class="card-media" href="${esc(p.url)}" target="_blank" rel="noopener">
      ${img}
      ${p.example ? `<span class="card-badge">${esc(t('card.example'))}</span>` : ''}
    </a>
    <div class="card-body">
      <h3 class="card-title"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a></h3>
      ${p.description ? `<p class="card-desc">${esc(p.description)}</p>` : ''}
      <div class="card-foot">
        <span class="card-host" dir="ltr">${favicon}${esc(p.host || '')}</span>
        <span class="card-actions">
          <a class="btn-visit" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(t('card.visit'))} <span class="arr">↗</span></a>
          <button class="btn-remove" type="button" data-i18n-title="card.remove" title="${esc(t('card.remove'))}" aria-label="${esc(t('card.remove'))}">✕</button>
        </span>
      </div>
    </div>
  </article>`;
}

function renderGrid() {
  const grid = $('#grid');
  const empty = $('#empty');
  if (!grid) return;
  grid.innerHTML = projects.map((p, i) => cardTemplate(p, i)).join('');
  if (empty) empty.hidden = projects.length > 0;
  observeReveals();
  updateStatCount(false);
  // clean the just-added flag after render
  projects.forEach((p) => delete p.justAdded);
}

function removeProject(id) {
  const p = projects.find((x) => x.id === id);
  if (!p) return;
  projects = projects.filter((x) => x.id !== id);
  saveProjects();
  renderGrid();
}

/* --------------------------------- stats ----------------------------------- */

function updateStatCount(animate = true) {
  const el = $('#stat-projects');
  if (!el) return;
  const target = projects.length;
  if (!animate || target === 0) {
    el.textContent = String(target);
    return;
  }
  const start = parseInt(el.textContent, 10) || 0;
  if (start === target) { el.textContent = String(target); return; }
  const t0 = performance.now();
  const dur = 500;
  (function tick(now) {
    const k = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - k, 3);
    el.textContent = String(Math.round(start + (target - start) * eased));
    if (k < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ----------------------------- analyze & add ------------------------------- */

const FETCH_TIMEOUT_MS = 14000;

/**
 * Fetch candidates, in order of preference:
 *  1. the site itself (works when it sends permissive CORS headers),
 *  2. public CORS relays (run from the visitor's browser, which has internet),
 *  3. our own server endpoint (works when the site is hosted with full egress).
 */
const FETCH_SOURCES = [
  (url) => ({ type: 'html', href: url }),
  (url) => ({ type: 'html', href: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url) }),
  (url) => ({ type: 'html', href: 'https://corsproxy.io/?url=' + encodeURIComponent(url) }),
  (url) => ({ type: 'json', href: '/api/analyze?url=' + encodeURIComponent(url) }),
];

async function fetchText(href) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(href, { signal: ctrl.signal, redirect: 'follow', cache: 'no-store' });
    if (!resp.ok) return null;
    const text = await resp.text();
    if (!text || text.length < 20) return null;
    return { text, finalUrl: resp.url || href };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function looksLikeHtml(text) {
  const head = text.slice(0, 6000).toLowerCase();
  return head.includes('<html') || head.includes('<head') ||
         head.includes('<meta') || head.includes('<title') || head.includes('<body');
}

async function analyzeSite(url) {
  for (const make of FETCH_SOURCES) {
    const src = make(url);
    try {
      if (src.type === 'json') {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
        const resp = await fetch(src.href, { signal: ctrl.signal });
        clearTimeout(timer);
        if (!resp.ok) continue;
        const data = await resp.json();
        if (data && data.ok && (data.title || data.description)) {
          return { title: data.title, description: data.description, image: data.image || null, favicon: data.favicon || null, host: data.host || '', url: data.url || url };
        }
        continue;
      }
      const res = await fetchText(src.href);
      if (!res || !looksLikeHtml(res.text)) continue;
      const meta = parseSiteMeta(res.text, res.finalUrl || url);
      if (meta.title || meta.description) {
        return { ...meta, url };
      }
    } catch { /* try next source */ }
  }
  throw new Error('all-sources-failed');
}

async function analyzeAndAdd(url) {
  const input = $('#url-input');
  const btn = $('#add-btn');
  const spinner = $('#add-spinner');
  const label = $('#add-label');

  btn.disabled = true;
  spinner.hidden = false;
  label.textContent = t('form.btnLoading');

  try {
    const data = await analyzeSite(url);

    const key = uniqueKey(data.url);
    if (projects.some((p) => uniqueKey(p.url) === key)) {
      toast(t('toast.duplicate'), 'error');
      shakeInput();
      return;
    }

    const project = {
      id: 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      example: false,
      url: data.url,
      host: data.host,
      title: data.title,
      description: data.description || '',
      image: data.image || null,
      favicon: data.favicon || null,
      addedAt: new Date().toISOString(),
      justAdded: true,
    };

    projects.unshift(project);
    saveProjects();
    renderGrid();
    input.value = '';

    const card = document.querySelector(`.card[data-id="${project.id}"]`);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast(`${project.title} — ${t('toast.added')}`, 'success');
  } catch {
    toast(t('toast.failed'), 'error');
    shakeInput();
  } finally {
    btn.disabled = false;
    spinner.hidden = true;
    label.textContent = t('form.btn');
  }
}

function shakeInput() {
  const wrap = document.querySelector('.add-input');
  if (!wrap) return;
  wrap.classList.remove('shake');
  void wrap.offsetWidth; // restart animation
  wrap.classList.add('shake');
}

/* --------------------------------- reveal ---------------------------------- */

let revealObserver = null;
function observeReveals() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
  }
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => revealObserver.observe(el));
}

/* ---------------------------------- boot ----------------------------------- */

function bindEvents() {
  // language toggle
  document.querySelectorAll('.lang-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.lang === lang) return;
      applyLang(btn.dataset.lang, { animate: true });
    });
  });

  // add form
  const form = $('#add-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = normalizeUrl($('#url-input').value);
    if (!url) {
      toast(t('toast.invalid'), 'error');
      shakeInput();
      return;
    }
    analyzeAndAdd(url);
  });

  // remove buttons (delegation)
  $('#grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-remove');
    if (!btn) return;
    const card = btn.closest('.card');
    if (card) removeProject(card.dataset.id);
  });

  // hero "add a project" → focus the input
  $('#hero-add').addEventListener('click', () => {
    $('#work').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => $('#url-input').focus({ preventScroll: true }), 450);
  });

  // copy phone
  const copyBtn = $('#copy-phone');
  const copyLabel = $('#copy-label');
  let copyTimer = null;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(PHONE_DISPLAY[lang]);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = PHONE_DISPLAY[lang];
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      ta.remove();
    }
    copyLabel.textContent = t('contact.copied');
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyLabel.textContent = t('contact.copy'); }, 1800);
  });

  // nav scrolled state
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  applyLang(lang, { animate: false });
  observeReveals();
  updateStatCount(true);
});
