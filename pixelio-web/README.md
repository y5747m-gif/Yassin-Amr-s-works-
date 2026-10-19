# pixelio — web app

The official **Pixelio** site, rebuilt in React on the stack configured here:

| Layer       | Version                                   |
| ----------- | ----------------------------------------- |
| React       | 19.2                                      |
| Vite        | 7.3                                       |
| Tailwind    | 4.1 (`@tailwindcss/vite`, no config file) |
| TypeScript  | 5.9 (`strict`, `noUnusedLocals`)          |
| Icons       | lucide-react + the site's own inline SVGs |
| Class merge | clsx + tailwind-merge (`cn`)              |

It replaces the Next.js app that used to live in this folder, and it is a
**faithful port of the vanilla site** in `public/` — same markup, same
stylesheet, same behaviour, same storage keys, same API.

## Commands

```bash
npm install
npm run dev          # http://localhost:5173  (binds 0.0.0.0, any host allowed)
npm run build        # → dist/index.html, everything inlined by vite-plugin-singlefile
npm run preview      # serve the production build
npm run typecheck    # tsc --noEmit
npm run test:render  # build, then render it in jsdom and assert the structure
```

`test:render` uses `jsdom`, which lives in the **repository root**
`node_modules` (root `package.json` devDependency) — run `npm install` at the
root once and Node resolves it from `scripts/smoke-render.mjs`.

The owner features (add a site by URL, inline editing, sign-in) call the API in
`server.js` at the repository root. `vite.config.ts` proxies `/api` and
`/healthz` to `http://localhost:3000`, so:

```bash
node server.js       # from the repository root — the API + the vanilla page
npm run dev          # from this folder — the React app
```

Set `PIXELIO_API` to point the proxy somewhere else.

## Fidelity: what was copied, not rewritten

| Original                              | Here                                        |
| ------------------------------------- | ------------------------------------------- |
| `public/css/style.css` (1902 lines)   | `src/styles/pixelio.css` — **verbatim**     |
| `public/index.html` `<head>`          | `index.html` — fonts, meta, OG, favicon and the pre-paint language/intro/`perf-lite` script, verbatim |
| `I18N` dictionary (en + ar)           | `src/lib/pixelio/dictionary.ts` — extracted verbatim |
| `DEFAULT_CONTACTS` / `SHOWCASE_SLOTS` | `src/lib/pixelio/contacts.ts`               |
| `SVC_ICONS`                           | `src/lib/pixelio/service-icons.ts`          |
| `views/sites.js` `SITES` + `shot()`   | `src/lib/pixelio/builtin-sites.ts`          |
| every inline SVG glyph                | `src/lib/pixelio/icons.tsx`                 |
| `#app { display: contents }`          | React mounts into `<div id="app">`          |

Because the stylesheet drives features through attributes, the port emits the
same hooks: `data-i18n`, `data-i18n-html`, `data-i18n-ph`, `data-i18n-title`,
`data-no-edit`, `data-edit-scope/-path/-default`, `data-delay`, `data-mode`,
`data-device`, `data-active`, `data-f`, `data-builtin`, and the classes
`.reveal/.in`, `.offscreen`, `.is-tilting`, `.owner-editable`, `.saving`,
`.saved-flash`, `.shake`, `body.locked/.lang-fade/.owner-editing/.has-pointer/
.tab-hidden`, `html.intro-skip/.perf-lite`.

## Behaviour map (`public/js/app.js` → React)

| Vanilla                            | Port                                            |
| ---------------------------------- | ----------------------------------------------- |
| module-level `lang/CONTENT/projects/isOwner/editingOn/deviceMode` | `src/site/site-context.tsx` — one context, same keys (`twe-lang`, `twe-device`) |
| `t()` / `effectiveList()` / `effectiveContacts()` / `effectiveShowcase()` / `visibleProjects()` / `linkKey()` / `hiddenSiteIds()` | `src/lib/pixelio/content.ts` — pure functions, ported line by line |
| `fetchContent/saveContent/resetContent`, projects CRUD, `/api/login|logout|session`, background metadata enrichment | `src/lib/pixelio/api.ts` |
| `ns.intro` + `initIntro` + `introParticles` | `components/site/intro.tsx` (canvas particles, 5250 ms timeline, `Esc`/skip, `sessionStorage['twe-intro-seen']`) |
| `ns.background/cursorAura/cubeField` + `buildCubeField` | `components/site/background.tsx` (same `CUBE_PLAN` / `PARTICLE_PLAN`, same `--sy` scroll link) |
| `ns.nav` + burger + `.nav.scrolled` | `components/site/site-nav.tsx` |
| `ns.hero` + `buildShowcase/goShot/startShowcase` + `updateStatCount` | `components/site/hero.tsx` + `hooks/use-count-up.ts` (5200 ms carousel, pauses on `document.hidden` and `.offscreen`) |
| `ns.marquee` + `buildMarquee/buildStream/buildTags` | `components/site/marquee.tsx`, `services.tsx`, `about.tsx` |
| `ns.services` + `buildServices/buildBubbles` | `components/site/services.tsx` (wave layers, random bubbles, per-card WhatsApp order link with `{s}` substitution) |
| `cardTemplate/posterMarkup/captureGuard` | `components/site/work-card.tsx` + `device.tsx` (`mShots` placeholders under 600 px are dropped so the designed poster stays) |
| `ns.work` + owner panel + `buildOwnerSettings` | `components/site/work.tsx` |
| `ns.contact` + `buildContacts/syncContactLinks/copyNumber` | `components/site/contact.tsx`, `floating.tsx` |
| `ns.loginModal/projectModal` + `doLogin/saveProjectDetails` | `components/site/login-modal.tsx`, `project-modal.tsx` |
| inline `contenteditable` editing (`wireEditableOnce/commitEdit/resetField`) | `components/site/editable.tsx` — `Esc` reverts, `Enter` commits, blur saves, double-click resets |
| `observeReveals` | `hooks/use-reveal.ts` (IntersectionObserver + MutationObserver for nodes React mounts later) |
| `init3DMotion` | `hooks/use-motion.ts` (cursor aura, hero tilt, card tilt) |
| `initViewportPerformance` | `hooks/use-viewport-perf.ts` (`tab-hidden`, `.offscreen`, the 28-frame FPS guard that flips on `perf-lite`) |

## Layout

```
src/
  App.tsx                     provider + the three global behaviour hooks
  main.tsx                    mounts into #app (display: contents)
  index.css                   Tailwind entry → imports styles/pixelio.css
  styles/pixelio.css          the original stylesheet, verbatim
  site/site-context.tsx       language, content overrides, projects, owner,
                              editing, device mode, toast, dialogs
  lib/pixelio/                dictionary, contacts, built-in sites, service
                              icons, content helpers, api, svg glyphs, types
  lib/utils.ts                cn()
  hooks/                      reveal, motion, viewport-perf, count-up,
                              media-query, reduced-motion
  components/site/            intro, background, nav, hero, marquee, services,
                              work (+ card), about, contact, floating (fab +
                              toast), the two modals, editable, device, page
  components/ui/              Tailwind primitives (button, input, textarea,
                              label, card) for anything new you build
scripts/smoke-render.mjs      builds, renders in jsdom, asserts the structure
docs/legacy-globals.css       design tokens of the previous (Next.js) app
public/work/*.jpg             portfolio images kept from the previous app
```

Tailwind is available for new work (`@theme inline` tokens in `index.css`), but
the ported page is styled entirely by `styles/pixelio.css`, which is unlayered
and therefore always wins over Tailwind's preflight.
