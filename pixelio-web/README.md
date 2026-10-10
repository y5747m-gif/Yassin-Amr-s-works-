# pixelio — studio website

Portfolio site for **pixelio**, a web design studio. *"We build websites that convert."*

Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn-style UI primitives (Radix) ·
Framer Motion · Lenis smooth scroll · Lucide icons · next-themes · Fontsource (Inter, Tajawal).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

## What's on the page

| Section | Notes |
|---|---|
| Navbar | Floating glass pill, `pixelio` wordmark with a vermilion pixel on both i's, Work / Services / About / Contact, EN ⇄ عربي, light/dark toggle, magnetic "Start a Project →" CTA. Mobile sheet menu. |
| Hero | Headline + subtext, two floating project previews with scroll parallax, pointer parallax and a slow float loop. |
| Marquee | Infinite strip of studio capabilities. |
| Work | Six projects in a masonry grid. Each card: image, client, type, year. Click opens an animated case-study dialog (challenge, outcome, results, CTA). |
| Services | "From idea to launch in 7 days", four services, and a 7-day timeline built from pixel cells. |
| About | "We don't just design pixels, we design business growth." Stats and team roles. |
| Contact | "Have an idea? Let's build it." Form with validation and budget chips, plus hello@pixelio.studio. |
| Footer | Minimal, © 2026 pixelio. |

Design system: `#FCFCF9` / `#111111` in light mode, `#0A0A0A` in dark, `rounded-[24px]` cards,
soft grid background, fixed film grain, one vermilion accent (`--brand`). All colours live as CSS
variables in `app/globals.css`.

Motion: Lenis smooth scrolling, scroll-triggered fades with blur, word-by-word headline reveals,
magnetic buttons, and spring-based hover states. Everything respects `prefers-reduced-motion`.

## Where to edit

- **Copy (EN + AR):** `lib/messages.ts`
- **Projects / case studies:** `lib/projects.ts` (images in `public/work/`)
- **Colours, grid, grain:** `app/globals.css`, `tailwind.config.ts`
- **Contact form delivery:** `app/api/contact/route.ts` — validation is in place; `deliver()` is the single
  seam where you connect an email provider (Resend, Postmark, SMTP) or a CRM. Until then, submissions
  are validated and acknowledged but not sent anywhere.

## Placeholder content — replace before launch

- Client names, project metrics, testimonials-style numbers and team stats are **illustrative**.
- Project images in `public/work/` are AI-generated concept mockups, not real client work.
- The contact email `hello@pixelio.studio` and the domain `pixelio.studio` should be set up on your side.

## Deploying

Deploy `pixelio-web/` as its own project (e.g. Vercel with **Root Directory = `pixelio-web`**).
Set `metadataBase` in `app/layout.tsx` if the production domain changes.
