# pixelio — web app

Single-page site for **pixelio**, built on the exact stack configured here:

| Layer      | Version                          |
| ---------- | -------------------------------- |
| React      | 19.2                             |
| Vite       | 7.3                              |
| Tailwind   | 4.1 (`@tailwindcss/vite`, no config file) |
| TypeScript | 5.9 (`strict`, `noUnusedLocals`) |
| Icons      | lucide-react                     |
| Class merge| clsx + tailwind-merge (`cn`)     |

This app **replaces the previous Next.js app** that lived in this folder. Its
content was carried over, not thrown away: the bilingual copy
(`src/lib/messages.ts`), the case-study data (`src/lib/projects.ts`), the shared
easings (`src/lib/motion.ts`), the portfolio images (`public/work/*.jpg`), the
favicon (`public/icon.svg`) and the old design tokens
(`docs/legacy-globals.css`, now expressed as Tailwind 4 theme tokens in
`src/index.css`).

## Commands

```bash
npm install
npm run dev       # http://localhost:5173  (binds 0.0.0.0, any host allowed)
npm run build     # → dist/index.html, everything inlined by vite-plugin-singlefile
npm run preview   # serve the production build
npx tsc --noEmit  # typecheck
```

## What is already wired

- **Language (en / ar) + RTL** — `src/lib/i18n.ts`. `LanguageProvider` sets
  `lang`/`dir` on `<html>`, persists the choice, exposes the whole copy tree as
  `t`, and gives `tr({ en, ar })` for localized fields. Arabic automatically
  switches to Tajawal and drops letter-spacing (`src/index.css`).
- **Theme (light / dark / system)** — `src/lib/theme.ts`. Toggles `.dark` on
  `<html>`, follows the OS when set to *system*, and updates
  `<meta name="theme-color">`.
- **No flash on load** — `index.html` applies language, direction and theme
  before first paint.
- **Tokens** — background / foreground / card / muted / border / input / ring /
  primary / secondary / destructive / brand, plus `rounded-4xl`,
  `tracking-tightest`, `ease-out-expo` and the `marquee` / `grain` /
  `pixel-float` animations. Use them as normal utilities (`bg-card`,
  `text-muted-foreground`, `border-border`).
- **Surface helpers** — `.bg-grid`, `.grain`, `.glass`, `.eyebrow`,
  `.pixel-dot`, `.link-underline`, `.marquee` (RTL-aware).
- **Primitives** — `components/ui`: button (6 variants × 4 sizes), input,
  textarea, label, card. `components/layout`: container, section, language
  toggle, theme toggle.
- **Hooks** — `useLocalStorage`, `useMediaQuery`, `useReducedMotion`.
- **Alias** — `@/*` → `src/*`.

## Where the site goes

`src/App.tsx` is currently a foundation screen (tokens, typography, structure).
Site sections belong in `src/components/site/`, composed into a page like:

```tsx
<Container>
  <Section id="work">…</Section>
</Container>
```

Everything is RTL-safe: prefer logical utilities (`ps-*`, `pe-*`, `ms-*`,
`me-*`, `start-*`, `end-*`, `text-start`) over `pl-*` / `left-*`.
