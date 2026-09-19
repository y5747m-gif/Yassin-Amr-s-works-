/**
 * Yassin Amr — Portfolio site server (zero dependencies, Node 18+)
 *
 *  - Serves the static site from ./public
 *  - GET /api/analyze?url=...  → fetches the given website and extracts its
 *    public metadata (og:title, description, image, favicon, host) so the
 *    frontend can build a portfolio card automatically.
 *
 * Run:  node server.js   (binds 0.0.0.0:3000, override with PORT env)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const dns = require('node:dns').promises;
const { parseSiteMeta } = require('./public/js/parse.js');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const FETCH_TIMEOUT_MS = 20000;
const MAX_BODY_CHARS = 2_000_000;

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

function isPrivateIp(ip) {
  // IPv4
  if (/^127\./.test(ip) || /^0\./.test(ip) || /^10\./.test(ip) ||
      /^192\.168\./.test(ip) || /^169\.254\./.test(ip) || /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(ip)) {
    return true;
  }
  const m = ip.match(/^172\.(1[6-9]|2\d|3[01])\./);
  if (m) return true;
  // IPv6
  const v6 = ip.toLowerCase();
  if (v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd') ||
      v6.startsWith('fe80') || v6.startsWith('::ffff:127.') || v6.startsWith('::ffff:10.') ||
      v6.startsWith('::ffff:192.168.')) {
    return true;
  }
  return false;
}

function isPrivateHostLiteral(hostname) {
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) return true;
  if (net_isIpv4(hostname) || net_isIpv6(hostname)) return isPrivateIp(hostname);
  return false;
}

function net_isIpv4(h) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(h);
}
function net_isIpv6(h) {
  return h.includes(':');
}

/** Returns an error string, or null when the URL looks safe to fetch. */
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
    if (guard === 'invalid-url') return bad('invalid-url', 'That does not look like a valid link.');
    if (guard === 'bad-protocol') return bad('bad-protocol', 'Only http/https links are supported.');
    if (guard === 'bad-port') return bad('bad-port', 'Non-standard ports are not allowed.');
    if (guard === 'blocked-host') return bad('blocked-host', 'This address is not allowed.');
    return bad('dns-failed', 'Could not resolve that host.');
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
    const type = (resp.headers.get('content-type') || '');
    if (!resp.ok) return bad('http-error', `The site answered with status ${resp.status}.`);
    if (type && !/html|xml|text/i.test(type)) {
      return bad('not-html', 'That link does not point to a webpage.');
    }
    html = (await resp.text()).slice(0, MAX_BODY_CHARS);
  } catch (err) {
    const timedOut = err && (err.name === 'AbortError' || /timeout/i.test(String(err.message || '')));
    return bad(timedOut ? 'timeout' : 'fetch-failed', timedOut ? 'The site took too long to answer.' : 'Could not reach that site.');
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

/* -------------------------------- static files ----------------------------- */

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
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ---------------------------------- server --------------------------------- */

const server = http.createServer(async (req, res) => {
  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }

  if (url.pathname === '/api/analyze') {
    if (req.method !== 'GET') {
      res.writeHead(405);
      return res.end();
    }
    try {
      return await handleAnalyze(url, res);
    } catch (err) {
      console.error('analyze error:', err);
      return sendJson(res, 500, { ok: false, error: 'server-error', message: 'Something went wrong.' });
    }
  }

  if (url.pathname === '/healthz') {
    return sendJson(res, 200, { ok: true, uptime: process.uptime() });
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    return res.end();
  }
  serveStatic(req, res, decodeURIComponent(url.pathname));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Yassin Amr portfolio → http://localhost:${PORT}`);
});
