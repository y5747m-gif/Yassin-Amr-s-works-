/**
 * Pixelio — official site server (Node 18+ & Vercel Serverless compatible)
 *
 *  - Serves the static site from ./public
 *  - GET    /api/analyze?url=...           → reads a website's public metadata (5s max timeout)
 *  - GET    /api/projects                  → the published portfolio (public)
 *  - POST   /api/projects                  → add a project immediately to DB (owner only)
 *  - POST   /api/projects/:id/metadata     → background metadata enrichment (owner only)
 *  - PUT    /api/projects/:id (or ?id=...) → update a project in DB (owner only)
 *  - DELETE /api/projects/:id (or ?id=...) → remove a project from DB (owner only)
 *  - POST   /api/login                     → owner login  { username, password }
 *  - POST   /api/logout                    → ends the owner session
 *  - GET    /api/session                   → { owner: true|false }
 *  - GET    /api/content                   → every saved text/content override (public)
 *  - PUT    /api/content                   → save one override  { scope, path, value } (owner only)
 *  - DELETE /api/content?scope=&path=      → revert one override to its default (owner only)
 *
 * Run locally:  node server.js   (binds 0.0.0.0:3000, override with PORT env)
 */

'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const dns = require('node:dns').promises;
const { parseSiteMeta } = require('./public/js/parse.js');
const db = require('./lib/db.js');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const FETCH_TIMEOUT_MS = 5000; // Strict 5-second max timeout for external metadata
const DNS_TIMEOUT_MS = 3500;
const MAX_BODY_CHARS = 512_000;
const MAX_JSON_BODY = 256 * 1024;

const OWNER_USER = process.env.OWNER_USER || 'owner';
const OWNER_PASS = process.env.OWNER_PASS || 'TWE@2026';
// Deterministic fallback so serverless cold starts on Vercel do not invalidate active owner sessions
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto
    .createHmac('sha256', 'pixelio-serverless-session-v1')
    .update(`${OWNER_USER}:${OWNER_PASS}`)
    .digest('hex');

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const COOKIE_NAME = 'twe_session';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/* ---------------------------------- utils --------------------------------- */

function sendJson(res, status, obj, cacheControl = 'no-store') {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cacheControl,
  });
  res.end(body);
}

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_JSON_BODY) {
        reject(new Error('body-too-large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('bad-json'));
      }
    });
    req.on('error', reject);
  });
}

function timingSafeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/* --------------------------------- session --------------------------------- */

function sign(payload) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

function makeSessionToken(user) {
  const payload = Buffer.from(
    JSON.stringify({ u: user, exp: Date.now() + SESSION_TTL_MS }),
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  if (!timingSafeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data || typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function parseCookies(header) {
  const out = {};
  String(header || '')
    .split(';')
    .forEach((part) => {
      const i = part.indexOf('=');
      if (i < 0) return;
      try {
        out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
      }
    });
  return out;
}

function isOwner(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  return Boolean(verifySessionToken(token));
}

function setSessionCookie(req, res, token, maxAgeSec) {
  const isSecure =
    req.headers['x-forwarded-proto'] === 'https' ||
    Boolean(req.socket && req.socket.encrypted);
  const secureFlag = isSecure ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secureFlag}`,
  );
}

/* ------------------------------ login throttle ----------------------------- */

const attempts = new Map(); // ip → { n, until }

function throttleCheck(ip) {
  const rec = attempts.get(ip);
  if (rec && rec.until > Date.now()) {
    return Math.ceil((rec.until - Date.now()) / 1000);
  }
  return 0;
}

function throttleFail(ip) {
  const rec = attempts.get(ip) || { n: 0, until: 0 };
  rec.n += 1;
  if (rec.n >= 5) {
    rec.until = Date.now() + Math.min(15 * 60_000, 30_000 * 2 ** (rec.n - 5));
  }
  attempts.set(ip, rec);
}

function throttleReset(ip) {
  attempts.delete(ip);
}

/* ------------------------------ site content ------------------------------- */

const CONTENT_SCOPES = new Set(['en', 'ar', 'site']);
const CONTENT_PATH_RE = /^[a-zA-Z][a-zA-Z0-9_.-]{0,140}$/;
const CONTENT_MAX_LEN = 6000;

function sanitizeContentValue(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .slice(0, CONTENT_MAX_LEN);
}

async function handleGetContent(res) {
  const content = await db.getContent();
  return sendJson(res, 200, { ok: true, content });
}

async function handleSetContent(req, res) {
  if (!isOwner(req)) return sendJson(res, 401, { ok: false, error: 'unauthorized', message: 'Sign in as owner first.' });
  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: 'bad-json', message: 'Invalid JSON request body.' });
  }

  const scope = String(body.scope || '');
  const path_ = String(body.path || '');
  if (!CONTENT_SCOPES.has(scope)) return sendJson(res, 400, { ok: false, error: 'bad-scope' });
  if (!CONTENT_PATH_RE.test(path_)) return sendJson(res, 400, { ok: false, error: 'bad-path' });
  if (typeof body.value !== 'string') return sendJson(res, 400, { ok: false, error: 'bad-value' });

  const value = sanitizeContentValue(body.value);
  await db.setContentValue(scope, path_, value);
  return sendJson(res, 200, { ok: true, scope, path: path_, value });
}

async function handleDeleteContent(req, res, url) {
  if (!isOwner(req)) return sendJson(res, 401, { ok: false, error: 'unauthorized', message: 'Sign in as owner first.' });
  const scope = String(url.searchParams.get('scope') || '');
  const path_ = String(url.searchParams.get('path') || '');
  if (!CONTENT_SCOPES.has(scope)) return sendJson(res, 400, { ok: false, error: 'bad-scope' });
  if (!CONTENT_PATH_RE.test(path_)) return sendJson(res, 400, { ok: false, error: 'bad-path' });
  await db.deleteContentValue(scope, path_);
  return sendJson(res, 200, { ok: true });
}

/* ------------------------------ SSRF guards -------------------------------- */

function isPrivateIp(ip) {
  if (/^127\./.test(ip) || /^0\./.test(ip) || /^10\./.test(ip) ||
      /^192\.168\./.test(ip) || /^169\.254\./.test(ip) ||
      /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(ip)) {
    return true;
  }
  if (ip.match(/^172\.(1[6-9]|2\d|3[01])\./)) return true;
  const v6 = ip.toLowerCase();
  if (v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd') ||
      v6.startsWith('fe80') || v6.startsWith('::ffff:127.') || v6.startsWith('::ffff:10.') ||
      v6.startsWith('::ffff:192.168.')) {
    return true;
  }
  return false;
}

const isIpv4 = (h) => /^(\d{1,3}\.){3}\d{1,3}$/.test(h);
const isIpv6 = (h) => h.includes(':');

function isPrivateHostLiteral(hostname) {
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) return true;
  if (isIpv4(hostname) || isIpv6(hostname)) return isPrivateIp(hostname);
  return false;
}

async function validateFetchUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return 'invalid-url';
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'bad-protocol';
  if (url.port && url.port !== '80' && url.port !== '443') return 'bad-port';
  if (!url.hostname || isPrivateHostLiteral(url.hostname)) return 'blocked-host';
  try {
    const lookupPromise = dns.lookup(url.hostname, { all: true });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('dns-timeout')), DNS_TIMEOUT_MS),
    );
    const ips = await Promise.race([lookupPromise, timeoutPromise]);
    if (!ips.length || ips.some((i) => isPrivateIp(i.address))) return 'blocked-host';
  } catch {
    return 'dns-failed';
  }
  return null;
}

/* --------------------- Server-Side Metadata Extraction --------------------- */

async function fetchSiteMetadataServerSide(rawUrl) {
  const guard = await validateFetchUrl(rawUrl);
  if (guard) {
    return { ok: false, error: guard };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(rawUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
      },
    });
    const finalUrl = resp.url || rawUrl;
    const type = resp.headers.get('content-type') || '';
    if (!resp.ok) {
      return { ok: false, error: 'http-error', status: resp.status };
    }
    if (type && !/html|xml|text/i.test(type)) {
      return { ok: false, error: 'not-html' };
    }
    const html = (await resp.text()).slice(0, MAX_BODY_CHARS);
    const data = parseSiteMeta(html, finalUrl);
    return { ok: true, url: finalUrl, ...data };
  } catch (err) {
    const timedOut = err && (err.name === 'AbortError' || /timeout/i.test(String(err.message || '')));
    return { ok: false, error: timedOut ? 'timeout' : 'fetch-failed' };
  } finally {
    clearTimeout(timer);
  }
}

async function handleAnalyze(url, res) {
  const bad = (code, message) => sendJson(res, 400, { ok: false, error: code, message });

  const raw = url.searchParams.get('url');
  if (!raw) return bad('missing-url', 'Missing url parameter.');

  const result = await fetchSiteMetadataServerSide(raw);
  if (!result.ok) {
    const messages = {
      'invalid-url': 'That does not look like a valid link.',
      'bad-protocol': 'Only http/https links are supported.',
      'bad-port': 'Non-standard ports are not allowed.',
      'blocked-host': 'This address is not allowed.',
      'dns-failed': 'Could not resolve that host.',
      'http-error': `The site answered with status ${result.status || 'error'}.`,
      'not-html': 'That link does not point to a webpage.',
      'timeout': 'The site took too long to answer.',
      'fetch-failed': 'Could not reach that site.',
    };
    return bad(result.error, messages[result.error] || 'Could not read the page data.');
  }

  return sendJson(res, 200, result);
}

/* --------------------------------- routes ---------------------------------- */

async function handleLogin(req, res) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
             (req.socket && req.socket.remoteAddress) || 'unknown';

  const wait = throttleCheck(ip);
  if (wait) {
    return sendJson(res, 429, { ok: false, error: 'too-many', retryAfter: wait });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: 'bad-json', message: 'Invalid login payload.' });
  }

  const userOk = timingSafeEqual(String(body.username || '').trim(), OWNER_USER);
  const passOk = timingSafeEqual(String(body.password || ''), OWNER_PASS);

  // Constant-ish delay so failures cannot be timed.
  await new Promise((r) => setTimeout(r, 220));

  if (!userOk || !passOk) {
    throttleFail(ip);
    return sendJson(res, 401, { ok: false, error: 'bad-credentials' });
  }

  throttleReset(ip);
  setSessionCookie(req, res, makeSessionToken(OWNER_USER), Math.floor(SESSION_TTL_MS / 1000));
  return sendJson(res, 200, { ok: true, owner: true, user: OWNER_USER });
}

function handleLogout(req, res) {
  setSessionCookie(req, res, '', 0);
  return sendJson(res, 200, { ok: true, owner: false });
}

async function handleAddProject(req, res) {
  if (!isOwner(req)) return sendJson(res, 401, { ok: false, error: 'unauthorized', message: 'Sign in as owner first.' });
  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: 'bad-json', message: 'Invalid JSON request body.' });
  }

  const created = await db.createProject(body);
  if (!created.ok) {
    return sendJson(res, created.status || 400, {
      ok: false,
      error: created.error || 'save-failed',
      message: created.message || 'Could not save project.',
    });
  }

  return sendJson(res, 200, { ok: true, project: created.project });
}

async function handleEnrichProjectMetadata(req, res, id) {
  if (!isOwner(req)) return sendJson(res, 401, { ok: false, error: 'unauthorized', message: 'Sign in as owner first.' });
  const existing = await db.getProjectById(id);
  if (!existing) return sendJson(res, 404, { ok: false, error: 'not-found' });

  const meta = await fetchSiteMetadataServerSide(existing.url);
  if (!meta.ok) {
    // Metadata failure never fails the saved project
    return sendJson(res, 200, { ok: true, updated: false, project: existing });
  }

  const enriched = await db.enrichProjectWithMetadata(id, meta);
  return sendJson(res, 200, {
    ok: true,
    updated: Boolean(enriched.updated),
    project: enriched.project || existing,
  });
}

async function handleUpdateProject(req, res, id) {
  if (!isOwner(req)) return sendJson(res, 401, { ok: false, error: 'unauthorized', message: 'Sign in as owner first.' });
  if (!id) return sendJson(res, 400, { ok: false, error: 'missing-id' });

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: 'bad-json', message: 'Invalid JSON request body.' });
  }

  const updated = await db.updateProject(id, body);
  if (!updated.ok) {
    return sendJson(res, updated.status || 400, {
      ok: false,
      error: updated.error || 'update-failed',
      message: updated.message || 'Could not update project.',
    });
  }

  return sendJson(res, 200, { ok: true, project: updated.project });
}

async function handleDeleteProject(req, res, id) {
  if (!isOwner(req)) return sendJson(res, 401, { ok: false, error: 'unauthorized', message: 'Sign in as owner first.' });
  if (!id) return sendJson(res, 400, { ok: false, error: 'missing-id' });

  const removed = await db.deleteProject(id);
  if (!removed.ok) {
    return sendJson(res, removed.status || 404, {
      ok: false,
      error: removed.error || 'delete-failed',
      message: removed.message || 'Could not remove project.',
    });
  }
  return sendJson(res, 200, { ok: true });
}

/* -------------------------------- static ----------------------------------- */

const COMPRESSIBLE_EXT = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt']);
const staticCache = new Map(); // filePath -> { mtimeMs, size, etag, raw, gzip, br }

function getStaticEntry(filePath, stat, ext) {
  const cached = staticCache.get(filePath);
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
    return cached;
  }
  if (!COMPRESSIBLE_EXT.has(ext) || stat.size > 2 * 1024 * 1024) {
    return null;
  }
  const raw = fs.readFileSync(filePath);
  const etag = `W/"${stat.size.toString(16)}-${Math.trunc(stat.mtimeMs).toString(16)}"`;
  const entry = {
    mtimeMs: stat.mtimeMs,
    size: stat.size,
    etag,
    raw,
    gzip: raw.length > 512 ? zlib.gzipSync(raw, { level: 6 }) : null,
    br: raw.length > 512 && typeof zlib.brotliCompressSync === 'function'
      ? zlib.brotliCompressSync(raw, {
          params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 },
        })
      : null,
  };
  staticCache.set(filePath, entry);
  return entry;
}

function serveStatic(req, res, pathname) {
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 — Not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const cacheControl = ext === '.html' ? 'no-cache' : 'public, max-age=3600';

    try {
      const entry = getStaticEntry(filePath, stat, ext);
      if (entry) {
        if (req.headers['if-none-match'] === entry.etag) {
          res.writeHead(304, { ETag: entry.etag, 'Cache-Control': cacheControl });
          return res.end();
        }
        const accept = String(req.headers['accept-encoding'] || '');
        const headers = {
          'Content-Type': contentType,
          'Cache-Control': cacheControl,
          ETag: entry.etag,
          Vary: 'Accept-Encoding',
        };
        let payload = entry.raw;
        if (entry.br && /\bbr\b/.test(accept)) {
          payload = entry.br;
          headers['Content-Encoding'] = 'br';
        } else if (entry.gzip && /\bgzip\b/.test(accept)) {
          payload = entry.gzip;
          headers['Content-Encoding'] = 'gzip';
        }
        headers['Content-Length'] = payload.length;
        res.writeHead(200, headers);
        if (req.method === 'HEAD') return res.end();
        return res.end(payload);
      }
    } catch {
      /* fall through to stream */
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

/* --------------------------- rewrite repair (Vercel) -----------------------
 * A Vercel rewrite hands the serverless function its *destination* path, not
 * the one the visitor asked for: `{ "source": "/api/(.*)", "destination":
 * "/api/index.js?__path=/api/$1" }` reaches this handler as
 * `/api/index.js?__path=/api/session`. The real path travels in the `__path`
 * query parameter, so it is rebuilt here before routing. When the server runs
 * directly (`node server.js`) there is no rewrite and no `__path`, so this is
 * a no-op — the same routes keep working in both environments.
 */

const REWRITE_DESTINATIONS = new Set(['/api/index.js', '/api/index']);
const REWRITTEN_PATH_RE = /^\/(?:api|healthz)(?:\/|$)/;

function resolveRequestPath(url, pathname) {
  const rewritten = url.searchParams.get('__path');
  if (!rewritten || !REWRITE_DESTINATIONS.has(pathname)) return pathname;
  if (!REWRITTEN_PATH_RE.test(rewritten)) return pathname;
  return rewritten.replace(/\/+$/, '') || '/';
}

/* ----------------------------- request handler ----------------------------- */

async function requestHandler(req, res) {
  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }

  try {
    const p = resolveRequestPath(url, url.pathname.replace(/\/+$/, '') || '/');

    if (p === '/api/analyze') {
      if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
      return await handleAnalyze(url, res);
    }

    if (p === '/api/session') {
      return sendJson(res, 200, { ok: true, owner: isOwner(req) });
    }

    if (p === '/api/login') {
      if (req.method !== 'POST') { res.writeHead(405); return res.end(); }
      return await handleLogin(req, res);
    }

    if (p === '/api/logout') {
      if (req.method !== 'POST') { res.writeHead(405); return res.end(); }
      return handleLogout(req, res);
    }

    // Match /api/projects, /api/projects/:id, and /api/projects/:id/metadata
    const projMetaMatch = p.match(/^\/api\/projects\/([^/]+)\/metadata$/);
    if (projMetaMatch) {
      if (req.method !== 'POST') { res.writeHead(405); return res.end(); }
      return await handleEnrichProjectMetadata(req, res, decodeURIComponent(projMetaMatch[1]));
    }

    const projItemMatch = p.match(/^\/api\/projects\/([^/]+)$/);
    if (projItemMatch) {
      const id = decodeURIComponent(projItemMatch[1]);
      if (req.method === 'PUT') return await handleUpdateProject(req, res, id);
      if (req.method === 'DELETE') return await handleDeleteProject(req, res, id);
      res.writeHead(405);
      return res.end();
    }

    if (p === '/api/projects') {
      if (req.method === 'GET') {
        const projects = await db.listProjects();
        return sendJson(res, 200, { ok: true, owner: isOwner(req), projects });
      }
      if (req.method === 'POST') {
        const action = url.searchParams.get('action');
        const id = url.searchParams.get('id');
        if (action === 'metadata' && id) {
          return await handleEnrichProjectMetadata(req, res, id);
        }
        return await handleAddProject(req, res);
      }
      if (req.method === 'PUT') {
        return await handleUpdateProject(req, res, String(url.searchParams.get('id') || ''));
      }
      if (req.method === 'DELETE') {
        return await handleDeleteProject(req, res, String(url.searchParams.get('id') || ''));
      }
      res.writeHead(405);
      return res.end();
    }

    if (p === '/api/content') {
      if (req.method === 'GET') return await handleGetContent(res);
      if (req.method === 'PUT') return await handleSetContent(req, res);
      if (req.method === 'DELETE') return await handleDeleteContent(req, res, url);
      res.writeHead(405);
      return res.end();
    }

    if (p === '/healthz') {
      return sendJson(res, 200, {
        ok: true,
        storage: db.isSupabaseConfigured() ? 'supabase' : 'local',
        uptime: process.uptime(),
      });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      return res.end();
    }
    return serveStatic(req, res, decodeURIComponent(p));
  } catch (err) {
    console.error('server error:', err);
    return sendJson(res, 500, {
      ok: false,
      error: 'server-error',
      message: 'An unexpected server error occurred. Please try again.',
    });
  }
}

/* --------------------------------- server ---------------------------------- */

db.migrateLegacyFilesToDatabase().catch((err) => {
  console.error('Initial migration check failed:', err.message);
});

if (require.main === module) {
  const server = http.createServer(requestHandler);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Pixelio → http://localhost:${PORT}`);
    console.log(
      `Storage: ${db.isSupabaseConfigured() ? 'Supabase Database' : 'Local Persistent Storage'}`,
    );
    console.log(`Owner login: user "${OWNER_USER}" (set OWNER_USER / OWNER_PASS to change)`);
  });
}

module.exports = requestHandler;
