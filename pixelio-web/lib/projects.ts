import type { Locale } from "@/lib/messages";

/** Bilingual text: every user-facing string has an English and an Arabic version. */
export type Localized = Record<Locale, string>;

export interface Project {
  id: string;
  client: string;
  type: Localized;
  year: number;
  /** Tailwind aspect class used for the masonry card image. */
  aspect: string;
  image: string;
  imageAlt: string;
  summary: Localized;
  challenge: Localized;
  outcome: Localized;
  metrics: { value: string; label: Localized }[];
}

export const projects: Project[] = [
  {
    id: "relay",
    client: "Relay Health",
    type: { en: "SaaS Landing", ar: "صفحة هبوط SaaS" },
    year: 2026,
    aspect: "aspect-[4/5]",
    image: "/work/relay.jpg",
    imageAlt: "Concept mockup of a SaaS landing page with a dashboard preview",
    summary: {
      en: "A conversion-first landing page for a clinic scheduling platform.",
      ar: "صفحة هبوط تركز على التحويل لمنصة حجز مواعيد للعيادات.",
    },
    challenge: {
      en: "Visitors didn't grasp the product fast enough and left before reaching the demo button.",
      ar: "الزوار لم يفهموا المنتج بسرعة كافية وغادروا قبل الوصول إلى زر الديمو.",
    },
    outcome: {
      en: "We rebuilt the story around three proof points and one clear demo path.",
      ar: "أعدنا بناء الرسالة حول ثلاث نقاط إثبات ومسار ديمو واحد وواضح.",
    },
    metrics: [
      { value: "+164%", label: { en: "demo sign-ups", ar: "تسجيلات الديمو" } },
      { value: "1.1s", label: { en: "load time", ar: "وقت التحميل" } },
      { value: "98", label: { en: "Lighthouse score", ar: "نتيجة Lighthouse" } },
    ],
  },
  {
    id: "kiln",
    client: "Kiln & Co.",
    type: { en: "E-commerce", ar: "متجر إلكتروني" },
    year: 2026,
    aspect: "aspect-square",
    image: "/work/kiln.jpg",
    imageAlt: "Concept mockup of an editorial product page for a ceramics brand",
    summary: {
      en: "Editorial product pages for a small ceramics label.",
      ar: "صفحات منتجات بطابع تحريري لعلامة خزف صغيرة.",
    },
    challenge: {
      en: "Beautiful photography, but a buying path that felt generic and crowded.",
      ar: "صور رائعة، لكن مسار الشراء بدا عاديًا ومزدحمًا.",
    },
    outcome: {
      en: "Quieter layouts, larger imagery and a two-step checkout.",
      ar: "تخطيطات أهدأ، وصور أكبر، وعملية دفع من خطوتين.",
    },
    metrics: [
      { value: "+38%", label: { en: "conversion rate", ar: "معدل التحويل" } },
      { value: "+52%", label: { en: "average order value", ar: "متوسط قيمة الطلب" } },
      { value: "0.9s", label: { en: "mobile LCP", ar: "عرض المحتوى على الجوال" } },
    ],
  },
  {
    id: "atlas",
    client: "Atlas Boxing Club",
    type: { en: "Booking Website", ar: "موقع حجوزات" },
    year: 2025,
    aspect: "aspect-[4/3]",
    image: "/work/atlas.jpg",
    imageAlt: "Concept mockup of a dark booking website with class schedule cards",
    summary: {
      en: "Class schedules and memberships people can book in three taps.",
      ar: "جداول الحصص والعضويات، مع حجز بثلاث نقرات.",
    },
    challenge: {
      en: "Members called the front desk to book classes, every single day.",
      ar: "كان الأعضاء يتصلون بالاستقبال لحجز كل حصة، كل يوم.",
    },
    outcome: {
      en: "A live schedule with one-tap booking and automated reminders.",
      ar: "جدول مباشر مع حجز بنقرة واحدة وتذكيرات تلقائية.",
    },
    metrics: [
      { value: "+71%", label: { en: "online bookings", ar: "الحجوزات الإلكترونية" } },
      { value: "−40%", label: { en: "front-desk calls", ar: "مكالمات الاستقبال" } },
      { value: "3", label: { en: "taps to book", ar: "نقرات للحجز" } },
    ],
  },
  {
    id: "vela",
    client: "Vela Finance",
    type: { en: "Fintech Landing", ar: "صفحة هبوط للتقنية المالية" },
    year: 2025,
    aspect: "aspect-[3/4]",
    image: "/work/vela.jpg",
    imageAlt: "Concept mockup of a calm fintech landing page with simple charts",
    summary: {
      en: "A calm, confident story for an investing app built for first-timers.",
      ar: "قصة هادئة وواثقة لتطبيق استثمار موجّه للمبتدئين.",
    },
    challenge: {
      en: "The product was complex, and the page sounded like every competitor.",
      ar: "المنتج معقد، وصوت الصفحة يشبه كل المنافسين.",
    },
    outcome: {
      en: "Plain language, a visual product tour and a one-step waitlist.",
      ar: "لغة بسيطة، وجولة بصرية للمنتج، وقائمة انتظار بخطوة واحدة.",
    },
    metrics: [
      { value: "+96%", label: { en: "qualified leads", ar: "عملاء محتملون مؤهلون" } },
      { value: "2.1×", label: { en: "time on page", ar: "وقت البقاء في الصفحة" } },
      { value: "4 wks", label: { en: "brief to launch", ar: "من الفكرة إلى الإطلاق" } },
    ],
  },
  {
    id: "mono",
    client: "Mono Architects",
    type: { en: "Studio Portfolio", ar: "ملف أعمال لاستوديو" },
    year: 2025,
    aspect: "aspect-square",
    image: "/work/mono.jpg",
    imageAlt: "Concept mockup of a minimal architecture portfolio with a project grid",
    summary: {
      en: "A quiet, image-first portfolio for an architecture studio.",
      ar: "ملف أعمال هادئ يعتمد على الصور لاستوديو معماري.",
    },
    challenge: {
      en: "Great projects were buried under heavy menus and slow galleries.",
      ar: "مشاريع رائعة كانت مدفونة تحت قوائم ثقيلة ومعارض بطيئة.",
    },
    outcome: {
      en: "Full-bleed galleries, a minimal index and near-instant page transitions.",
      ar: "معارض بعرض كامل، وفهرس بسيط، وانتقالات شبه فورية بين الصفحات.",
    },
    metrics: [
      { value: "+3×", label: { en: "project inquiries", ar: "استفسارات المشاريع" } },
      { value: "12", label: { en: "featured projects", ar: "مشاريع معروضة" } },
      { value: "100", label: { en: "accessibility score", ar: "نتيجة إمكانية الوصول" } },
    ],
  },
  {
    id: "hollow",
    client: "Hollow Records",
    type: { en: "Artist Website", ar: "موقع فنان" },
    year: 2024,
    aspect: "aspect-[16/11]",
    image: "/work/hollow.jpg",
    imageAlt: "Concept mockup of a dark artist website for an independent label",
    summary: {
      en: "A dark, sound-first website for an independent music label.",
      ar: "موقع داكن يركز على الصوت لعلامة موسيقية مستقلة.",
    },
    challenge: {
      en: "Releases were scattered across platforms with no single home.",
      ar: "الإصدارات كانت موزعة على منصات مختلفة بلا مكان واحد يجمعها.",
    },
    outcome: {
      en: "One home for every release, with a newsletter built into the flow.",
      ar: "بيت واحد لكل إصدار، مع نشرة بريدية مدمجة في المسار.",
    },
    metrics: [
      { value: "+210%", label: { en: "newsletter sign-ups", ar: "اشتراكات النشرة" } },
      { value: "18", label: { en: "releases archived", ar: "إصدارات مؤرشفة" } },
      { value: "2M", label: { en: "streams sent", ar: "استماعات مُرسلة" } },
    ],
  },
];
