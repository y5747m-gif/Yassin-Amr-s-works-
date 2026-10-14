'use strict';

/**
 * Pixelio — Built-in works (lib/seed-projects.js)
 *
 * The live projects of the studio, written as data instead of being re-typed
 * every time the site is deployed on a new machine or database.
 *
 * How they are used
 * -----------------
 * `lib/db.js` reads this list once per fresh store (`seedBuiltInProjects()`)
 * and writes any work that is not there yet into the same table the owner
 * panel uses. After that they are ordinary projects: the owner can rename,
 * re-describe, re-order, hide or delete them from the site, and nothing is
 * ever re-created behind their back — the seed records a marker the first time
 * it runs, so a deleted work stays deleted.
 *
 * Adding a new work later: append it to the list below (keep `key` unique) and
 * bump `SEED_VERSION`. The next boot adds only the new entries; existing rows
 * are never overwritten, so owner edits always win.
 *
 * Fields: key · url · host · title/titleAr · description/descriptionAr ·
 *         image (optional screenshot) · favicon · tag · order
 * Titles, descriptions and tags are kept in both languages; the site shows the
 * visitor's language automatically.
 */

const SEED_VERSION = 1;

/** Marker stored in the content store (site scope) once seeding has run. */
const SEED_MARKER_PATH = `__builtin_projects_v${SEED_VERSION}`;

const SEED_PROJECTS = [
  {
    key: 'ningawy',
    url: 'https://ningawy.vercel.app/',
    host: 'ningawy.vercel.app',
    title: 'NINJAWY — Online store at ninja speed',
    titleAr: 'ننجاوي — متجر إلكتروني بسرعة النينجا',
    description:
      'A complete online store: products sorted by category, rotating offers with a countdown, WhatsApp ordering, cash on delivery and a built-in admin panel for managing the catalogue.',
    descriptionAr:
      'متجر إلكتروني متكامل: منتجات مصنّفة بالأقسام، عروض متجددة بعدّاد تنازلي، طلب عبر واتساب، دفع عند الاستلام، ولوحة تحكم لإدارة المنتجات.',
    image: null,
    favicon: null,
    tag: 'E-commerce',
    order: 1,
  },
  {
    key: 'muslim-wa-bas',
    url: 'https://muslim-wa-bas-ai-assistant-1.vercel.app/',
    host: 'muslim-wa-bas-ai-assistant-1.vercel.app',
    title: 'Muslim Wa Bas — Smart Fajr & prayer alarm',
    titleAr: 'هتصلي يعني هتصلي — منبه الفجر والصلاة الذكي',
    description:
      'A prayer companion that wakes you for Fajr and every prayer, keeps working without internet and installs on the phone like a native app.',
    descriptionAr:
      'منبّه لصلاة الفجر وسائر الصلوات، يعمل بدون إنترنت ويُثبَّت على الهاتف كتطبيق أصلي بضغطة واحدة.',
    image: null,
    favicon: 'https://muslim-wa-bas-ai-assistant-1.vercel.app/icons/icon-192x192.png',
    tag: 'App · PWA',
    order: 2,
  },
  {
    key: 'el-mona-akademe',
    url: 'https://el-mona-akademe.vercel.app/',
    host: 'el-mona-akademe.vercel.app',
    title: 'El Mona Akademe — Complete online academy',
    titleAr: 'أكاديمية المنى — منصة تعليمية متكاملة',
    description:
      'An academy platform for secondary-school students: interactive live streaming with chat and a smart board, secure login by code, PDFs and recorded lessons, attendance reports and final-exam revisions.',
    descriptionAr:
      'منصة تعليمية لطلاب الثانوية: بث مباشر تفاعلي بشات وسبورة ذكية، دخول آمن بكود، مذكرات وملازم وفيديوهات مسجّلة، تقارير حضور ومراجعات ليلة الامتحان.',
    image: null,
    favicon: 'https://el-mona-akademe.vercel.app/favicon.svg',
    tag: 'Education',
    order: 3,
  },
  {
    key: 'montage-studio-pro',
    url: 'https://montag-est.vercel.app/',
    host: 'montag-est.vercel.app',
    title: 'Montage Studio Pro — Video & motion editor in the browser',
    titleAr: 'مونتاج ستوديو برو — استوديو مونتاج وموشن جرافيك في المتصفح',
    description:
      'A full editing studio that needs no install: multi-track timeline, 13 transitions, colour grading, light and distortion effects, motion titles, sound effects and one-click templates.',
    descriptionAr:
      'استوديو مونتاج كامل بدون تثبيت: خط زمني متعدد الطبقات، ١٣ انتقالًا، تصحيح ألوان، تأثيرات ضوء وتشويه، نصوص متحركة، مؤثرات صوتية وقوالب جاهزة بضغطة.',
    image: null,
    favicon: 'https://montag-est.vercel.app/assets/favicon.svg',
    tag: 'Web app',
    order: 4,
  },
  {
    key: 'mokta-ai-3d',
    url: 'https://yaseen868.vercel.app/',
    host: 'yaseen868.vercel.app',
    title: 'Mokta AI 3D — Turn any photo into a 3D model',
    titleAr: 'Mokta AI 3D — تحويل أي صورة إلى نموذج ثلاثي الأبعاد',
    description:
      'An image-to-3D engine that runs entirely inside the browser: object detection, segmentation, depth estimation, mesh reconstruction and texture baking, with export to GLB, glTF, OBJ, STL and PLY — no upload and no external API.',
    descriptionAr:
      'محرك يحوّل الصورة إلى مجسم ثلاثي الأبعاد داخل المتصفح: اكتشاف الأجسام والعزل وتقدير العمق وبناء الشبكة وخبز الـ Texture، مع تصدير GLB وglTF وOBJ وSTL وPLY — بدون رفع وبدون أي API خارجي.',
    image: 'https://yaseen868.vercel.app/assets/og-image.png',
    favicon: 'https://yaseen868.vercel.app/favicon.ico',
    tag: 'AI',
    order: 5,
  },
  {
    key: 'ork-zone',
    url: 'https://shoter-ork-geto.vercel.app/',
    host: 'shoter-ork-geto.vercel.app',
    title: 'ORK ZONE — 50-player battle royale',
    titleAr: 'أورك زون — باتل رويال ٥٠ لاعبًا',
    description:
      'A battle royale that runs online and offline on phones and computers: 5 maps, 10+ weapons, 12 fighters with special skills, a battle pass, a store and friend rooms — plus a prayer guardian that pauses the game at prayer time.',
    descriptionAr:
      'لعبة باتل رويال تعمل أونلاين وأوفلاين على الهواتف والكمبيوتر: ٥ خرائط، أكثر من ١٠ أسلحة، ١٢ مقاتلًا بمهارات خاصة، باس معركة ومتجر وغرف بالأصدقاء — مع حارس صلاة يوقف اللعبة عند وقت الصلاة.',
    image: null,
    favicon: 'https://shoter-ork-geto.vercel.app/icons/icon-192.png',
    tag: 'Game',
    order: 6,
  },
  {
    key: 'sparta-ai',
    url: 'https://t-m-d-ai.vercel.app/',
    host: 't-m-d-ai.vercel.app',
    title: 'SPARTA AI — Arabic assistant for chat & video',
    titleAr: 'SPARTA AI — مساعد ذكاء اصطناعي عربي للمحادثة والفيديو',
    description:
      'An Arabic-first AI assistant: instant chat, document analysis, image understanding and AI video generation up to 30 seconds, wrapped in a fast responsive interface.',
    descriptionAr:
      'مساعد ذكاء اصطناعي بواجهة عربية أولًا: محادثة فورية، تحليل مستندات وفهم صور، وإنشاء فيديو بالذكاء الاصطناعي حتى ٣٠ ثانية، بواجهة سريعة ومتجاوبة.',
    image: 'https://t-m-d-ai.vercel.app/images/og-image.jpg',
    favicon: 'https://t-m-d-ai.vercel.app/favicon.svg',
    tag: 'AI',
    order: 7,
  },
  {
    key: 'nova-study',
    url: 'https://souqi-944p.vercel.app/',
    host: 'souqi-944p.vercel.app',
    title: 'NOVA STUDY — Smart study planner for students',
    titleAr: 'NOVA STUDY — منصة مذاكرة ذكية للطلاب',
    description:
      'A study companion: every subject in one place, a daily plan, progress tracking, reminders and an AI study buddy that explains lessons, summarises them and builds quizzes in seconds.',
    descriptionAr:
      'رفيق المذاكرة للطلاب: كل المواد في مكان واحد، خطة يومية، متابعة تقدّم، تنبيهات، ومساعد دراسي ذكي يشرح ويلخّص ويولّد اختبارًا في ثوانٍ.',
    image: null,
    favicon: 'https://souqi-944p.vercel.app/favicon.ico',
    tag: 'Education',
    order: 8,
  },
  {
    key: 'nova-os',
    url: 'https://nova-os-psi.vercel.app/',
    host: 'nova-os-psi.vercel.app',
    title: 'NOVA OS — A new way to use your phone',
    titleAr: 'NOVA OS — طريقة جديدة لاستخدام هاتفك',
    description:
      'A launcher concept for phones: lock screen, app sphere, the NOVA CANVAS spatial workspace with movable windows, the NOVA CORE control centre and NOVA FLOW notifications that never interrupt you.',
    descriptionAr:
      'تصوّر جديد لواجهة الهاتف: شاشة قفل، كرة التطبيقات، مساحة NOVA CANVAS بنوافذ متحركة، مركز تحكم NOVA CORE، وإشعارات NOVA FLOW بدون إزعاج.',
    image: null,
    favicon: 'https://nova-os-psi.vercel.app/icons/favicon-32.png',
    tag: 'Web app · PWA',
    order: 9,
  },
  {
    key: 'khallesa',
    url: 'https://khallesa.vercel.app/',
    host: 'khallesa.vercel.app',
    title: 'KHALLESA — Get everything done',
    titleAr: 'خَلِّصها — خلّص كل حاجة',
    description:
      'A bilingual (Egyptian Arabic / English) assistant that does not just remind you — it tells you what to do next, step by step, with full support for both languages.',
    descriptionAr:
      'مساعد مصري ١٠٠٪ بالعربية والإنجليزية: «مش هنفكّرك بس… هنقولك تعمل إيه» — خطوة بخطوة، بدعم كامل للغتين.',
    image: 'https://khallesa.vercel.app/icons/icon-512.png',
    favicon: 'https://khallesa.vercel.app/logo.svg',
    tag: 'App · PWA',
    order: 10,
  },
];

module.exports = { SEED_PROJECTS, SEED_VERSION, SEED_MARKER_PATH };
