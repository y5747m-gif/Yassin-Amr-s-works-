/* ==========================================================================
   Pixelio — app.js
   Intro splash · bilingual (auto) · the flood · device showcase · owner mode
   ========================================================================== */

'use strict';

/* ------------------------------- contacts ---------------------------------- */

const DEFAULT_CONTACTS = [
  { local: '01141362626', e164: '201141362626', display: '0114 136 2626', labelKey: 'contact.line1' },
  { local: '01502701881', e164: '201502701881', display: '0150 270 1881', labelKey: 'contact.line2' },
];

// The hero only shows actual published projects (or images the owner explicitly
// chooses in settings). No stock/demo website screens are bundled with the site.
const DEFAULT_SHOWCASE = [];
const SHOWCASE_SLOTS = 4;

/* --------------------------------- i18n ------------------------------------ */

const I18N = {
  en: {
    'doc.title': 'Pixelio — Official Studio',
    'meta.description': 'Pixelio — every kind of graphic design and complete website design. Logos, identity, social media, print, UI/UX, stores and more. Official studio site.',
    'brand.name': 'PIXELIO<em>Creative Media Solutions</em>',
    'intro.tag': 'Graphic Design · Web Design',
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
    'owner.editOn': 'Edit page text',
    'owner.editOff': 'Stop editing',
    'owner.editHint': 'Editing is on — click any text on the page and type to change it. Press Enter or click away to save, Esc to cancel, double-click a field to reset it.',
    'owner.moreSettings': 'More site settings (numbers, images, hidden labels…)',
    'owner.saved': 'Saved.',
    'owner.savefail': 'Could not save — try again.',
    'owner.reset': 'Reset to default.',
    'owner.resetfail': 'Could not reset.',
    'owner.emptyRevert': 'That field can’t be empty — reverted.',
    'owner.badImage': 'Please use a full https:// image link.',
    'owner.badPhone': 'Please enter a valid phone number.',
    'settings.contact1': 'Main phone number',
    'settings.contact2': 'Second phone number',
    'settings.docTitle': 'Browser tab title',
    'settings.metaDescription': 'Search engine description',
    'settings.placeholder': '“Add project” input placeholder',
    'settings.devicePhone': 'Phone-view tooltip',
    'settings.deviceLaptop': 'Computer-view tooltip',
    'settings.cardRemove': '“Remove project” tooltip',
    'settings.showcase': 'Custom hero showcase image',

    'hero.eyebrow': 'Pixelio — Creative Studio',
    'hero.title': 'We turn your idea into a <span class="grad">professional digital presence</span>',
    'hero.sub': 'We craft a complete digital experience for you.',
    'hero.cta1': 'See our work',
    'hero.order': 'Order your service',
    'hero.orderMsg': 'Hello Pixelio 👋 I would like to order a service.',

    'stat.projects': 'Projects',
    'stat.services': '12+',
    'stat.services-label': 'Services',
    'stat.support': '24/7',
    'stat.support-label': 'Support',

    'device.phone': 'Phone view',
    'device.laptop': 'Computer view',

    'marquee': ['Logo Design', 'Brand Identity', 'Social Media', 'Advertising', 'Print', 'Photo Retouch', 'Web Design', 'UI / UX', 'Landing Pages', 'E-commerce'],

    'services.kicker': 'What we do',
    'services.title': 'Graphic design & <span class="grad">websites</span>',
    'services.sub': 'Every type of graphic design and website design — from a logo to a full online store — under one roof.',
    'services.items': [
      { t: 'Graphic Design', d: 'Posters, flyers, menus and every kind of digital & print creative.' },
      { t: 'Logo & Brand Identity', d: 'A logo your customers remember, plus colors, fonts and a full brand book.' },
      { t: 'Social Media Designs', d: 'Posts, covers, stories and monthly template sets that stop the scroll.' },
      { t: 'Advertising Designs', d: 'Ad creatives for Meta, TikTok, YouTube and outdoor billboards.' },
      { t: 'Photo Retouching', d: 'Retouching, manipulation, background removal and color matching.' },
      { t: 'Presentations & Profiles', d: 'Investor decks and company profiles designed to hold attention.' },
      { t: 'Website Design', d: 'Custom, responsive, fast websites designed to convert visitors.' },
      { t: 'UI / UX Design', d: 'Research, wireframes and polished interfaces prototyped in Figma.' },
      { t: 'Landing Pages', d: 'High-converting landing pages for campaigns and launches.' },
      { t: 'E-commerce Stores', d: 'Complete stores with payment, shipping and product management.' },
      { t: 'Web Development', d: 'Clean, fast code — from company sites to custom web apps.' },
      { t: 'Hosting & Care', d: 'Hosting, speed, SEO and updates after launch — we do not disappear.' },
    ],
    'services.order': 'Order service',
    'services.orderCta': 'Order your service now',
    'services.orderMsg': 'Hello Pixelio 👋 I would like to order: {s}',
    'services.stream': ['Logos', 'Covers', 'Stories', 'Banners', 'Menus', 'Flyers', 'Packaging', 'Business Cards', 'Landing Pages', 'Online Stores', 'WordPress', 'React', 'Figma', 'Photoshop', 'Illustrator', 'SEO', 'Motion', 'Mockups'],

    'work.kicker': 'Portfolio',
    'work.title': 'Websites we <span class="grad">built</span>',
    'work.sub': 'Every project below is shown live inside a real device — tap any screen to open the site.',
    'showcase.empty': 'Your published websites will appear here.',
    'form.placeholder': 'Paste a website link — e.g. https://yoursite.com',
    'form.btn': 'Analyze & Add',
    'form.btnLoading': 'Analyzing…',
    'form.hint': 'The site’s public data (title, description, image, favicon) is read automatically and turned into a card.',
    'card.visit': 'Visit',
    'card.remove': 'Remove this project',
    'project.edit': 'Edit project',
    'project.editTitle': 'Edit project details',
    'project.editSub': 'Control the link, titles, descriptions and preview image.',
    'project.titleEn': 'English title', 'project.titleAr': 'Arabic title',
    'project.descEn': 'English description', 'project.descAr': 'Arabic description',
    'project.url': 'Website link', 'project.image': 'Preview image link',
    'project.favicon': 'Icon link', 'project.tag': 'Category',
    'project.save': 'Save all details', 'project.saved': 'Project details saved.',
    'empty.title': 'Nothing published yet',
    'empty.sub': 'The owner can sign in and add the first project link.',

    'about.kicker': 'Who we are',
    'about.title': 'About the studio',
    'about.text': 'Pixelio is a creative studio specialized in all types of graphic design and website design. Logos, identities, social media and print on one side; fast, beautiful websites on the other — all under one roof, so your brand stays consistent everywhere. Fast delivery, honest pricing, and work we are proud to sign.',
    'about.tags': ['Graphic Design', 'Logo & Identity', 'Social Media', 'Print', 'Web Design', 'UI/UX', 'E-commerce', 'SEO'],

    'contact.kicker': 'Contact',
    'contact.title': 'Order your <span class="grad">service</span> now.',
    'contact.sub': 'Call us or message on WhatsApp — we answer fast.',
    'contact.line1': 'Main line',
    'contact.line2': 'Second line',
    'contact.call': 'Call',
    'contact.whatsapp': 'WhatsApp',
    'contact.copy': 'Copy',
    'contact.copied': 'Copied!',
    'contact.note': 'Available every day · 10:00 — 02:00 (Cairo time)',

    'footer.left': 'Pixelio — Creative Studio, Egypt',
    'footer.right': '© 2026 · Pixelio',

    'toast.duplicate': 'That link is already in the portfolio.',
    'toast.added': 'published to the portfolio',
    'toast.addedWithoutMeta': 'saved. You can add its details later.',
    'toast.removed': 'Project removed.',
    'toast.invalid': 'Please enter a valid link, e.g. https://example.com',
    'toast.failed': 'Could not read that website — check the link and try again.',
    'toast.savefail': 'Could not save the project on the server.',
    'toast.needOwner': 'Sign in as owner first.',
  },

  ar: {
    'doc.title': 'Pixelio — الموقع الرسمي',
    'meta.description': 'Pixelio — جميع أنواع الجرافيك ديزاين وتصميم المواقع الإلكترونية. شعارات، هوية بصرية، سوشيال ميديا، مطبوعات، واجهات، متاجر والمزيد. الموقع الرسمي للاستوديو.',
    'brand.name': 'PIXELIO<em>Creative Media Solutions</em>',
    'intro.tag': 'جرافيك ديزاين · تصميم مواقع',
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
    'owner.editOn': 'تعديل نصوص الصفحة',
    'owner.editOff': 'إيقاف التعديل',
    'owner.editHint': 'وضع التعديل مفعّل — اضغط على أي نص في الصفحة واكتب لتغييره. اضغط Enter أو انقر خارج النص للحفظ، Esc للإلغاء، ودبل-كليك لإعادته للوضع الافتراضي.',
    'owner.moreSettings': 'إعدادات إضافية (أرقام، صور، تسميات مخفية…)',
    'owner.saved': 'تم الحفظ.',
    'owner.savefail': 'تعذر الحفظ — حاول مرة أخرى.',
    'owner.reset': 'تمت الإعادة للوضع الافتراضي.',
    'owner.resetfail': 'تعذرت الإعادة للوضع الافتراضي.',
    'owner.emptyRevert': 'لا يمكن ترك هذا الحقل فارغاً — تمت إعادته.',
    'owner.badImage': 'من فضلك استخدم رابط صورة كامل يبدأ بـ https://.',
    'owner.badPhone': 'من فضلك أدخل رقم هاتف صحيح.',
    'settings.contact1': 'رقم الهاتف الأول',
    'settings.contact2': 'رقم الهاتف الثاني',
    'settings.docTitle': 'عنوان تبويب المتصفح',
    'settings.metaDescription': 'وصف محركات البحث',
    'settings.placeholder': 'النص الإرشادي لحقل "إضافة مشروع"',
    'settings.devicePhone': 'تلميح عرض الهاتف',
    'settings.deviceLaptop': 'تلميح عرض الكمبيوتر',
    'settings.cardRemove': 'تلميح "حذف المشروع"',
    'settings.showcase': 'صورة مخصصة لعرض الواجهة الرئيسية',

    'hero.eyebrow': 'Pixelio — استوديو إبداعي',
    'hero.title': 'حوّل فكرتك إلى <span class="grad">حضور رقمي احترافي</span>',
    'hero.sub': 'نصنع لك تجربة رقمية متكاملة.',
    'hero.cta1': 'شاهد أعمالنا',
    'hero.order': 'اطلب خدمتك الآن',
    'hero.orderMsg': 'مرحباً Pixelio 👋 أرغب في طلب خدمة.',

    'stat.projects': 'مشروع',
    'stat.services': '+12',
    'stat.services-label': 'خدمة',
    'stat.support': '24/7',
    'stat.support-label': 'دعم',

    'device.phone': 'عرض الهاتف',
    'device.laptop': 'عرض الكمبيوتر',

    'marquee': ['تصميم شعارات', 'هوية بصرية', 'سوشيال ميديا', 'إعلانات', 'مطبوعات', 'ريتاتش صور', 'تصميم مواقع', 'UI / UX', 'صفحات هبوط', 'متاجر إلكترونية'],

    'services.kicker': 'ما نقدمه',
    'services.title': 'جرافيك ديزاين <span class="grad">وتصميم مواقع</span>',
    'services.sub': 'جميع أنواع الجرافيك ديزاين وتصميم المواقع — من الشعار حتى المتجر الإلكتروني المتكامل — تحت سقف واحد.',
    'services.items': [
      { t: 'الجرافيك ديزاين', d: 'بوسترات وفلايرات ومينيوهات وكل أنواع التصاميم الرقمية والمطبوعة.' },
      { t: 'الشعارات والهوية البصرية', d: 'شعار لا يُنسى، مع الألوان والخطوط ودليل هوية كامل.' },
      { t: 'تصاميم السوشيال ميديا', d: 'بوستات وأغلفة وستوريز ومجموعات قوالب شهرية توقف التمرير.' },
      { t: 'التصاميم الإعلانية', d: 'تصاميم إعلانية لميتا وتيك توك ويوتيوب واللوحات الخارجية.' },
      { t: 'ريتاتش ومعالجة الصور', d: 'تنقيح وتعديل الصور، إزالة الخلفيات، ومطابقة الألوان.' },
      { t: 'العروض والبروفايل', d: 'عروض المستثمرين وبروفايل الشركة بتصميم يجذب الانتباه.' },
      { t: 'تصميم المواقع', d: 'مواقع مخصصة متجاوبة وسريعة مصممة لتحويل الزوار إلى عملاء.' },
      { t: 'تصميم الواجهات UI/UX', d: 'بحث ومخططات وواجهات نهائية مع نموذج تفاعلي على فيجما.' },
      { t: 'صفحات الهبوط', d: 'صفحات هبوط عالية التحويل للحملات والإطلاقات.' },
      { t: 'المتاجر الإلكترونية', d: 'متاجر متكاملة مع الدفع والشحن وإدارة المنتجات.' },
      { t: 'تطوير المواقع', d: 'كود نظيف وسريع — من مواقع الشركات إلى تطبيقات الويب.' },
      { t: 'الاستضافة والصيانة', d: 'استضافة وسرعة وتحسين محركات البحث وتحديثات بعد الإطلاق — لا نختفي.' },
    ],
    'services.order': 'اطلب الخدمة',
    'services.orderCta': 'اطلب خدمتك الآن',
    'services.orderMsg': 'مرحباً Pixelio 👋 أرغب في طلب خدمة: {s}',
    'services.stream': ['شعارات', 'أغلفة', 'ستوريز', 'بانرات', 'مينيوهات', 'فلايرات', 'تغليف', 'كروت شخصية', 'صفحات هبوط', 'متاجر إلكترونية', 'ووردبريس', 'رياكت', 'فيجما', 'فوتوشوب', 'إليستريتور', 'سيو', 'موشن', 'موك أب'],

    'work.kicker': 'أعمالنا',
    'work.title': 'مواقع <span class="grad">أنشأناها</span>',
    'work.sub': 'كل مشروع معروض داخل جهاز حقيقي — اضغط على أي شاشة لفتح الموقع.',
    'showcase.empty': 'ستظهر مواقعك المنشورة هنا.',
    'form.placeholder': 'الصق رابط موقع — مثال: https://yoursite.com',
    'form.btn': 'تحليل وإضافة',
    'form.btnLoading': 'جارٍ التحليل…',
    'form.hint': 'تُقرأ بيانات الموقع العامة (العنوان، الوصف، الصورة، الأيقونة) تلقائياً وتتحول إلى بطاقة.',
    'card.visit': 'زيارة',
    'card.remove': 'حذف هذا المشروع',
    'project.edit': 'تعديل المشروع',
    'project.editTitle': 'تعديل كل تفاصيل المشروع',
    'project.editSub': 'تحكم في الرابط والعناوين والوصف وصورة المعاينة.',
    'project.titleEn': 'العنوان بالإنجليزية', 'project.titleAr': 'العنوان بالعربية',
    'project.descEn': 'الوصف بالإنجليزية', 'project.descAr': 'الوصف بالعربية',
    'project.url': 'رابط الموقع', 'project.image': 'رابط صورة المعاينة',
    'project.favicon': 'رابط الأيقونة', 'project.tag': 'التصنيف',
    'project.save': 'حفظ جميع التفاصيل', 'project.saved': 'تم حفظ تفاصيل المشروع.',
    'empty.title': 'لا توجد أعمال منشورة بعد',
    'empty.sub': 'يمكن للمالك تسجيل الدخول وإضافة أول رابط مشروع.',

    'about.kicker': 'من نحن',
    'about.title': 'عن الاستوديو',
    'about.text': 'Pixelio استوديو إبداعي متخصص في جميع أنواع الجرافيك ديزاين وتصميم المواقع. شعارات وهويات وتصاميم سوشيال ميديا ومطبوعات من ناحية، ومواقع إلكترونية سريعة وأنيقة من ناحية أخرى — كل ذلك تحت سقف واحد لتبقى هويتك متناسقة في كل مكان. تسليم سريع، أسعار عادلة، وأعمال نفخر بتوقيعها.',
    'about.tags': ['جرافيك ديزاين', 'شعارات وهوية', 'سوشيال ميديا', 'مطبوعات', 'تصميم مواقع', 'UI/UX', 'متاجر إلكترونية', 'سيو'],

    'contact.kicker': 'تواصل معنا',
    'contact.title': 'اطلب <span class="grad">خدمتك</span> الآن.',
    'contact.sub': 'اتصل بنا أو راسلنا على واتساب — نرد بسرعة.',
    'contact.line1': 'الخط الأول',
    'contact.line2': 'الخط الثاني',
    'contact.call': 'اتصال',
    'contact.whatsapp': 'واتساب',
    'contact.copy': 'نسخ',
    'contact.copied': 'تم النسخ!',
    'contact.note': 'متاحون يومياً · من 10 صباحاً حتى 2 بعد منتصف الليل (توقيت القاهرة)',

    'footer.left': 'Pixelio — استوديو إبداعي، مصر',
    'footer.right': '© 2026 · جميع الحقوق محفوظة Pixelio',

    'toast.duplicate': 'هذا الرابط موجود بالفعل في المعرض.',
    'toast.added': 'تمت إضافته إلى المعرض',
    'toast.addedWithoutMeta': 'تم حفظه، ويمكنك إضافة تفاصيله لاحقاً.',
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

/* ---------------------------- editable content ------------------------------
 * CONTENT holds every override the owner has saved on the server, layered on
 * top of the built-in I18N defaults above. Nothing is hard-coded once the
 * owner has touched it — every word, number and image link can be replaced.
 * ---------------------------------------------------------------------------- */
let CONTENT = { en: {}, ar: {}, site: {} };

function ov(scope, path) {
  const bucket = CONTENT[scope];
  return bucket && Object.prototype.hasOwnProperty.call(bucket, path) ? bucket[path] : undefined;
}

function baseText(l, key) {
  return I18N[l] && I18N[l][key];
}

const t = (key) => {
  const o = ov(lang, key);
  if (o !== undefined) return o;
  return baseText(lang, key) ?? baseText('en', key) ?? key;
};

/** Effective value of an array-type i18n entry (strings or {t,d} objects)
 *  with any per-item / per-field overrides applied on top. */
function effectiveList(key) {
  const base = baseText(lang, key) || baseText('en', key) || [];
  return base.map((item, i) => {
    if (item && typeof item === 'object') {
      const out = { ...item };
      Object.keys(item).forEach((field) => {
        const o = ov(lang, `${key}.${i}.${field}`);
        if (o !== undefined) out[field] = o;
      });
      return out;
    }
    const o = ov(lang, `${key}.${i}`);
    return o !== undefined ? o : item;
  });
}

function effectiveContacts() {
  return DEFAULT_CONTACTS.map((c, i) => {
    const raw = ov('site', `contacts.${i}.display`);
    const display = raw !== undefined ? raw : c.display;
    const digits = String(display).replace(/\D/g, '');
    let e164 = digits;
    if (digits.startsWith('0')) e164 = '20' + digits.slice(1);
    else if (!digits.startsWith('20')) e164 = '20' + digits;
    return { ...c, display, local: digits, e164 };
  });
}

function effectiveShowcase() {
  // An owner may pin custom images in the settings. Otherwise the showcase is
  // populated only from real portfolio entries that have a preview image.
  const custom = Array.from({ length: SHOWCASE_SLOTS }, (_, i) =>
    ov('site', `showcase.${i}`) || DEFAULT_SHOWCASE[i],
  ).filter(Boolean);
  if (custom.length) return custom;
  return projects.filter((project) => project && project.image).slice(0, 4).map((project) => project.image);
}

async function fetchContent() {
  try {
    const res = await fetch('/api/content', { cache: 'no-store' });
    const data = await res.json();
    if (data && data.ok && data.content) {
      CONTENT = {
        en: data.content.en || {},
        ar: data.content.ar || {},
        site: data.content.site || {},
      };
    }
  } catch { /* fall back to defaults */ }
}

async function saveContent(scope, path, value) {
  const res = await fetch('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope, path, value }),
  });
  if (!res.ok) throw new Error('save-failed');
  const data = await res.json().catch(() => ({}));
  if (!data.ok) throw new Error('save-failed');
  if (!CONTENT[scope]) CONTENT[scope] = {};
  CONTENT[scope][path] = value;
  return data;
}

async function resetContent(scope, path) {
  const res = await fetch(`/api/content?scope=${encodeURIComponent(scope)}&path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('reset-failed');
  if (CONTENT[scope]) delete CONTENT[scope][path];
}

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

  const COLORS = ['#168cff', '#6c3bff', '#e83baf'];
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

      ctx.globalAlpha = d.a * .8;
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
    ctx.strokeStyle = '#8fb6ff';
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

  applyAttributeBindings();

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
  buildShowcase();
  syncContactLinks();
  setOwner(isOwner, { quiet: true });
  renderGrid();
  buildOwnerSettings();
  setEditMode(editingOn);
}

/** Text/attribute bindings that don't live inside a rebuildable list:
 *  document title, meta description, plain data-i18n(-html/-ph/-title) nodes.
 *  Re-run any time content changes so an owner edit shows up everywhere
 *  it is quoted, immediately, without a page reload. */
function applyAttributeBindings() {
  document.title = t('doc.title');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', t('meta.description'));

  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $$('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', t(el.dataset.i18nTitle));
  });
}

/* ======================================================================
   MARQUEE / STREAM / TAGS
   ====================================================================== */

function buildMarquee() {
  const track = $('#marquee-track');
  if (!track) return;
  const items = effectiveList('marquee');
  const one = items
    .map((s, i) => `<span class="marquee-item"><i>✦</i><span data-edit-scope="${lang}" data-edit-path="marquee.${i}" data-edit-default="${esc(baseText(lang, 'marquee')[i] ?? '')}">${esc(s)}</span></span>`)
    .join('');
  track.innerHTML = one + one;
  refreshEditables();
}

function buildStream() {
  const items = effectiveList('services.stream');
  const defaults = baseText(lang, 'services.stream') || [];
  $$('.stream-track').forEach((track, row) => {
    const order = items.map((_, i) => (i + row * 6) % items.length);
    const one = order
      .map((realIdx, j) => `<span class="stream-chip${(j + row) % 5 === 0 ? ' hot' : ''}" data-edit-scope="${lang}" data-edit-path="services.stream.${realIdx}" data-edit-default="${esc(defaults[realIdx] ?? '')}">${esc(items[realIdx])}</span>`)
      .join('');
    track.innerHTML = one + one;
  });
  refreshEditables();
}

function buildTags() {
  const el = $('#tags');
  if (!el) return;
  const items = effectiveList('about.tags');
  const defaults = baseText(lang, 'about.tags') || [];
  el.innerHTML = items
    .map((s, i) => `<li data-edit-scope="${lang}" data-edit-path="about.tags.${i}" data-edit-default="${esc(defaults[i] ?? '')}">${esc(s)}</li>`)
    .join('');
  refreshEditables();
}

/* ======================================================================
   SERVICES — the flood
   ====================================================================== */

const SVC_ICONS = [
  /* graphic design */   '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  /* logo & identity */  '<path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4z"/>',
  /* social media */     '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  /* advertising */      '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  /* photo retouch */    '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  /* presentations */    '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M6 21h12M12 17v4M6 8h6M6 12h9"/>',
  /* website design */   '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  /* ui / ux */          '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><circle cx="17.5" cy="17.5" r="3.5"/>',
  /* landing pages */    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
  /* e-commerce */       '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  /* web development */  '<path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/>',
  /* hosting & care */   '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
];

/* WhatsApp deep link with a prefilled message (kept in sync with the owner's numbers). */
const waLink = (e164, msg) =>
  `https://wa.me/${e164}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;

const WA_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2zm0 18.06h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.05-.2-.31a8.22 8.22 0 0 1-1.26-4.39c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.25-8.24 8.25zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07s.9 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28z"/></svg>';

function buildServices() {
  const grid = $('#services-grid');
  if (!grid) return;
  const items = effectiveList('services.items');
  const defaults = baseText(lang, 'services.items') || [];
  const main = effectiveContacts()[0];
  const orderLabel = t('services.order');
  const orderDefault = baseText(lang, 'services.order') ?? baseText('en', 'services.order') ?? '';
  grid.innerHTML = items
    .map((s, i) => {
      const msg = String(t('services.orderMsg')).replace('{s}', s.t);
      return `
      <article class="svc" style="--rd:${(i % 4) * 90 + Math.floor(i / 4) * 120}ms; --rot:${i % 2 ? 2 : -2}deg">
        <span class="svc-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="svc-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${SVC_ICONS[i % SVC_ICONS.length]}</svg>
        </span>
        <h3 data-edit-scope="${lang}" data-edit-path="services.items.${i}.t" data-edit-default="${esc(defaults[i] ? defaults[i].t : '')}">${esc(s.t)}</h3>
        <p data-edit-scope="${lang}" data-edit-path="services.items.${i}.d" data-edit-default="${esc(defaults[i] ? defaults[i].d : '')}">${esc(s.d)}</p>
        <a class="svc-order" data-msg="${esc(msg)}" href="${esc(waLink(main ? main.e164 : '', msg))}" target="_blank" rel="noopener">
          ${WA_SVG}
          <span data-edit-scope="${lang}" data-edit-path="services.order" data-edit-default="${esc(orderDefault)}">${esc(orderLabel)}</span>
        </a>
      </article>`;
    })
    .join('');
  observeReveals();
  refreshEditables();
}

/** Keep every per-card order button's WhatsApp link in sync with the
 *  current card title, language and (owner-editable) phone number. */
function refreshServiceOrderLinks() {
  const main = effectiveContacts()[0];
  if (!main) return;
  $$('.svc').forEach((card) => {
    const a = card.querySelector('.svc-order');
    const h3 = card.querySelector('h3');
    if (!a || !h3) return;
    const msg = String(t('services.orderMsg')).replace('{s}', h3.textContent.trim());
    a.dataset.msg = msg;
    a.href = waLink(main.e164, msg);
  });
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
  document.documentElement.dataset.deviceMode = deviceMode;
  $$('.device').forEach((d) => { d.dataset.mode = deviceMode; });
  $$('.device-switch button').forEach((b) => {
    const active = b.dataset.device === deviceMode;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
}

/* hero showcase ------------------------------------------------------------ */

let showIndex = 0;
let showTimer = null;

function buildShowcase() {
  const stack = $('#hero-stack');
  const dots = $('#hero-dots');
  if (!stack || !dots) return;
  const shots = effectiveShowcase();
  clearInterval(showTimer);
  showIndex = 0;

  if (!shots.length) {
    stack.innerHTML = `<div class="showcase-empty"><span aria-hidden="true">✦</span><p>${esc(t('showcase.empty'))}</p></div>`;
    dots.innerHTML = '';
    dots.hidden = true;
    return;
  }

  stack.innerHTML = shots
    .map((src, i) => `<div class="shot${i === 0 ? ' active' : ''}"><img src="${esc(src)}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}"></div>`)
    .join('');
  dots.hidden = false;
  dots.innerHTML = shots
    .map((_, i) => `<button type="button" role="tab" class="${i === 0 ? 'active' : ''}" aria-label="Screen ${i + 1}"></button>`)
    .join('');

  dots.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => goShot(i, true)));
  if (shots.length > 1) startShowcase();
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
    ${isOwner ? `<div class="project-admin-actions"><button class="btn-project-edit" type="button" title="${esc(t('project.edit'))}" aria-label="${esc(t('project.edit'))}">✎</button><button class="btn-remove" type="button" title="${esc(t('card.remove'))}" aria-label="${esc(t('card.remove'))}">✕</button></div>` : ''}
    <div class="device float" data-mode="${deviceMode}">
      <div class="device-glow" aria-hidden="true"></div>
      <div class="device-body">
        <span class="notch" aria-hidden="true"></span>
        <span class="cam" aria-hidden="true"></span>
        <a class="device-screen" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="${esc(projTitle(p))}">
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
        <a class="btn-visit" href="${esc(p.url)}" target="_blank" rel="noopener"><span data-i18n="card.visit">${esc(t('card.visit'))}</span> <span aria-hidden="true">↗</span></a>
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
  buildShowcase();
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

function basicProjectData(url) {
  const parsed = new URL(url);
  const host = parsed.hostname.replace(/^www\./, '');
  return { url: parsed.toString(), host, title: host, description: '', image: null, favicon: null };
}

async function analyzeAndAdd(url) {
  const btn = $('#add-btn');
  const spinner = $('#add-spinner');
  const label = $('#add-label');

  btn.disabled = true;
  spinner.hidden = false;
  label.textContent = t('form.btnLoading');

  try {
    // Metadata is an enhancement, not a requirement for saving a website. A
    // valid link is always kept even when its host blocks metadata requests.
    let data;
    let metadataUnavailable = false;
    try {
      data = await analyzeSite(url);
    } catch {
      data = basicProjectData(url);
      metadataUnavailable = true;
    }

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
    const suffix = metadataUnavailable ? t('toast.addedWithoutMeta') : t('toast.added');
    toast(`${out.project.title} — ${suffix}`, 'success');
  } catch {
    toast(t('toast.savefail'), 'error');
    shakeInput();
  } finally {
    btn.disabled = false;
    spinner.hidden = true;
    label.textContent = t('form.btn');
  }
}

function openProjectEditor(id) {
  const p = projects.find((item) => item.id === id);
  if (!p || !isOwner) return;
  $('#project-edit-id').value = p.id;
  $('#project-title').value = p.title || '';
  $('#project-title-ar').value = p.titleAr || '';
  $('#project-url').value = p.url || '';
  $('#project-description').value = p.description || '';
  $('#project-description-ar').value = p.descriptionAr || '';
  $('#project-image').value = p.image || '';
  $('#project-favicon').value = p.favicon || '';
  $('#project-tag').value = p.tag || '';
  $('#project-edit-error').hidden = true;
  $('#project-modal').hidden = false;
  document.body.classList.add('locked');
  setTimeout(() => $('#project-title').focus(), 50);
}

function closeProjectEditor() {
  $('#project-modal').hidden = true;
  document.body.classList.remove('locked');
}

async function saveProjectDetails() {
  const id = $('#project-edit-id').value;
  const payload = {
    title: $('#project-title').value.trim(), titleAr: $('#project-title-ar').value.trim(),
    url: normalizeUrl($('#project-url').value),
    description: $('#project-description').value.trim(), descriptionAr: $('#project-description-ar').value.trim(),
    image: $('#project-image').value.trim() || null, favicon: $('#project-favicon').value.trim() || null,
    tag: $('#project-tag').value.trim(),
  };
  const error = $('#project-edit-error');
  if (!payload.title || !payload.url) {
    error.textContent = lang === 'ar' ? 'العنوان والرابط الصحيح مطلوبان.' : 'A title and valid URL are required.';
    error.hidden = false; return;
  }
  try {
    const res = await fetch('/api/projects?id=' + encodeURIComponent(id), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.ok) throw new Error(out.error || 'save-failed');
    projects = projects.map((p) => p.id === id ? out.project : p);
    renderGrid(); closeProjectEditor(); toast(t('project.saved'), 'success');
  } catch {
    error.textContent = t('owner.savefail'); error.hidden = false;
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
   OWNER — INLINE CONTENT EDITING
   Every visible word on the page (headings, list items, contact numbers,
   button labels…) is wrapped by data-i18n / data-i18n-html / data-edit-path.
   When the owner turns editing on, those elements become contenteditable;
   saving PUTs the new value to /api/content so it is live for every visitor.
   ====================================================================== */

let editingOn = false;

function ownerEditablesSelector() {
  return '[data-i18n]:not([data-no-edit]), [data-i18n-html]:not([data-no-edit]), [data-edit-path]:not([data-no-edit])';
}

function editableInfo(el) {
  if (el.dataset.editPath) {
    return { scope: el.dataset.editScope || 'site', path: el.dataset.editPath, html: false, isSite: true };
  }
  if (el.dataset.i18nHtml) return { scope: lang, path: el.dataset.i18nHtml, html: true, isSite: false };
  if (el.dataset.i18n) return { scope: lang, path: el.dataset.i18n, html: false, isSite: false };
  return null;
}

function defaultValueFor(el, info) {
  if (el.dataset.editDefault !== undefined) return el.dataset.editDefault;
  return baseText(info.scope, info.path) ?? baseText('en', info.path) ?? '';
}

function validateEdit(info, value) {
  if (info.path.startsWith('contacts.') && info.path.endsWith('.display')) {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 7) return t('owner.badPhone');
  }
  if (info.path.startsWith('showcase.')) {
    if (!/^https?:\/\//i.test(value) && !value.startsWith('/')) return t('owner.badImage');
  }
  return null;
}

function wireEditableOnce(el) {
  if (el.__editWired) return;
  el.__editWired = true;
  el.classList.add('owner-editable');

  let before = '';
  el.addEventListener('focus', () => {
    if (!editingOn) return;
    const info = editableInfo(el);
    before = info && info.html ? el.innerHTML : el.textContent;
  });

  el.addEventListener('keydown', (e) => {
    if (!editingOn) return;
    if (e.key === 'Escape') {
      const info = editableInfo(el);
      if (info) { if (info.html) el.innerHTML = before; else el.textContent = before; }
      el.blur();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      el.blur();
    }
  });

  el.addEventListener('blur', () => {
    if (!editingOn) return;
    commitEdit(el, before);
  });

  el.addEventListener('click', (e) => {
    if (editingOn) e.preventDefault();
  });

  el.addEventListener('dblclick', (e) => {
    if (!editingOn) return;
    e.preventDefault();
    resetField(el);
  });
}

async function commitEdit(el, before) {
  const info = editableInfo(el);
  if (!info) return;
  const now = (info.html ? el.innerHTML : el.textContent).trim();
  const prev = before.trim();
  if (now === prev) return;

  if (!now) {
    if (info.html) el.innerHTML = before; else el.textContent = before;
    toast(t('owner.emptyRevert'), 'error');
    return;
  }

  const badReason = validateEdit(info, now);
  if (badReason) {
    if (info.html) el.innerHTML = before; else el.textContent = before;
    toast(badReason, 'error');
    return;
  }

  el.classList.add('saving');
  try {
    await saveContent(info.scope, info.path, now);
    el.classList.remove('saving');
    el.classList.add('saved-flash');
    setTimeout(() => el.classList.remove('saved-flash'), 900);
    syncAfterContentChange(info.path);
  } catch {
    el.classList.remove('saving');
    if (info.html) el.innerHTML = before; else el.textContent = before;
    toast(t('owner.savefail'), 'error');
  }
}

async function resetField(el) {
  const info = editableInfo(el);
  if (!info) return;
  const def = defaultValueFor(el, info);
  try {
    await resetContent(info.scope, info.path);
    if (info.html) el.innerHTML = def; else el.textContent = def;
    toast(t('owner.reset'), 'success');
    syncAfterContentChange(info.path);
  } catch {
    toast(t('owner.resetfail'), 'error');
  }
}

/** After any save/reset, ripple the change out to every other place that
 *  quotes the same piece of content (links, meta tags, card tooltips…). */
function syncAfterContentChange(path) {
  if (path.startsWith('contacts.')) syncContactLinks();
  if (path.startsWith('services.')) refreshServiceOrderLinks();
  if (path.startsWith('showcase.')) buildShowcase();
  applyAttributeBindings();
  if (path === 'card.remove' || path === 'card.visit') renderGrid();
}

function refreshEditables() {
  $$(ownerEditablesSelector()).forEach((el) => {
    wireEditableOnce(el);
    el.setAttribute('contenteditable', editingOn ? 'true' : 'false');
  });
}

function setEditMode(on) {
  editingOn = Boolean(on) && isOwner;
  document.body.classList.toggle('owner-editing', editingOn);
  const btn = $('#edit-toggle-btn');
  if (btn) {
    btn.textContent = t(editingOn ? 'owner.editOff' : 'owner.editOn');
    btn.classList.toggle('active', editingOn);
  }
  const hint = $('#edit-hint');
  if (hint) hint.hidden = !editingOn;
  refreshEditables();
}

/* ------------------------------ settings panel ------------------------------
 * Fields that aren't visible page text (tooltips, placeholders, meta tags,
 * phone numbers, showcase images) get a small labelled form here so the
 * owner can still change them in one place. */

const SETTINGS_FIELDS = () => ([
  { scope: lang, path: 'doc.title', label: t('settings.docTitle'), kind: 'text' },
  { scope: lang, path: 'meta.description', label: t('settings.metaDescription'), kind: 'textarea' },
  { scope: lang, path: 'form.placeholder', label: t('settings.placeholder'), kind: 'text' },
  { scope: lang, path: 'device.phone', label: t('settings.devicePhone'), kind: 'text' },
  { scope: lang, path: 'device.laptop', label: t('settings.deviceLaptop'), kind: 'text' },
  { scope: lang, path: 'card.remove', label: t('settings.cardRemove'), kind: 'text' },
  { scope: 'site', path: 'contacts.0.display', label: t('settings.contact1'), kind: 'text', dir: 'ltr' },
  { scope: 'site', path: 'contacts.1.display', label: t('settings.contact2'), kind: 'text', dir: 'ltr' },
  { scope: 'site', path: 'showcase.0', label: `${t('settings.showcase')} 1`, kind: 'text', dir: 'ltr' },
  { scope: 'site', path: 'showcase.1', label: `${t('settings.showcase')} 2`, kind: 'text', dir: 'ltr' },
  { scope: 'site', path: 'showcase.2', label: `${t('settings.showcase')} 3`, kind: 'text', dir: 'ltr' },
  { scope: 'site', path: 'showcase.3', label: `${t('settings.showcase')} 4`, kind: 'text', dir: 'ltr' },
]);

function settingsFieldValue(f) {
  const o = ov(f.scope, f.path);
  if (o !== undefined) return o;
  if (f.scope === 'site') {
    const cm = f.path.match(/^contacts\.(\d+)\.display$/);
    if (cm) return DEFAULT_CONTACTS[Number(cm[1])]?.display || '';
    const sm = f.path.match(/^showcase\.(\d+)$/);
    if (sm) return DEFAULT_SHOWCASE[Number(sm[1])] || '';
    return '';
  }
  return baseText(f.scope, f.path) ?? baseText('en', f.path) ?? '';
}

function buildOwnerSettings() {
  const body = $('#owner-settings-body');
  if (!body || !isOwner) return;
  const fields = SETTINGS_FIELDS();
  body.innerHTML = fields.map((f, i) => `
    <div class="settings-row">
      <label for="setting-${i}">${esc(f.label)}</label>
      ${f.kind === 'textarea'
        ? `<textarea id="setting-${i}" rows="2" dir="${f.dir || 'auto'}" data-scope="${f.scope}" data-path="${f.path}">${esc(settingsFieldValue(f))}</textarea>`
        : `<input id="setting-${i}" type="text" dir="${f.dir || 'auto'}" data-scope="${f.scope}" data-path="${f.path}" value="${esc(settingsFieldValue(f))}">`}
      <button type="button" class="settings-reset" data-scope="${f.scope}" data-path="${f.path}" title="${esc(t('owner.reset'))}" aria-label="${esc(t('owner.reset'))}">↺</button>
    </div>`).join('');

  body.querySelectorAll('input[data-path], textarea[data-path]').forEach((input) => {
    input.addEventListener('change', async () => {
      const { scope, path } = input.dataset;
      const value = input.value.trim();
      if (!value) { toast(t('owner.emptyRevert'), 'error'); input.value = settingsFieldValue({ scope, path }); return; }
      const badReason = validateEdit({ path }, value);
      if (badReason) { toast(badReason, 'error'); input.value = settingsFieldValue({ scope, path }); return; }
      try {
        await saveContent(scope, path, value);
        toast(t('owner.saved'), 'success');
        syncAfterContentChange(path);
      } catch {
        toast(t('owner.savefail'), 'error');
      }
    });
  });

  body.querySelectorAll('.settings-reset').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const { scope, path } = btn.dataset;
      try {
        await resetContent(scope, path);
        toast(t('owner.reset'), 'success');
        syncAfterContentChange(path);
        buildOwnerSettings();
      } catch {
        toast(t('owner.resetfail'), 'error');
      }
    });
  });
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
  if (value) buildOwnerSettings();
  if (!value) setEditMode(false);
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
  const contacts = effectiveContacts();
  wrap.innerHTML = contacts.map((c, i) => `
    <div class="contact-card reveal" style="--rd:${180 + i * 90}ms">
      <span class="cc-label" data-i18n="${c.labelKey}">${esc(t(c.labelKey))}</span>
      <a class="cc-num" href="tel:+${c.e164}" dir="ltr" data-edit-scope="site" data-edit-path="contacts.${i}.display" data-edit-default="${esc(DEFAULT_CONTACTS[i].display)}">${esc(c.display)}</a>
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
  refreshEditables();
}

/** Every place a phone number is quoted outside the contact cards (hero
 *  WhatsApp button, floating WhatsApp fab, footer line) is kept in sync
 *  with the owner-editable contacts list. */
function syncContactLinks() {
  const contacts = effectiveContacts();
  const main = contacts[0];
  if (!main) return;
  const heroOrder = $('#hero-order-link');
  if (heroOrder) heroOrder.href = waLink(main.e164, t('hero.orderMsg'));
  const servicesCta = $('#services-order-btn');
  if (servicesCta) servicesCta.href = waLink(main.e164, t('hero.orderMsg'));
  const fab = $('#wa-fab-link');
  if (fab) fab.href = `https://wa.me/${main.e164}`;
  refreshServiceOrderLinks();
  const footer = $('#footer-phones');
  if (footer) footer.textContent = contacts.map((c) => c.display).join(' · ');
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
  $('#edit-toggle-btn').addEventListener('click', () => setEditMode(!editingOn));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editingOn && document.activeElement === document.body) setEditMode(false);
  });
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

  // edit / remove project
  $('#grid').addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-project-edit');
    const removeBtn = e.target.closest('.btn-remove');
    const card = e.target.closest('.work-card');
    if (editBtn && card) { e.preventDefault(); openProjectEditor(card.dataset.id); }
    if (removeBtn && card) { e.preventDefault(); removeProject(card.dataset.id); }
  });
  $('#project-edit-form').addEventListener('submit', (e) => { e.preventDefault(); saveProjectDetails(); });
  $$('#project-modal [data-project-close]').forEach((el) => el.addEventListener('click', closeProjectEditor));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#project-modal').hidden) closeProjectEditor();
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

/* ======================================================================
   REACTIVE 3D MOTION
   ====================================================================== */
/* ----------------------------------------------------------------------
 * FLOATING GLASS CUBES
 * A light field of transparent 3D cubes (and a few light particles) drifts
 * across the page. Each one spins slowly on its own and glides very gently
 * with the scroll — subtle depth, never a heavy parallax.
 * -------------------------------------------------------------------- */
const CUBE_PLAN = [
  { x: 4,  y: 12, s: 86, c: 'c-blue',   f: -0.035, spin: 30, bob: 11, d: 0 },
  { x: 88, y: 18, s: 64, c: 'c-cyan',   f:  0.045, spin: 24, bob: 9,  d: -3 },
  { x: 14, y: 52, s: 46, c: 'c-violet', f:  0.055, spin: 21, bob: 8,  d: -5 },
  { x: 79, y: 58, s: 96, c: 'c-pink',   f: -0.05,  spin: 34, bob: 13, d: -2 },
  { x: 46, y: 78, s: 38, c: 'c-cyan',   f:  0.06,  spin: 18, bob: 7,  d: -6 },
  { x: 92, y: 84, s: 56, c: 'c-violet', f: -0.04,  spin: 27, bob: 10, d: -1 },
  { x: 6,  y: 86, s: 70, c: 'c-blue',   f:  0.038, spin: 32, bob: 12, d: -4 },
];

const PARTICLE_PLAN = [
  { x: 24, y: 24, s: 6, c: 'rgba(37,199,255,.5)',  f: 0.07, bob: 13, d: 0 },
  { x: 62, y: 16, s: 4, c: 'rgba(108,59,255,.45)', f: -0.05, bob: 11, d: -3 },
  { x: 34, y: 66, s: 5, c: 'rgba(232,59,175,.4)',  f: 0.06, bob: 15, d: -6 },
  { x: 70, y: 40, s: 4, c: 'rgba(22,140,255,.45)', f: -0.06, bob: 12, d: -2 },
  { x: 88, y: 70, s: 6, c: 'rgba(37,199,255,.4)',  f: 0.05, bob: 14, d: -8 },
];

function buildCubeField() {
  const field = $('#cube-field');
  if (!field) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { field.innerHTML = ''; return; }

  const small = window.matchMedia('(max-width: 760px)').matches;
  const cubes = small ? CUBE_PLAN.filter((_, i) => i % 2 === 0) : CUBE_PLAN;
  const dots = small ? PARTICLE_PLAN.slice(0, 2) : PARTICLE_PLAN;

  field.innerHTML =
    cubes.map((c) => `
      <span class="pcube ${c.c}" data-f="${c.f}"
            style="left:${c.x}%; top:${c.y}%; --s:${small ? Math.round(c.s * .68) : c.s}px; --spin:${c.spin}s; --bob:${c.bob}s; --d:${c.d}s">
        <span class="pcube-f"><span class="pcube-i"><i></i><i></i><i></i><i></i><i></i><i></i></span></span>
      </span>`).join('') +
    dots.map((p) => `
      <span class="particle" data-f="${p.f}"
            style="left:${p.x}%; top:${p.y}%; --ps:${p.s}px; --pc:${p.c}; --bob:${p.bob}s; --d:${p.d}s"></span>`).join('');

  const movers = Array.from(field.children);
  let ticking = false;
  const place = () => {
    const y = window.scrollY || 0;
    movers.forEach((el) => {
      el.style.setProperty('--sy', (y * parseFloat(el.dataset.f || 0)).toFixed(1));
    });
    ticking = false;
  };
  const onScrollCubes = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(place);
  };
  addEventListener('scroll', onScrollCubes, { passive: true });
  place();
}

function init3DMotion() {
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduced) return;

  document.body.classList.add('has-pointer');
  const aura = $('#cursor-aura');
  let frame = 0, mouseX = innerWidth / 2, mouseY = innerHeight / 2;

  const paintPointer = () => {
    frame = 0;
    if (aura) {
      aura.style.setProperty('--mx', `${mouseX}px`);
      aura.style.setProperty('--my', `${mouseY}px`);
    }
  };
  addEventListener('pointermove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (!frame) frame = requestAnimationFrame(paintPointer);
  }, { passive: true });

  const hero = $('#hero-visual');
  if (hero) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      hero.style.setProperty('--ry', `${(x * 11).toFixed(2)}deg`);
      hero.style.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`);
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--rx', '0deg');
      hero.style.setProperty('--ry', '0deg');
    });
  }

  // Event delegation keeps cards added later by the owner fully interactive.
  let activeCard = null;
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.svc, .about-card, .work-card');
    if (activeCard && activeCard !== card) {
      activeCard.style.setProperty('--card-rx', '0deg');
      activeCard.style.setProperty('--card-ry', '0deg');
    }
    activeCard = card;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const py = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    card.style.setProperty('--card-rx', `${((.5 - py) * 8).toFixed(2)}deg`);
    card.style.setProperty('--card-ry', `${((px - .5) * 10).toFixed(2)}deg`);
  }, { passive: true });
  document.addEventListener('pointerout', (e) => {
    const card = e.target.closest('.svc, .about-card, .work-card');
    if (card && !card.contains(e.relatedTarget)) {
      card.style.setProperty('--card-rx', '0deg');
      card.style.setProperty('--card-ry', '0deg');
      if (activeCard === card) activeCard = null;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  init3DMotion();
  buildCubeField();
  bindEvents();
  buildShowcase();
  buildBubbles();
  applyLang(lang); // paint immediately with built-in defaults, no flash
  applyDeviceMode(deviceMode, { remember: false });
  observeReveals();
  fetchContent().then(() => applyLang(lang)); // then layer any owner overrides on top
  checkSession().then(loadProjects);
});
