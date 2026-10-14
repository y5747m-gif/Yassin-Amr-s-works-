/* ==========================================================================
   views/sites.js — the sites the studio shows in its own portfolio.

   This is a plain data view: it publishes one array on the shared namespace,

     PixelioViews.builtinSites = [ … ]

   and nothing else. app.js merges this list with whatever the owner has added
   from the owner panel (an owner-added project with the same link wins, so a
   site can be "adopted" into the database without appearing twice).

   Every entry renders as a device card in the "Our Work" section with an
   “Enter site” / «دخول» button that opens the live site in a new tab.

     id         stable key (used to hide/restore a card from the owner panel)
     url        the live site (the entry button target)
     host       hostname shown on the card
     title      English title            titleAr       Arabic title
     description / descriptionAr         one-line blurb per language
     image      preview shown inside the device screen (null → designed poster)
     capture    true → `image` is a live screenshot service; if it answers with
                its “generating…” placeholder instead of a real capture, the
                designed poster underneath is kept
     cover      true → the preview fills the screen (crop) instead of panning
     favicon    small icon shown on the poster / next to the hostname
     accent     brand colour of the poster behind the preview

   To add, remove or reorder a site, edit the list below — the page, the hero
   showcase and the “Projects” counter all follow it automatically.
   ========================================================================== */

(function (ns) {
  'use strict';

  /** Screenshot service used for the sites that publish no wide preview image.
   *  WordPress mShots renders a live capture of the page, needs no API key and
   *  returns a placeholder on the first request while it generates the shot —
   *  the designed poster behind it stays visible until the real image lands. */
  const shot = (url, w = 820, h = 1180) =>
    `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=${w}&h=${h}`;

  const SITES = [
    {
      id: 'site-ningawy',
      url: 'https://ningawy.vercel.app/',
      host: 'ningawy.vercel.app',
      title: 'NINJAWY — Online Store',
      titleAr: 'نينجاوي — متجر إلكتروني',
      description: 'A complete online store: hand-picked products, exclusive offers, nationwide delivery and cash on delivery.',
      descriptionAr: 'متجر إلكتروني متكامل: منتجات مختارة، عروض حصرية، توصيل لكل المحافظات ودفع عند الاستلام.',
      image: 'https://ningawy.vercel.app/assets/ninja-hero.png',
      cover: true,
      favicon: null,
      accent: '#f43f5e',
    },
    {
      id: 'site-hatsally',
      url: 'https://muslim-wa-bas-ai-assistant-1.vercel.app/',
      host: 'muslim-wa-bas-ai-assistant-1.vercel.app',
      title: 'HatSally — Smart Fajr Alarm',
      titleAr: 'هتصلي يعني هتصلي — منبه الفجر الذكي',
      description: 'A prayer alarm that installs like a native app, calls you by name, works offline and will not stop until you are up.',
      descriptionAr: 'منبه صلاة يُثبَّت كتطبيق أصلي، يناديك باسمك، يعمل بدون إنترنت ولا يتوقف حتى تقوم للصلاة.',
      image: shot('https://muslim-wa-bas-ai-assistant-1.vercel.app/'),
      capture: true,
      cover: true,
      favicon: 'https://muslim-wa-bas-ai-assistant-1.vercel.app/icons/icon-512x512.png',
      accent: '#10b981',
    },
    {
      id: 'site-el-mona',
      url: 'https://el-mona-akademe.vercel.app/',
      host: 'el-mona-akademe.vercel.app',
      title: 'El Mona Akademe — Learning Platform',
      titleAr: 'أكاديمية المنى — منصة تعليمية',
      description: 'A complete platform for secondary-school students: live lessons, daily follow-up and revision plans.',
      descriptionAr: 'منصة متكاملة لطلاب الثانوية العامة: بث مباشر، متابعة يومية وخطط مراجعة.',
      image: shot('https://el-mona-akademe.vercel.app/'),
      capture: true,
      cover: true,
      favicon: 'https://el-mona-akademe.vercel.app/favicon.svg',
      accent: '#2563eb',
    },
    {
      id: 'site-montage',
      url: 'https://montag-est.vercel.app/',
      host: 'montag-est.vercel.app',
      title: 'Montage Studio Pro — Video & Motion',
      titleAr: 'مونتاج ستوديو برو — فيديو وموشن جرافيك',
      description: 'A professional montage and motion-graphics studio with every editing tool in one place.',
      descriptionAr: 'استوديو مونتاج وموشن جرافيك احترافي يجمع كل أدوات المونتاج في مكان واحد.',
      image: shot('https://montag-est.vercel.app/'),
      capture: true,
      cover: true,
      favicon: 'https://montag-est.vercel.app/assets/favicon.svg',
      accent: '#8b5cf6',
    },
    {
      id: 'site-mokta-3d',
      url: 'https://yaseen868.vercel.app/',
      host: 'yaseen868.vercel.app',
      title: 'Mokta AI 3D — Image to 3D Model',
      titleAr: 'مُكتة AI 3D — من الصورة إلى مجسم',
      description: 'Turn any photo into a 3D model (GLB / OBJ / STL / PLY) inside the browser — free, private, no uploads.',
      descriptionAr: 'حوّل أي صورة إلى مجسم ثلاثي الأبعاد (GLB / OBJ / STL / PLY) داخل المتصفح — مجاناً وبدون رفع وبخصوصية كاملة.',
      image: 'https://yaseen868.vercel.app/assets/og-image.png',
      cover: true,
      favicon: 'https://yaseen868.vercel.app/assets/icon-512.png',
      accent: '#06b6d4',
    },
    {
      id: 'site-ork-zone',
      url: 'https://shoter-ork-geto.vercel.app/',
      host: 'shoter-ork-geto.vercel.app',
      title: 'ORK ZONE — Battle Royale',
      titleAr: 'أورك زون — باتل رويال',
      description: 'Season one: rise of the kings — a fast battle-royale experience that runs right in the browser.',
      descriptionAr: 'الموسم الأول: صعود الملوك — تجربة باتل رويال سريعة تعمل مباشرة داخل المتصفح.',
      image: shot('https://shoter-ork-geto.vercel.app/'),
      capture: true,
      cover: true,
      favicon: 'https://shoter-ork-geto.vercel.app/icons/icon-192.png',
      accent: '#f59e0b',
    },
    {
      id: 'site-sparta-ai',
      url: 'https://t-m-d-ai.vercel.app/',
      host: 't-m-d-ai.vercel.app',
      title: 'SPARTA AI — Arabic AI Assistant',
      titleAr: 'SPARTA AI — مساعد الذكاء الاصطناعي العربي',
      description: 'Instant smart chat, document and image understanding, and AI video generation up to 30 seconds.',
      descriptionAr: 'محادثة ذكية فورية، تحليل مستندات وفهم صور، وإنشاء فيديو بالذكاء الاصطناعي حتى 30 ثانية.',
      image: 'https://t-m-d-ai.vercel.app/images/og-image.jpg',
      cover: true,
      favicon: 'https://t-m-d-ai.vercel.app/images/favicon-32.png',
      accent: '#6366f1',
    },
    {
      id: 'site-nova-study',
      url: 'https://souqi-944p.vercel.app/',
      host: 'souqi-944p.vercel.app',
      title: 'NOVA STUDY — Your Future Starts Here',
      titleAr: 'نوفا ستادي — مستقبلك يبدأ من هنا',
      description: 'A smart platform for studying, planning and getting things done.',
      descriptionAr: 'منصتك الذكية للمذاكرة والتخطيط والإنجاز.',
      image: 'https://souqi-944p.vercel.app/assets/nova-books.webp',
      cover: true,
      favicon: 'https://souqi-944p.vercel.app/nova-icon-512.png',
      accent: '#0ea5e9',
    },
    {
      id: 'site-nova-os',
      url: 'https://nova-os-psi.vercel.app/',
      host: 'nova-os-psi.vercel.app',
      title: 'NOVA OS — A New Way to Use Your Phone',
      titleAr: 'NOVA OS — طريقة جديدة لاستخدام هاتفك',
      description: 'An interactive phone-OS prototype: Dynamic Space, NOVA CORE, FLOW, CANVAS and the NOVA MOTION engine.',
      descriptionAr: 'نموذج تفاعلي لنظام هاتف: Dynamic Space وNOVA CORE وFLOW وCANVAS ومحرك NOVA MOTION.',
      image: shot('https://nova-os-psi.vercel.app/'),
      capture: true,
      cover: true,
      favicon: 'https://nova-os-psi.vercel.app/icons/favicon-32.png',
      accent: '#a855f7',
    },
    {
      id: 'site-khallesa',
      url: 'https://khallesa.vercel.app/',
      host: 'khallesa.vercel.app',
      title: 'KHALLESA — Get It Done',
      titleAr: 'خَلِّصها — خلّص مهامك',
      description: 'Not just reminders — a simple assistant that organises your day and tells you the next step.',
      descriptionAr: 'مش هنفكّرك بس… هنقولك تعمل إيه — مساعد بسيط بيرتّب يومك ويقولك الخطوة الجاية.',
      image: shot('https://khallesa.vercel.app/'),
      capture: true,
      cover: true,
      favicon: 'https://khallesa.vercel.app/icons/favicon-32.png',
      accent: '#22c55e',
    },
    {
      id: 'site-kawkap',
      url: 'https://kawkap-krakep.vercel.app/',
      host: 'kawkap-krakep.vercel.app',
      title: 'Kawkap Krakep — Sell What You No Longer Need',
      titleAr: 'كوكب كراكيب — عندك كراكيب؟ حوّلها لقيمة',
      description: 'A marketplace where people list the things they no longer need and others buy them — post an ad in a minute without signing up, and browse nearby listings on the map.',
      descriptionAr: 'منصة تبيع فيها حاجاتك اللي مش محتاجها وتشتري غيرها — انشر إعلانك في دقيقة بدون تسجيل دخول، وتصفّح الكراكيب القريبة منك على الخريطة.',
      image: shot('https://kawkap-krakep.vercel.app/'),
      capture: true,
      favicon: 'https://kawkap-krakep.vercel.app/brand/icon-512.png',
      accent: '#d3ab5b',
    },
  ];

  /** Frozen copy: the page reads this list, nobody mutates it. */
  ns.builtinSites = SITES.map((site) => Object.freeze({ ...site, builtin: true }));
})((window.PixelioViews = window.PixelioViews || {}));
