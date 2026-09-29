/**
 * T.W.E Designer — official site server (zero dependencies, Node 18+)
 *
 *  - Serves the static site from ./public
 *  - GET    /api/analyze?url=...   → reads a website's public metadata
 *  - GET    /api/projects          → the published portfolio (public)
 *  - POST   /api/login             → owner login  { username, password }
 *  - POST   /api/logout            → ends the owner session
 *  - GET    /api/session           → { owner: true|false }
 *  - POST   /api/projects          → add a project        (owner only)
 *  - DELETE /api/projects?id=...   → remove a project     (owner only)
 *
 * Owner credentials come from the environment:
 *      OWNER_USER   (default: owner)
 *      OWNER_PASS   (default: TWE@2026)
 *      SESSION_SECRET (default: random, regenerated on every boot)
 *
 * Run:  node server.js   (binds 0.0.0.0:3000, override with PORT env)
 */

const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const dns = require('node:dns').promises;
const { parseSiteMeta } = require('./public/js/parse.js');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const SEED_FILE = path.join(__dirname, 'seed-projects.json');
const FETCH_TIMEOUT_MS = 20000;
const MAX_BODY_CHARS = 2_000_000;
const MAX_JSON_BODY = 256 * 1024;

const OWNER_USER = process.env.OWNER_USER || 'owner';
const OWNER_PASS = process.env.OWNER_PASS || 'TWE@2026';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
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
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/* ---------------------------------- utils --------------------------------- */

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readJsonBody(req) {
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
      out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    });
  return out;
}

function isOwner(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  return Boolean(verifySessionToken(token));
}

function setSessionCookie(res, token, maxAgeSec) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`,
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

/* --------------------------------- storage --------------------------------- */

let projects = [];
let writeQueue = Promise.resolve();

function loadProjects() {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Could not read projects.json:', err.message);
  }
  try {
    if (fs.existsSync(SEED_FILE)) {
      const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
      if (Array.isArray(seed)) return seed;
    }
  } catch (err) {
    console.error('Could not read seed-projects.json:', err.message);
  }
  return [];
}

function persistProjects() {
  writeQueue = writeQueue
    .then(async () => {
      await fsp.mkdir(DATA_DIR, { recursive: true });
      await fsp.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf8');
    })
    .catch((err) => console.error('Could not save projects:', err.message));
  return writeQueue;
}

function sanitizeText(value, max) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);
}

function safeHttpUrl(raw) {
  try {
    const u = new URL(String(raw));
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.toString();
  } catch {
    return null;
  }
}

function safeImageRef(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return null;
  if (value.startsWith('/img/') || value.startsWith('img/')) return value;
  return safeHttpUrl(value);
}

function sanitizeProject(input) {
  const url = safeHttpUrl(input && input.url);
  if (!url) return null;
  let host = sanitizeText(input.host, 120);
  if (!host) {
    try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { host = ''; }
  }
  return {
    id: 'p-' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex'),
    url,
    host,
    title: sanitizeText(input.title, 160) || host || 'Untitled',
    description: sanitizeText(input.description, 420),
    image: safeImageRef(input.image),
    favicon: safeImageRef(input.favicon),
    tag: sanitizeText(input.tag, 40),
    addedAt: new Date().toISOString(),
  };
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
    const ips = await dns.lookup(url.hostname, { all: true });
    if (!ips.length || ips.some((i) => isPrivateIp(i.address))) return 'blocked-host';
  } catch {
    return 'dns-failed';
  }
  return null;
}

/* ------------------------------- analyze API ------------------------------- */

async function handleAnalyze(url, res) {
  const bad = (code, message) => sendJson(res, 400, { ok: false, error: code, message });

  const raw = url.searchParams.get('url');
  if (!raw) return bad('missing-url', 'Missing url parameter.');

  const guard = await validateFetchUrl(raw);
  if (guard) {
    const messages = {
      'invalid-url': 'That does not look like a valid link.',
      'bad-protocol': 'Only http/https links are supported.',
      'bad-port': 'Non-standard ports are not allowed.',
      'blocked-host': 'This address is not allowed.',
      'dns-failed': 'Could not resolve that host.',
    };
    return bad(guard, messages[guard] || 'Blocked.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let finalUrl;
  let html;
  try {
    const resp = await fetch(raw, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
      },
    });
    finalUrl = resp.url || raw;
    const type = resp.headers.get('content-type') || '';
    if (!resp.ok) return bad('http-error', `The site answered with status ${resp.status}.`);
    if (type && !/html|xml|text/i.test(type)) return bad('not-html', 'That link does not point to a webpage.');
    html = (await resp.text()).slice(0, MAX_BODY_CHARS);
  } catch (err) {
    const timedOut = err && (err.name === 'AbortError' || /timeout/i.test(String(err.message || '')));
    return bad(
      timedOut ? 'timeout' : 'fetch-failed',
      timedOut ? 'The site took too long to answer.' : 'Could not reach that site.',
    );
  } finally {
    clearTimeout(timer);
  }

  try {
    const data = parseSiteMeta(html, finalUrl);
    sendJson(res, 200, { ok: true, url: finalUrl, ...data });
  } catch {
    sendJson(res, 500, { ok: false, error: 'parse-failed', message: 'Could not read the page data.' });
  }
}

/* --------------------------------- routes ---------------------------------- */

async function handleLogin(req, res) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
             req.socket.remoteAddress || 'unknown';

  const wait = throttleCheck(ip);
  if (wait) {
    return sendJson(res, 429, { ok: false, error: 'too-many', retryAfter: wait });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: 'bad-json' });
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
  setSessionCookie(res, makeSessionToken(OWNER_USER), Math.floor(SESSION_TTL_MS / 1000));
  return sendJson(res, 200, { ok: true, owner: true, user: OWNER_USER });
}

function handleLogout(res) {
  setSessionCookie(res, '', 0);
  return sendJson(res, 200, { ok: true, owner: false });
}

async function handleAddProject(req, res) {
  if (!isOwner(req)) return sendJson(res, 401, { ok: false, error: 'unauthorized' });
  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { ok: false, error: 'bad-json' });
  }
  const project = sanitizeProject(body);
  if (!project) return sendJson(res, 400, { ok: false, error: 'invalid-project' });

  const key = (u) => {
    try {
      const x = new URL(u);
      return (x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/+$/, '')).toLowerCase();
    } catch {
      return String(u).toLowerCase();
    }
  };
  if (projects.some((p) => key(p.url) === key(project.url))) {
    return sendJson(res, 409, { ok: false, error: 'duplicate' });
  }

  projects.unshift(project);
  await persistProjects();
  return sendJson(res, 200, { ok: true, project });
}

async function handleDeleteProject(req, res, url) {
  if (!isOwner(req)) return sendJson(res, 401, { ok: false, error: 'unauthorized' });
  const id = url.searchParams.get('id');
  const before = projects.length;
  projects = projects.filter((p) => p.id !== id);
  if (projects.length === before) return sendJson(res, 404, { ok: false, error: 'not-found' });
  await persistProjects();
  return sendJson(res, 200, { ok: true });
}

/* -------------------------------- static ----------------------------------- */

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
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

/* --------------------------------- server ---------------------------------- */

projects = loadProjects();

const server = http.createServer(async (req, res) => {
  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }

  try {
    const p = url.pathname;

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
      return handleLogout(res);
    }

    if (p === '/api/projects') {
      if (req.method === 'GET') {
        return sendJson(res, 200, { ok: true, owner: isOwner(req), projects });
      }
      if (req.method === 'POST') return await handleAddProject(req, res);
      if (req.method === 'DELETE') return await handleDeleteProject(req, res, url);
      res.writeHead(405);
      return res.end();
    }

    if (p === '/healthz') {
      return sendJson(res, 200, { ok: true, uptime: process.uptime() });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      return res.end();
    }
    return serveStatic(req, res, decodeURIComponent(p));
  } catch (err) {
    console.error('server error:', err);
    return sendJson(res, 500, { ok: false, error: 'server-error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`T.W.E Designer → http://localhost:${PORT}`);
  console.log(`Owner login: user "${OWNER_USER}" (set OWNER_USER / OWNER_PASS to change)`);
});
