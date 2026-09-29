/* ==========================================================================
   T.W.E Designer — app.js
   Intro splash · bilingual (auto) · the flood · device showcase · owner mode
   ========================================================================== */

'use strict';

/* ------------------------------- contacts ---------------------------------- */

const CONTACTS = [
  { local: '01141362626', e164: '201141362626', display: '0114 136 2626', labelKey: 'contact.line1' },
  { local: '01502701881', e164: '201502701881', display: '0150 270 1881', labelKey: 'contact.line2' },
];

/* --------------------------------- i18n ------------------------------------ */

const I18N = {
  en: {
    'doc.title': 'T.W.E Designer — Official Studio',
    'intro.tag': 'Design · Web · Motion · Everything',
    'intro.skip': 'Skip',

    'nav.services': 'Services',
    'nav.work': 'Our Work',
    'nav.about': 'About',
    'nav.contact': 'Contact',

    'owner.btn': 'Owner',
    'owner.open': 'Owner login',
    'owner.title': 'Owner sign in',
    'owner.sub': 'This area is for the site owner only.',
    'owner.user': 'Username',
    'owner.pass': 'Password',
    'owner.submit': 'Sign in',
    'owner.submitting': 'Signing in…',
    'owner.foot': 'Protected session · 12 hours',
    'owner.signedIn': 'Owner mode — you can publish projects',
    'owner.logout': 'Log out',
    'owner.welcome': 'Welcome back, owner.',
    'owner.bye': 'Signed out.',
    'owner.bad': 'Wrong username or password.',
    'owner.throttled': 'Too many attempts. Try again in {s}s.',
    'owner.netfail': 'Could not reach the server.',

    'hero.eyebrow': 'Creative Studio — Egypt',
    'hero.title': 'We design <span class="grad">everything</span><br>your brand needs.',
    'hero.sub': 'Graphic design, websites, animation, video editing, branding and identity — one studio, every service, delivered with obsessive detail.',
    'hero.cta1': 'See our work',
    'hero.cta2': 'WhatsApp us',

    'stat.projects': 'Projects',
    'stat.services': '12+',
    'stat.services-label': 'Services',
    'stat.support': '24/7',
    'stat.support-label': 'Support',

    'device.phone': 'Phone view',
    'device.laptop': 'Computer view',

    'marquee': ['Graphic Design', 'Web Development', 'Animation', 'Video Editing', 'Branding', 'UI / UX', 'Social Media', '3D & Visuals', 'Logo Design', 'Advertising'],

    'services.kicker': 'The Flood',
    'services.title': 'A <span class="grad">flood</span> of services',
    'services.sub': 'Everything a brand needs, pouring in from one studio — design, code, motion and edit.',
    'services.items': [
      { t: 'Graphic Design', d: 'Posters, social creatives, packaging and print — pixel-perfect and on-brand.' },
      { t: 'Website Design', d: 'Landing pages, stores and company sites: fast, responsive, built to convert.' },
      { t: 'Animation & Motion', d: 'Logo stings, explainer animation, kinetic typography and UI motion.' },
      { t: 'Video Editing', d: 'Reels, ads and long-form edits with colour grading, sound and subtitles.' },
      { t: 'Branding & Identity', d: 'Logo, palette, typography and a guideline book your team can actually use.' },
      { t: 'UI / UX Design', d: 'Research, wireframes and polished interfaces prototyped in Figma.' },
      { t: 'Social Media', d: 'Monthly content plans, templates and campaign creatives that get shared.' },
      { t: '3D & Visuals', d: 'Product renders, mockups and 3D scenes that make the work feel real.' },
      { t: 'Ads & Campaigns', d: 'Creative concepts plus the assets for Meta, TikTok, YouTube and Google.' },
      { t: 'Photo Retouching', d: 'Product and portrait retouching, background removal, colour matching.' },
      { t: 'Presentations', d: 'Investor decks and company profiles designed to hold attention.' },
      { t: 'Maintenance & Support', d: 'Hosting, updates, speed and SEO care after launch — we do not disappear.' },
    ],
    'services.stream': ['Logos', 'Reels', 'Landing Pages', 'Menus', 'Banners', 'Explainer Videos', 'Brand Books', 'Shopify', 'WordPress', 'React', 'Figma', 'After Effects', 'Premiere Pro', 'Illustrator', 'Photoshop', '3D Mockups', 'Motion Graphics', 'SEO', 'Business Cards', 'Packaging'],

    'work.kicker': 'Portfolio',
    'work.title': 'Websites we <span class="grad">built</span>',
    'work.sub': 'Every project below is shown live inside a real device — tap any screen to open the site.',
    'work.demo': 'Demo',
    'form.placeholder': 'Paste a website link — e.g. https://yoursite.com',
    'form.btn': 'Analyze & Add',
    'form.btnLoading': 'Analyzing…',
    'form.hint': 'The site’s public data (title, description, image, favicon) is read automatically and turned into a card.',
    'card.visit': 'Visit',
    'card.remove': 'Remove this project',
    'empty.title': 'Nothing published yet',
    'empty.sub': 'The owner can sign in and add the first project link.',

    'about.kicker': 'Who we are',
    'about.title': 'About the studio',
    'about.text': 'T.W.E Designer is a full-service creative studio. We design brands, build websites, animate stories and edit video — all under one roof, so your identity stays consistent everywhere it appears. Fast delivery, honest pricing, and work we are proud to sign.',
    'about.tags': ['Graphic Design', 'Web Design', 'Animation', 'Video Editing', 'Branding', 'UI/UX', '3D', 'Social Media', 'Ads'],

    'contact.kicker': 'Contact',
    'contact.title': 'Let’s build something <span class="grad">great</span>.',
    'contact.sub': 'Call us or message on WhatsApp — we answer fast.',
    'contact.line1': 'Main line',
    'contact.line2': 'Second line',
    'contact.call': 'Call',
    'contact.whatsapp': 'WhatsApp',
    'contact.copy': 'Copy',
    'contact.copied': 'Copied!',
    'contact.note': 'Available every day · 10:00 — 02:00 (Cairo time)',

    'footer.left': 'T.W.E Designer — Creative Studio, Egypt',
    'footer.right': '© 2026 · T.W.E Designer',

    'toast.duplicate': 'That link is already in the portfolio.',
    'toast.added': 'published to the portfolio',
    'toast.removed': 'Project removed.',
    'toast.invalid': 'Please enter a valid link, e.g. https://example.com',
    'toast.failed': 'Could not read that website — check the link and try again.',
    'toast.savefail': 'Could not save the project on the server.',
    'toast.needOwner': 'Sign in as owner first.',
  },

  ar: {
    'doc.title': 'T.W.E Designer — الموقع الرسمي',
    'intro.tag': 'تصميم · مواقع · أنيميشن · كل شيء',
    'intro.skip': 'تخطي',

    'nav.services': 'خدماتنا',
    'nav.work': 'أعمالنا',
    'nav.about': 'من نحن',
    'nav.contact': 'تواصل',

    'owner.btn': 'المالك',
    'owner.open': 'تسجيل دخول المالك',
    'owner.title': 'تسجيل دخول المالك',
    'owner.sub': 'هذه المنطقة مخصصة لمالك الموقع فقط.',
    'owner.user': 'اسم المستخدم',
    'owner.pass': 'كلمة المرور',
    'owner.submit': 'دخول',
    'owner.submitting': 'جارٍ الدخول…',
    'owner.foot': 'جلسة محمية · 12 ساعة',
    'owner.signedIn': 'وضع المالك — يمكنك نشر الأعمال',
    'owner.logout': 'تسجيل الخروج',
    'owner.welcome': 'أهلاً بعودتك يا مالك الموقع.',
    'owner.bye': 'تم تسجيل الخروج.',
    'owner.bad': 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    'owner.throttled': 'محاولات كثيرة. حاول بعد {s} ثانية.',
    'owner.netfail': 'تعذر الوصول إلى الخادم.',

    'hero.eyebrow': 'استوديو إبداعي — مصر',
    'hero.title': 'نصمم <span class="grad">كل شيء</span><br>تحتاجه علامتك.',
    'hero.sub': 'جرافيك ديزاين، مواقع إلكترونية، أنيميشن، مونتاج، وهوية بصرية كاملة — استوديو واحد، كل الخدمات، بإتقان في أدق التفاصيل.',
    'hero.cta1': 'شاهد أعمالنا',
    'hero.cta2': 'راسلنا واتساب',

    'stat.projects': 'مشروع',
    'stat.services': '+12',
    'stat.services-label': 'خدمة',
    'stat.support': '24/7',
    'stat.support-label': 'دعم',

    'device.phone': 'عرض الهاتف',
    'device.laptop': 'عرض الكمبيوتر',

    'marquee': ['جرافيك ديزاين', 'برمجة مواقع', 'أنيميشن', 'مونتاج فيديو', 'هوية بصرية', 'واجهات UI/UX', 'سوشيال ميديا', 'ثري دي', 'تصميم شعارات', 'إعلانات'],

    'services.kicker': 'الطوفان',
    'services.title': '<span class="grad">طوفان</span> من الخدمات',
    'services.sub': 'كل ما تحتاجه علامتك يتدفق من استوديو واحد — تصميم، برمجة، حركة، ومونتاج.',
    'services.items': [
      { t: 'جرافيك ديزاين', d: 'بوسترات، تصاميم سوشيال ميديا، تغليف ومطبوعات بجودة احترافية.' },
      { t: 'تصميم المواقع', d: 'صفحات هبوط، متاجر، ومواقع شركات — سريعة، متجاوبة، وتحقق مبيعات.' },
      { t: 'أنيميشن وموشن', d: 'حركة الشعار، فيديو توضيحي، تايبوجرافي متحركة، وحركة الواجهات.' },
      { t: 'مونتاج فيديو', d: 'ريلز وإعلانات وفيديوهات طويلة مع تصحيح ألوان وصوت وترجمة.' },
      { t: 'هوية بصرية', d: 'شعار، ألوان، خطوط، ودليل هوية كامل يسهل على فريقك استخدامه.' },
      { t: 'تصميم UI / UX', d: 'بحث، مخططات أولية، وواجهات نهائية مع نموذج تفاعلي على فيجما.' },
      { t: 'إدارة سوشيال ميديا', d: 'خطط محتوى شهرية، قوالب جاهزة، وتصاميم حملات قابلة للانتشار.' },
      { t: 'ثري دي ومرئيات', d: 'رندر منتجات، موك أب، ومشاهد ثلاثية الأبعاد تجعل العمل واقعياً.' },
      { t: 'إعلانات وحملات', d: 'أفكار إبداعية وكل المواد لإعلانات ميتا وتيك توك ويوتيوب وجوجل.' },
      { t: 'ريتاتش وتعديل صور', d: 'تنقيح صور المنتجات والبورتريه، إزالة الخلفية، ومطابقة الألوان.' },
      { t: 'عروض تقديمية', d: 'بروفايل الشركة وعروض المستثمرين بتصميم يجذب الانتباه حتى آخر شريحة.' },
      { t: 'صيانة ودعم', d: 'استضافة، تحديثات، سرعة، وتحسين محركات البحث بعد الإطلاق — لا نختفي.' },
    ],
    'services.stream': ['شعارات', 'ريلز', 'صفحات هبوط', 'مينيو', 'بانرات', 'فيديو توضيحي', 'دليل هوية', 'شوبيفاي', 'ووردبريس', 'رياكت', 'فيجما', 'أفتر إفكتس', 'بريمير برو', 'إليستريتور', 'فوتوشوب', 'موك أب ثري دي', 'موشن جرافيك', 'سيو', 'كروت شخصية', 'تغليف'],

    'work.kicker': 'أعمالنا',
    'work.title': 'مواقع <span class="grad">أنشأناها</span>',
    'work.sub': 'كل مشروع معروض داخل جهاز حقيقي — اضغط على أي شاشة لفتح الموقع.',
    'work.demo': 'نموذج',
    'form.placeholder': 'الصق رابط موقع — مثال: https://yoursite.com',
    'form.btn': 'تحليل وإضافة',
    'form.btnLoading': 'جارٍ التحليل…',
    'form.hint': 'تُقرأ بيانات الموقع العامة (العنوان، الوصف، الصورة، الأيقونة) تلقائياً وتتحول إلى بطاقة.',
    'card.visit': 'زيارة',
    'card.remove': 'حذف هذا المشروع',
    'empty.title': 'لا توجد أعمال منشورة بعد',
    'empty.sub': 'يمكن للمالك تسجيل الدخول وإضافة أول رابط مشروع.',

    'about.kicker': 'من نحن',
    'about.title': 'عن الاستوديو',
    'about.text': 'T.W.E Designer استوديو إبداعي متكامل. نصمم العلامات التجارية، نبني المواقع، نصنع الأنيميشن، ونحرر الفيديو — كل ذلك تحت سقف واحد لتبقى هويتك متناسقة أينما ظهرت. تسليم سريع، أسعار عادلة، وأعمال نفخر بتوقيعها.',
    'about.tags': ['جرافيك ديزاين', 'تصميم مواقع', 'أنيميشن', 'مونتاج', 'هوية بصرية', 'UI/UX', 'ثري دي', 'سوشيال ميديا', 'إعلانات'],

    'contact.kicker': 'تواصل معنا',
    'contact.title': 'لنصنع شيئاً <span class="grad">مذهلاً</span>.',
    'contact.sub': 'اتصل بنا أو راسلنا على واتساب — نرد بسرعة.',
    'contact.line1': 'الخط الأول',
    'contact.line2': 'الخط الثاني',
    'contact.call': 'اتصال',
    'contact.whatsapp': 'واتساب',
    'contact.copy': 'نسخ',
    'contact.copied': 'تم النسخ!',
    'contact.note': 'متاحون يومياً · من 10 صباحاً حتى 2 بعد منتصف الليل (توقيت القاهرة)',

    'footer.left': 'T.W.E Designer — استوديو إبداعي، مصر',
    'footer.right': '© 2026 · جميع الحقوق محفوظة T.W.E Designer',

    'toast.duplicate': 'هذا الرابط موجود بالفعل في المعرض.',
    'toast.added': 'تمت إضافته إلى المعرض',
    'toast.removed': 'تم حذف المشروع.',
    'toast.invalid': 'من فضلك أدخل رابطاً صحيحاً، مثال: https://example.com',
    'toast.failed': 'تعذرت قراءة هذا الموقع — تحقق من الرابط وحاول مجدداً.',
    'toast.savefail': 'تعذر حفظ المشروع على الخادم.',
    'toast.needOwner': 'سجّل الدخول كمالك أولاً.',
  },
};

/* --------------------------------- state ----------------------------------- */

const LANG_KEY = 'twe-lang';
const DEVICE_KEY = 'twe-device';

let lang = localStorage.getItem(LANG_KEY) ||
  ((navigator.language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en');
let deviceMode = localStorage.getItem(DEVICE_KEY) || detectDevice();
let projects = [];
let isOwner = false;

const t = (key) => (I18N[lang] && I18N[lang][key]) ?? I18N.en[key] ?? key;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function detectDevice() {
  const wide = window.matchMedia('(min-width: 900px)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const touch = navigator.maxTouchPoints > 1;
  return wide && (fine || !touch) ? 'laptop' : 'phone';
}

function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

/* --------------------------------- toast ----------------------------------- */

let toastTimer = null;
function toast(message, kind = 'success') {
  const el = $('#toast');
  el.textContent = message;
  el.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
}

/* ======================================================================
   INTRO
   ====================================================================== */

function initIntro() {
  const intro = $('#intro');
  if (!intro || document.documentElement.classList.contains('intro-skip')) {
    if (intro) intro.remove();
    document.body.classList.remove('locked');
    return;
  }

  document.body.classList.add('locked');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const started = performance.now();
  const TIMELINE_MS = 5250; // CSS timeline: letters → word → wipe → fade out
  let closed = false;

  /* `natural` = the CSS outro already played; anything earlier is a skip and
     gets its own quick fade so the overlay never flashes back in. */
  const close = (natural = false) => {
    if (closed) return;
    closed = true;
    try { sessionStorage.setItem('twe-intro-seen', '1'); } catch {}
    if (!natural && performance.now() - started < TIMELINE_MS - 400) {
      intro.classList.add('done');
    }
    document.body.classList.remove('locked');
    setTimeout(() => intro.remove(), natural ? 0 : 700);
  };

  $('#intro-skip').addEventListener('click', () => close(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(false); }, { once: true });
  setTimeout(() => close(true), reduced ? 100 : TIMELINE_MS);

  if (!reduced) introParticles();
}

function introParticles() {
  const canvas = $('#intro-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w, h, raf;
  const dots = [];

  const resize = () => {
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  };
  resize();
  addEventListener('resize', resize);

  const COLORS = ['#21d4fd', '#8b5cf6', '#ffc861'];
  const count = innerWidth < 600 ? 46 : 90;
  for (let i = 0; i < count; i++) {
    dots.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.8 + .5) * dpr,
      vx: (Math.random() - .5) * .55 * dpr,
      vy: (Math.random() - .5) * .55 * dpr,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      a: Math.random() * .6 + .25,
    });
  }

  const cx = () => w / 2, cy = () => h / 2;

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      // gentle pull toward the centre — the logo "attracts" the particles
      d.vx += (cx() - d.x) * 0.000035;
      d.vy += (cy() - d.y) * 0.000035;
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;

      ctx.globalAlpha = d.a;
      ctx.fillStyle = d.c;
      ctx.shadowBlur = 12 * dpr;
      ctx.shadowColor = d.c;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    // link nearby particles
    ctx.globalAlpha = .16;
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = dpr * .6;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < (130 * dpr) ** 2) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  };
  draw();
  setTimeout(() => cancelAnimationFrame(raf), 7000);
}

/* ======================================================================
   LANGUAGE
   ====================================================================== */

function applyLang(next, { animate = false } = {}) {
  if (!I18N[next]) next = 'en';
  lang = next;
  try { localStorage.setItem(LANG_KEY, lang); } catch {}

  if (animate) {
    document.body.classList.add('lang-fade');
    setTimeout(() => document.body.classList.remove('lang-fade'), 240);
  }

  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = t('doc.title');

  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $$('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', t(el.dataset.i18nTitle));
  });

  const introTag = $('#intro-tag');
  if (introTag) introTag.textContent = t('intro.tag');
  const skip = $('#intro-skip');
  if (skip) skip.textContent = t('intro.skip');

  const toggle = document.querySelector('.lang-toggle');
  if (toggle) {
    toggle.dataset.active = lang;
    toggle.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
  }

  buildMarquee();
  buildServices();
  buildStream();
  buildTags();
  buildContacts();
  setOwner(isOwner, { quiet: true });
  renderGrid();
}

/* ======================================================================
   MARQUEE / STREAM / TAGS
   ====================================================================== */

function buildMarquee() {
  const track = $('#marquee-track');
  if (!track) return;
  const one = t('marquee').map((s) => `<span class="marquee-item"><i>✦</i>${esc(s)}</span>`).join('');
  track.innerHTML = one + one;
}

function buildStream() {
  const items = t('services.stream');
  $$('.stream-track').forEach((track, row) => {
    const shifted = items.slice(row * 6).concat(items.slice(0, row * 6));
    const one = shifted
      .map((s, i) => `<span class="stream-chip${(i + row) % 5 === 0 ? ' hot' : ''}">${esc(s)}</span>`)
      .join('');
    track.innerHTML = one + one;
  });
}

function buildTags() {
  const el = $('#tags');
  if (!el) return;
  el.innerHTML = t('about.tags').map((s) => `<li>${esc(s)}</li>`).join('');
}

/* ======================================================================
   SERVICES — the flood
   ====================================================================== */

const SVC_ICONS = [
  '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M7 8l-2 2 2 2M17 8l2 2-2 2M13.5 7l-3 6"/>',
  '<circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4V8z"/>',
  '<path d="M15 10l4.55-2.28A1 1 0 0 1 21 8.62v6.76a1 1 0 0 1-1.45.89L15 14"/><rect x="3" y="6" width="12" height="12" rx="2"/>',
  '<path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4z"/>',
  '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><circle cx="17.5" cy="17.5" r="3.5"/>',
  '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12v10M12 12L3 7"/>',
  '<path d="M3 11l19-9-9 19-2-8-8-2z"/>',
  '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M6 21h12M12 17v4M6 8h6M6 12h9"/>',
  '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
];

function buildServices() {
  const grid = $('#services-grid');
  if (!grid) return;
  const items = t('services.items');
  grid.innerHTML = items
    .map((s, i) => `
      <article class="svc" style="--rd:${(i % 4) * 90 + Math.floor(i / 4) * 120}ms; --rot:${i % 2 ? 2 : -2}deg">
        <span class="svc-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="svc-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${SVC_ICONS[i % SVC_ICONS.length]}</svg>
        </span>
        <h3>${esc(s.t)}</h3>
        <p>${esc(s.d)}</p>
      </article>`)
    .join('');
  observeReveals();
}

function buildBubbles() {
  const wrap = $('#bubbles');
  if (!wrap) return;
  let html = '';
  for (let i = 0; i < 16; i++) {
    const size = 6 + Math.random() * 26;
    html += `<span class="bubble" style="
      inset-inline-start:${(Math.random() * 100).toFixed(1)}%;
      width:${size.toFixed(0)}px;height:${size.toFixed(0)}px;
      animation-duration:${(7 + Math.random() * 9).toFixed(1)}s;
      animation-delay:${(Math.random() * 9).toFixed(1)}s;"></span>`;
  }
  wrap.innerHTML = html;
}

/* ======================================================================
   DEVICE MODE
   ====================================================================== */

function applyDeviceMode(mode, { remember = true } = {}) {
  deviceMode = mode === 'laptop' ? 'laptop' : 'phone';
  if (remember) { try { localStorage.setItem(DEVICE_KEY, deviceMode); } catch {} }
  $$('.device').forEach((d) => { d.dataset.mode = deviceMode; });
  $$('.device-switch button').forEach((b) => b.classList.toggle('active', b.dataset.device === deviceMode));
}

/* hero showcase ------------------------------------------------------------ */

const SHOWCASE = ['/img/screen-1.jpg', '/img/screen-2.jpg', '/img/screen-3.jpg', '/img/screen-4.jpg'];
let showIndex = 0;
let showTimer = null;

function buildShowcase() {
  const stack = $('#hero-stack');
  const dots = $('#hero-dots');
  if (!stack) return;
  stack.innerHTML = SHOWCASE
    .map((src, i) => `<div class="shot${i === 0 ? ' active' : ''}"><img src="${src}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}"></div>`)
    .join('');
  dots.innerHTML = SHOWCASE
    .map((_, i) => `<button type="button" role="tab" class="${i === 0 ? 'active' : ''}" aria-label="Screen ${i + 1}"></button>`)
    .join('');

  dots.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => goShot(i, true)));
  startShowcase();
}

function goShot(i, manual = false) {
  const shots = $$('#hero-stack .shot');
  const dots = $$('#hero-dots button');
  if (!shots.length) return;
  showIndex = (i + shots.length) % shots.length;
  shots.forEach((s, k) => s.classList.toggle('active', k === showIndex));
  dots.forEach((d, k) => d.classList.toggle('active', k === showIndex));
  if (manual) startShowcase();
}

function startShowcase() {
  clearInterval(showTimer);
  showTimer = setInterval(() => goShot(showIndex + 1), 5200);
}

/* ======================================================================
   PROJECTS
   ====================================================================== */

function projTitle(p) {
  return (lang === 'ar' && p.titleAr) ? p.titleAr : p.title;
}
function projDesc(p) {
  return (lang === 'ar' && p.descriptionAr) ? p.descriptionAr : (p.description || '');
}

function cardTemplate(p, index) {
  const initial = esc(((p.host || p.title || '•')[0] || '•').toUpperCase());
  const media = p.image
    ? `<div class="shot"><img src="${esc(p.image)}" alt="${esc(projTitle(p))}" loading="lazy"
         onerror="this.parentElement.innerHTML='<div class=&quot;shot-fallback&quot;>${initial}</div>'"></div>`
    : `<div class="shot"><div class="shot-fallback">${initial}</div></div>`;

  const fav = p.favicon ? `<img src="${esc(p.favicon)}" alt="" loading="lazy" onerror="this.remove()">` : '';

  return `
  <article class="work-card" data-id="${esc(p.id)}" style="--rd:${Math.min(index * 80, 480)}ms">
    ${isOwner ? `<button class="btn-remove" type="button" title="${esc(t('card.remove'))}" aria-label="${esc(t('card.remove'))}">✕</button>` : ''}
    <div class="device float" data-mode="${deviceMode}">
      <div class="device-glow" aria-hidden="true"></div>
      <div class="device-body">
        <span class="notch" aria-hidden="true"></span>
        <span class="cam" aria-hidden="true"></span>
        <a class="device-screen" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="${esc(projTitle(p))}">
          ${p.demo ? `<span class="card-badge">${esc(t('work.demo'))}</span>` : ''}
          <div class="screen-stack">${media}</div>
          <span class="screen-shine" aria-hidden="true"></span>
        </a>
      </div>
      <div class="device-base" aria-hidden="true"><span></span></div>
      <div class="device-shadow" aria-hidden="true"></div>
    </div>
    <div class="work-info">
      <h3 class="work-title"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(projTitle(p))}</a></h3>
      ${projDesc(p) ? `<p class="work-desc">${esc(projDesc(p))}</p>` : ''}
      <div class="work-meta">
        <span class="work-host" dir="ltr">${fav}${esc(p.host || '')}</span>
        <a class="btn-visit" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(t('card.visit'))} <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </article>`;
}

function renderGrid() {
  const grid = $('#grid');
  const empty = $('#empty');
  if (!grid) return;
  grid.innerHTML = projects.map(cardTemplate).join('');
  if (empty) empty.hidden = projects.length > 0;
  observeReveals();
  updateStatCount(true);
}

async function loadProjects() {
  try {
    const res = await fetch('/api/projects', { cache: 'no-store' });
    const data = await res.json();
    if (data && data.ok) {
      projects = Array.isArray(data.projects) ? data.projects : [];
      setOwner(Boolean(data.owner), { quiet: true });
    }
  } catch {
    projects = [];
  }
  renderGrid();
}

function updateStatCount(animate = true) {
  const el = $('#stat-projects');
  if (!el) return;
  const target = projects.length;
  if (!animate) { el.textContent = String(target); return; }
  const start = parseInt(el.textContent, 10) || 0;
  if (start === target) { el.textContent = String(target); return; }
  const t0 = performance.now();
  (function tick(now) {
    const k = Math.min(1, (now - t0) / 600);
    el.textContent = String(Math.round(start + (target - start) * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ------------------------------ analyze & add ------------------------------ */

const FETCH_TIMEOUT_MS = 14000;

const FETCH_SOURCES = [
  (url) => ({ type: 'html', href: url }),
  (url) => ({ type: 'html', href: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url) }),
  (url) => ({ type: 'html', href: 'https://corsproxy.io/?url=' + encodeURIComponent(url) }),
  (url) => ({ type: 'json', href: '/api/analyze?url=' + encodeURIComponent(url) }),
];

function normalizeUrl(input) {
  let value = String(input || '').trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
  try {
    const u = new URL(value);
    if (!u.hostname.includes('.')) return null;
    return u.toString();
  } catch { return null; }
}

async function fetchText(href) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(href, { signal: ctrl.signal, redirect: 'follow', cache: 'no-store' });
    if (!resp.ok) return null;
    const text = await resp.text();
    if (!text || text.length < 20) return null;
    return { text, finalUrl: resp.url || href };
  } catch { return null; } finally { clearTimeout(timer); }
}

function looksLikeHtml(text) {
  const head = text.slice(0, 6000).toLowerCase();
  return head.includes('<html') || head.includes('<head') || head.includes('<meta') ||
         head.includes('<title') || head.includes('<body');
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
          return { title: data.title, description: data.description, image: data.image || null,
                   favicon: data.favicon || null, host: data.host || '', url: data.url || url };
        }
        continue;
      }
      const res = await fetchText(src.href);
      if (!res || !looksLikeHtml(res.text)) continue;
      const meta = parseSiteMeta(res.text, res.finalUrl || url);
      if (meta.title || meta.description) return { ...meta, url };
    } catch { /* next source */ }
  }
  throw new Error('all-sources-failed');
}

function shakeInput() {
  const wrap = document.querySelector('.add-input');
  if (!wrap) return;
  wrap.classList.remove('shake');
  void wrap.offsetWidth;
  wrap.classList.add('shake');
}

async function analyzeAndAdd(url) {
  const btn = $('#add-btn');
  const spinner = $('#add-spinner');
  const label = $('#add-label');

  btn.disabled = true;
  spinner.hidden = false;
  label.textContent = t('form.btnLoading');

  try {
    const data = await analyzeSite(url);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: data.url, host: data.host, title: data.title,
        description: data.description || '', image: data.image || null, favicon: data.favicon || null,
      }),
    });
    const out = await res.json().catch(() => ({}));

    if (res.status === 409) { toast(t('toast.duplicate'), 'error'); shakeInput(); return; }
    if (res.status === 401) { toast(t('toast.needOwner'), 'error'); setOwner(false); return; }
    if (!res.ok || !out.ok) { toast(t('toast.savefail'), 'error'); return; }

    projects.unshift(out.project);
    renderGrid();
    $('#url-input').value = '';
    const card = document.querySelector(`.work-card[data-id="${out.project.id}"]`);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast(`${out.project.title} — ${t('toast.added')}`, 'success');
  } catch {
    toast(t('toast.failed'), 'error');
    shakeInput();
  } finally {
    btn.disabled = false;
    spinner.hidden = true;
    label.textContent = t('form.btn');
  }
}

async function removeProject(id) {
  try {
    const res = await fetch('/api/projects?id=' + encodeURIComponent(id), { method: 'DELETE' });
    if (res.status === 401) { toast(t('toast.needOwner'), 'error'); setOwner(false); return; }
    if (!res.ok) { toast(t('toast.savefail'), 'error'); return; }
    projects = projects.filter((p) => p.id !== id);
    renderGrid();
    toast(t('toast.removed'), 'success');
  } catch {
    toast(t('toast.savefail'), 'error');
  }
}

/* ======================================================================
   OWNER SESSION
   ====================================================================== */

function setOwner(value, { quiet = false } = {}) {
  const changed = isOwner !== value;
  isOwner = value;
  $('#owner-panel').hidden = !value;
  $('#owner-dot').hidden = !value;
  $('#owner-btn').classList.toggle('is-owner', value);
  $('#owner-btn-label').textContent = value ? t('owner.signedIn').split('—')[0].trim() : t('owner.btn');
  if (changed && !quiet) renderGrid();
}

async function checkSession() {
  try {
    const res = await fetch('/api/session', { cache: 'no-store' });
    const data = await res.json();
    setOwner(Boolean(data && data.owner), { quiet: true });
  } catch { setOwner(false, { quiet: true }); }
}

function openModal() {
  const modal = $('#login-modal');
  modal.hidden = false;
  document.body.classList.add('locked');
  $('#login-error').hidden = true;
  setTimeout(() => $('#login-user').focus(), 60);
}

function closeModal() {
  $('#login-modal').hidden = true;
  document.body.classList.remove('locked');
  $('#login-form').reset();
}

async function doLogin(e) {
  e.preventDefault();
  const user = $('#login-user').value.trim();
  const pass = $('#login-pass').value;
  const err = $('#login-error');
  const btn = $('#login-submit');
  const spinner = $('#login-spinner');
  const label = $('#login-label');

  err.hidden = true;
  btn.disabled = true;
  spinner.hidden = false;
  label.textContent = t('owner.submitting');

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      closeModal();
      setOwner(true);
      renderGrid();
      toast(t('owner.welcome'), 'success');
      $('#work').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (res.status === 429) {
      err.textContent = t('owner.throttled').replace('{s}', data.retryAfter || 60);
    } else {
      err.textContent = t('owner.bad');
    }
    err.hidden = false;
    err.style.animation = 'none';
    void err.offsetWidth;
    err.style.animation = '';
  } catch {
    err.textContent = t('owner.netfail');
    err.hidden = false;
  } finally {
    btn.disabled = false;
    spinner.hidden = true;
    label.textContent = t('owner.submit');
  }
}

async function doLogout() {
  try { await fetch('/api/logout', { method: 'POST' }); } catch {}
  setOwner(false);
  renderGrid();
  toast(t('owner.bye'), 'success');
}

/* ======================================================================
   CONTACT
   ====================================================================== */

function buildContacts() {
  const wrap = $('#contact-cards');
  if (!wrap) return;
  wrap.innerHTML = CONTACTS.map((c, i) => `
    <div class="contact-card reveal" style="--rd:${180 + i * 90}ms">
      <span class="cc-label">${esc(t(c.labelKey))}</span>
      <a class="cc-num" href="tel:+${c.e164}" dir="ltr">${esc(c.display)}</a>
      <div class="cc-actions">
        <a class="btn btn-grad" href="tel:+${c.e164}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          ${esc(t('contact.call'))}
        </a>
        <a class="btn btn-wa" href="https://wa.me/${c.e164}" target="_blank" rel="noopener">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2zm0 18.06h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.05-.2-.31a8.22 8.22 0 0 1-1.26-4.39c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.25-8.24 8.25zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07s.9 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28z"/></svg>
          ${esc(t('contact.whatsapp'))}
        </a>
        <button class="btn btn-ghost copy-btn" type="button" data-num="${c.local}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>${esc(t('contact.copy'))}</span>
        </button>
      </div>
    </div>`).join('');
  observeReveals();
}

async function copyNumber(btn) {
  const num = btn.dataset.num;
  try {
    await navigator.clipboard.writeText(num);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = num;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch {}
    ta.remove();
  }
  const span = btn.querySelector('span');
  const old = span.textContent;
  span.textContent = t('contact.copied');
  setTimeout(() => { span.textContent = old; }, 1600);
  toast(`${num} — ${t('contact.copied')}`, 'success');
}

/* ======================================================================
   REVEAL
   ====================================================================== */

let revealObserver = null;
function observeReveals() {
  const targets = '.reveal:not(.in), .svc:not(.in), .work-card:not(.in)';
  if (!('IntersectionObserver' in window)) {
    $$(targets).forEach((el) => el.classList.add('in'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  }
  $$(targets).forEach((el) => {
    if (el.dataset.delay && !el.style.getPropertyValue('--rd')) {
      el.style.setProperty('--rd', el.dataset.delay + 'ms');
    }
    revealObserver.observe(el);
  });
}

/* ======================================================================
   EVENTS / BOOT
   ====================================================================== */

function bindEvents() {
  // language
  $$('.lang-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.lang === lang) return;
      applyLang(btn.dataset.lang, { animate: true });
    });
  });

  // device switch
  $$('.device-switch button').forEach((btn) => {
    btn.addEventListener('click', () => applyDeviceMode(btn.dataset.device));
  });

  // burger
  const burger = $('#burger');
  const links = document.querySelector('.nav-links');
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  // owner
  $('#owner-btn').addEventListener('click', () => {
    if (isOwner) { $('#work').scrollIntoView({ behavior: 'smooth' }); return; }
    openModal();
  });
  $('#login-form').addEventListener('submit', doLogin);
  $('#logout-btn').addEventListener('click', doLogout);
  $$('#login-modal [data-close]').forEach((el) => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#login-modal').hidden) closeModal();
  });
  $('#toggle-pass').addEventListener('click', () => {
    const input = $('#login-pass');
    input.type = input.type === 'password' ? 'text' : 'password';
    input.focus();
  });

  // add project
  $('#add-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const url = normalizeUrl($('#url-input').value);
    if (!url) { toast(t('toast.invalid'), 'error'); shakeInput(); return; }
    analyzeAndAdd(url);
  });

  // remove project
  $('#grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-remove');
    if (!btn) return;
    const card = btn.closest('.work-card');
    if (card) removeProject(card.dataset.id);
  });

  // copy numbers
  $('#contact-cards').addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (btn) copyNumber(btn);
  });

  // nav scroll state
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // keep the device mode sensible when the window is resized dramatically
  let resizeTimer = null;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (localStorage.getItem(DEVICE_KEY)) return; // user chose explicitly
      applyDeviceMode(detectDevice(), { remember: false });
    }, 220);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  bindEvents();
  buildShowcase();
  buildBubbles();
  applyLang(lang);
  applyDeviceMode(deviceMode, { remember: false });
  observeReveals();
  checkSession().then(loadProjects);
});
