/* ==========================================================================
   parse.js — extracts public site metadata (og:title, description, image,
   favicon, host) from an HTML document.
   Shared by the browser (window.parseSiteMeta) and the Node server (require).
   ========================================================================== */

(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.parseSiteMeta = api.parseSiteMeta;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function decodeEntities(s) {
    return String(s)
      .replace(/&quot;/g, '"')
      .replace(/&#0?34;/g, '"')
      .replace(/&#x27;/gi, "'")
      .replace(/&#0?39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#(\d+);/g, (_, n) => {
        try { return String.fromCodePoint(Number(n)); } catch { return ' '; }
      })
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
        try { return String.fromCodePoint(parseInt(n, 16)); } catch { return ' '; }
      });
  }

  function attr(tag, name) {
    const re = new RegExp('\\b' + name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'i');
    const m = tag.match(re);
    if (!m) return null;
    return decodeEntities(m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : '');
  }

  function parseSiteMeta(html, baseHref) {
    let base;
    try {
      base = new URL(baseHref);
    } catch {
      base = { hostname: 'unknown' };
    }

    const tags = [];
    const tagRe = /<(meta|link|title)\b[^>]*>/gi;
    let m;
    while ((m = tagRe.exec(html)) !== null) tags.push(m[0]);

    let title = '';
    let favicon = null;
    const meta = {};

    for (const tag of tags) {
      const lower = tag.toLowerCase();
      if (lower.startsWith('<title')) {
        const t = tag.replace(/^<title[^>]*>/i, '').replace(/<\/title>$/i, '');
        title = decodeEntities(t).trim();
        continue;
      }
      const prop = (attr(tag, 'property') || attr(tag, 'name') || '').toLowerCase();
      const content = attr(tag, 'content');
      if (prop && content) {
        if (prop === 'og:title' && !meta['og:title']) meta['og:title'] = content.trim();
        else if (prop === 'og:description' && !meta['og:description']) meta['og:description'] = content.trim();
        else if (prop === 'og:image' && !meta['og:image']) meta['og:image'] = content.trim();
        else if (prop === 'og:site_name' && !meta['og:site_name']) meta['og:site_name'] = content.trim();
        else if (prop === 'twitter:title' && !meta['twitter:title']) meta['twitter:title'] = content.trim();
        else if (prop === 'twitter:description' && !meta['twitter:description']) meta['twitter:description'] = content.trim();
        else if (prop === 'twitter:image' && !meta['twitter:image']) meta['twitter:image'] = content.trim();
      }
      const rel = (attr(tag, 'rel') || '').toLowerCase();
      if (rel.includes('icon') && !favicon) {
        const href = attr(tag, 'href');
        if (href) favicon = href.trim();
      }
    }

    const absolutize = (src) => {
      if (!src) return null;
      try {
        return new URL(src, baseHref).toString();
      } catch {
        return null;
      }
    };

    const image = absolutize(meta['og:image']) || absolutize(meta['twitter:image']) || null;
    const faviconUrl = absolutize(favicon) ||
      (typeof baseHref === 'string' ? (() => {
        try { return new URL('/favicon.ico', baseHref).toString(); } catch { return null; }
      })() : null);

    const description = (meta['og:description'] || meta['twitter:description'] || '').trim();
    const finalTitle = (meta['og:title'] || meta['twitter:title'] || title).trim();
    const host = String(base.hostname || 'unknown').replace(/^www\./, '');

    return {
      title: finalTitle || host,
      description: description.length > 280 ? description.slice(0, 277) + '…' : description,
      image,
      favicon: faviconUrl,
      host,
    };
  }

  return { parseSiteMeta };
});
