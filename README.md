# Yassin Amr — Web Designer Portfolio

A bilingual (English / العربية) portfolio site for showcasing web-design work.

## ✨ The signature feature: links become cards

Paste the link to any website you designed into the **"Analyze & Add"** bar and the
site builds a portfolio card automatically:

- The page is fetched (in your browser, with CORS relays and the server endpoint as
  fallbacks) and its **public metadata is read**: `og:title`, description, `og:image`,
  and favicon.
- A card appears with the site's title, description, image and favicon, plus a
  **"Visit ↗"** link to the live website.
- Cards persist in `localStorage`, so your portfolio stays between visits.
  The ✕ button removes a card.

The three starter cards are **examples** of the format — remove them and add your
own links.

## 🎨 Design

- Dark, premium theme — deep-space navy with a warm gold accent and violet glow.
- Fonts: **Space Grotesk + Inter** (English) / **Cairo** (Arabic), loaded from Google Fonts.
- Bilingual with an **EN / عربي toggle** (full RTL layout, saved preference).
- Animations: ambient drifting glows, scroll-reveal, marquee skill strip,
  hover lift + image zoom on cards, count-up stats, toast notifications,
  animated language switch. `prefers-reduced-motion` is respected.

## 📁 Structure

```
server.js            Zero-dependency Node server (static files + /api/analyze)
public/
  index.html         The page
  css/style.css      Theme, layout, animations
  js/parse.js        Shared metadata parser (browser + Node)
  js/app.js          i18n, state, card rendering, analyze & add flow
  img/work-*.jpg     Starter-card artwork
```

## 🚀 Run locally

```bash
node server.js        # needs Node 18+ (no npm install required)
# → http://localhost:3000   (PORT env var to change the port)
```

## 🔌 API

`GET /api/analyze?url=https://example.com`

Fetches the given website server-side and returns its public metadata
(`title`, `description`, `image`, `favicon`, `host`). Includes SSRF guards
(http/https only, ports 80/443 only, private/loopback hosts blocked).
The browser tries a direct fetch and public CORS relays first and uses this
endpoint as the last fallback — so the "Add a project" flow keeps working even
where the server has restricted outbound access.

## 📞 Contact block

Name **Yassin Amr** and phone **0114 136 2626** are displayed in the contact
section and footer, with tap-to-call (`tel:`), WhatsApp (`wa.me`) and
copy-to-clipboard actions. To change them, edit `PHONE_E164` /
`PHONE_DISPLAY` in `public/js/app.js` and the `tel:` / `wa.me` links in
`public/index.html`.
