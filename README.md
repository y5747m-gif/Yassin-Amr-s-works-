# Pixelio — Official Site

A bright, premium, bilingual (العربية / English) site for **Pixelio — Creative Media
Solutions** — a creative studio offering all types of graphic design and website design.

**Visual identity:** clean white surface (`#ffffff` / `#f7f9fc`), navy text (`#14294a`) and the
Pixelio gradient blue → violet → pink (`#168cff → #6c3bff → #e83baf`), with floating transparent
3D glass cubes, soft glows and thin-line gradient icons.

Zero dependencies. Node 18+ only.

```bash
node server.js          # → http://localhost:3000   (PORT env to change)
```

---

## ✨ What's on the page

| Section | What happens |
|---|---|
| **Intro splash** | A short animated opener: particles converge, the letters **P I X E L I O** assemble in 3D with a light sweep, `STUDIO` spaces out, a gradient line draws, then a bar-wipe reveals the site. Skippable (button or `Esc`), plays once per browser session, disabled under `prefers-reduced-motion`. |
| **Hero** | Headline, stats and a **floating device** that shows your published project screens (or an empty state until the first project is added). |
| **The Flood (الطوفان)** | Animated wave layers + rising bubbles behind 12 service cards (graphic design + website design), each with an **Order service** WhatsApp button that surge up in a staggered cascade, followed by three counter-scrolling streams of keywords. |
| **Our Work** | Every project is displayed **inside a floating device** — a phone on mobile, a laptop on desktop. Tap a screen to open the live site. |
| **About / Contact** | Studio blurb, skill tags, and both phone lines with call / WhatsApp / copy actions, plus a floating WhatsApp button. |

## 📱 The device frame

The showcase and every portfolio card render inside the same `.device` component:

- **Phone** — 9:19 body, notch, camera, rounded 42px shell.
- **Computer** — 16:10 lid with a laptop base bar.

The mode is chosen automatically (`min-width: 900px` + a fine pointer → computer,
otherwise phone) and the visitor can flip it with the toggle above the hero device;
their choice is remembered in `localStorage`. Switching animates the frame
(width, aspect-ratio, corner radius) instead of swapping images.

## 🌍 Language

The language is auto-detected from `navigator.language` on the first visit
(Arabic → full RTL layout with the Cairo typeface, otherwise English) and can be
switched with the EN / عربي toggle. The choice is stored in `localStorage`.

## 🔐 Owner login

The **Owner** button in the navbar opens a sign-in dialog. When signed in, an
owner panel appears in the *Our Work* section with the **Analyze & Add** bar and
✕ buttons on every card.

### ✏️ Edit literally anything on the site

Next to **Log out** there is an **Edit page text** switch. Turn it on and every
piece of copy on the page — headings, the flood service cards, the scrolling
marquee/stream words, the about tags, contact numbers, button labels, even a
single word inside a sentence — gets a dashed outline. Click it, type the
change, then press **Enter** or click elsewhere to save; **Esc** cancels, and
**double-click** reverts that one field back to the built-in default. Nothing
is hard-coded once it's been touched: saved text is written to
`data/content.json` (git-ignored) and served to every visitor immediately, in
whichever language was being edited (English and Arabic are tracked
separately).

Things that aren't clickable text (the browser tab title, the search-engine
description, tooltips, the "Add project" placeholder, and the hero showcase
image links) live in **More site settings**, a small form under the add-project
bar, with a ↺ button per field to reset it. Editing a contact's phone number —
inline or in settings — automatically updates every WhatsApp link, the `tel:`
links, and the footer everywhere that number is quoted.

Credentials come from environment variables — change them before going live:

```bash
OWNER_USER=owner \
OWNER_PASS='choose-a-strong-one' \
SESSION_SECRET='a-long-random-string' \
node server.js
```

Defaults are `owner` / `TWE@2026` (and a random session secret regenerated on every
boot, which invalidates old sessions after a restart).

Security details: password compared with `crypto.timingSafeEqual`, HMAC-signed
`HttpOnly` / `SameSite=Lax` session cookie valid 12 hours, progressive lockout after
5 failed attempts per IP, and every write endpoint re-checks the session.

## 🔌 API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/projects` | public | published portfolio |
| `POST` | `/api/projects` | owner | add a project (body: `{url, title, description, image, favicon, host}`) |
| `DELETE` | `/api/projects?id=…` | owner | remove a project |
| `POST` | `/api/login` | — | `{username, password}` → sets the session cookie |
| `POST` | `/api/logout` | — | clears the session |
| `GET` | `/api/session` | — | `{ owner: true|false }` |
| `GET` | `/api/analyze?url=…` | public | reads a site's public metadata (SSRF-guarded) |
| `GET` | `/api/content` | public | every saved text/content override (`{en, ar, site}`) |
| `PUT` | `/api/content` | owner | save one override — body: `{scope: "en"\|"ar"\|"site", path, value}` |
| `DELETE` | `/api/content?scope=…&path=…` | owner | revert one override to its built-in default |
| `GET` | `/healthz` | — | uptime probe |

### ☁️ How the API reaches the function on Vercel

Vercel keeps `public/` as static files and turns `api/index.js` into the single
serverless entry point, with `vercel.json` rewriting `/api/*` (and `/healthz`)
to it. A Vercel rewrite hands the function its **destination** path — not the one
the browser asked for — so the rewrite carries the real path in a `__path` query
parameter:

```json
{ "source": "/api/(.*)", "destination": "/api/index.js?__path=/api/$1" }
```

`server.js` rebuilds the request path from `__path` before routing, and the
caller's own query string travels alongside it (Vercel merges the two). Running
the server directly (`node server.js`) has no rewrite, no `__path`, and is
unaffected. `test/vercel-routing.test.js` locks this behaviour in with regression
tests (`npm test`).

**Adding a project:** paste a link → the browser reads the page's public metadata
(`og:title`, description, `og:image`, favicon) directly, through CORS relays, or via
`/api/analyze` as a fallback. If a site blocks metadata requests, its valid link is
still added with its hostname and can be edited afterwards. Every added site is saved
server-side in `data/projects.json` (git-ignored); queued, atomic writes protect the
portfolio from partial writes or server restarts. The site ships with no demo cards or
demo screens. Existing legacy demo cards are removed automatically on startup, while
owner-added projects are retained.

## 🧩 How the page is built

The whole page is rendered by JavaScript. There is no framework and no build step: the
browser runs the same plain scripts that are in the repository.

- **`index.html` is a shell.** It holds the `<head>` (title, description, Open Graph tags,
  favicon, fonts and stylesheet), a `<noscript>` message and an empty `<div id="app">`.
- **`js/views/*.js` build the markup.** `shell.js`, `sections.js` and `dialogs.js` are
  classic scripts that fill `window.PixelioViews` with functions which return HTML strings
  from the current language and phone numbers. They cover the intro, background, navigation,
  hero, marquee, services, portfolio with the owner panel, about, contact and footer,
  the WhatsApp button and the login and project-editor dialogs.
- **`js/app.js` brings the page to life.** On start-up `mountSite()` renders the views into
  `#app`, then the existing code runs unchanged: translations, the owner session and inline
  editing, and the lists that come from the API (service cards, portfolio, tags, contact
  cards, scrolling words, the device showcase).
- **Where to make changes.** Layout and markup live in the views. Wording lives in the
  `I18N` dictionary in `app.js`, and owners can override many of these words from the
  site itself. Styling stays in `css/style.css`. The views must load before `app.js`, as
  set in `index.html`.
- **SEO and link previews.** Visible content is produced by JavaScript. Search engines
  that run JavaScript (Google does) index it, but crawlers that do not run it see only
  the head metadata and the `<noscript>` message. Link previews read the Open Graph tags
  in the head, which are still static HTML.

## 📁 Structure

```
server.js                 Static server + auth + projects API + content API + /api/analyze
lib/db.js                 Storage layer: Supabase when configured, atomic JSON files otherwise
lib/schema.js             Database schema, written in JavaScript (single source of truth)
api/index.js              Vercel serverless entry point (re-exports server.js)
scripts/migrate.js        Applies the schema (with SUPABASE_DB_URL) + migrates data/*.json → Supabase
scripts/emit-schema-sql.js  Regenerates supabase/schema.sql from lib/schema.js
supabase/schema.sql       Generated SQL reference for the Supabase SQL Editor (npm run schema:sql)
data/projects.json        Live portfolio, written atomically by the server (git-ignored)
data/content.json         Every owner-edited word/number/image link (git-ignored)
public/
  index.html              Shell: <head> metadata, empty #app mount point, script tags
  css/style.css           Light theme tokens, glass cubes, device frames, waves, intro, edit-mode styling
  js/views/shell.js       Page frame: intro, background, navigation, WhatsApp button, shared helpers
  js/views/sections.js    Hero, marquee, services, portfolio + owner panel, about, contact + footer
  js/views/dialogs.js     Owner sign-in and project-editor dialogs
  js/parse.js             Shared metadata parser (browser + Node)
  js/app.js               Page mount, i18n, intro behaviour, device modes, portfolio, owner session, inline content editing
test/
  owner.test.js           Owner flows, run against a JSDOM copy of the page
  views.test.js           Views: element ids, escaping, language, layout the stylesheet relies on
  vercel-routing.test.js  API routing through the Vercel rewrite
```

## 📞 Contact

**WhatsApp & calls — 01141362626 · 01502701881**

Both numbers appear in the contact section (call / WhatsApp / copy) and the footer;
the floating button uses the first line. The numbers now ship as defaults only —
the owner can change either one live from the site (inline in the contact card,
or under **More site settings**) and every WhatsApp/`tel:`/footer mention updates
instantly for all visitors, no code edit required.
