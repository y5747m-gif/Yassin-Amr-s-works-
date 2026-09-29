# T.W.E Designer — Official Site

A cinematic, bilingual (العربية / English) site for **T.W.E Designer** — a full-service
creative studio: graphic design, websites, animation, video editing, branding and more.

Zero dependencies. Node 18+ only.

```bash
node server.js          # → http://localhost:3000   (PORT env to change)
```

---

## ✨ What's on the page

| Section | What happens |
|---|---|
| **Intro splash** | A short animated opener: particles converge, the letters **T . W . E** assemble in 3D with a light sweep, `DESIGNER` spaces out, a gradient line draws, then a bar-wipe reveals the site. Skippable (button or `Esc`), plays once per browser session, disabled under `prefers-reduced-motion`. |
| **Hero** | Headline, stats and a **floating device** that shows real site screens. |
| **The Flood (الطوفان)** | Animated wave layers + rising bubbles behind 12 service cards that surge up in a staggered cascade, followed by three counter-scrolling streams of keywords. |
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
| `GET` | `/healthz` | — | uptime probe |

**Adding a project:** paste a link → the browser reads the page's public metadata
(`og:title`, description, `og:image`, favicon) directly, through CORS relays, or via
`/api/analyze` as a fallback → the card is created and saved server-side in
`data/projects.json` (git-ignored). `seed-projects.json` holds the four demo cards
that ship with the site; delete them from the UI once real work is published.

## 📁 Structure

```
server.js              Static server + auth + projects API + /api/analyze
seed-projects.json     Demo portfolio entries (first-run seed)
data/projects.json     Live portfolio, written by the server (git-ignored)
public/
  index.html           The page
  css/style.css        Theme, device frames, flood waves, intro, animations
  js/parse.js          Shared metadata parser (browser + Node)
  js/app.js            i18n, intro, device modes, portfolio, owner session
  img/screen-*.jpg     Showcase screens
```

## 📞 Contact

**WhatsApp & calls — 01141362626 · 01502701881**

Both numbers appear in the contact section (call / WhatsApp / copy) and the footer;
the floating button uses the first line. To change them, edit the `CONTACTS` array at
the top of `public/js/app.js` and the `wa.me` links in `public/index.html`.
