'use strict';
/*
 * Regression tests for the Vercel rewrite bridge.
 *
 * Vercel rewrites hand a function its destination path, so every `/api/*`
 * request arrives as `/api/index.js?__path=/api/…`. These tests make sure the
 * server rebuilds the real path (and keeps the caller's own query string) while
 * the plain local routes stay untouched.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const handler = require('../server.js');

function request(server, path, { method = 'GET', headers = {}, body } = {}) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, method, headers }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(raw); } catch { /* not json */ }
        resolve({ status: res.statusCode, headers: res.headers, body: raw, json });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function withServer(t) {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return server;
}

test('routes stay untouched when the server runs directly', async (t) => {
  const server = await withServer(t);
  const res = await request(server, '/api/session');
  assert.equal(res.status, 200);
  assert.equal(res.json.ok, true);
  assert.equal(res.json.owner, false);
});

test('the session route is rebuilt from the __path the rewrite carries', async (t) => {
  const server = await withServer(t);
  const res = await request(server, '/api/index.js?__path=/api/session');
  assert.equal(res.status, 200);
  assert.equal(res.json.ok, true);
  assert.equal(res.json.owner, false);
});

test('the health probe is reachable through the rewrite', async (t) => {
  const server = await withServer(t);
  const res = await request(server, '/api/index.js?__path=/healthz');
  assert.equal(res.status, 200);
  assert.equal(res.json.ok, true);
  assert.match(res.json.storage, /^(supabase|local)$/);
});

test('the caller query string survives next to __path', async (t) => {
  const server = await withServer(t);
  const res = await request(server, '/api/index.js?__path=/api/content&scope=en');
  assert.equal(res.status, 200);
  assert.equal(res.json.ok, true);
  assert.equal(typeof res.json.content, 'object');
});

test('owner login through the rewrite reports bad credentials, not a missing route', async (t) => {
  const server = await withServer(t);
  const res = await request(server, '/api/index.js?__path=/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'owner', password: 'definitely-wrong' }),
  });
  assert.equal(res.status, 401);
  assert.equal(res.json.error, 'bad-credentials');
});

test('__path is ignored outside the rewrite destination', async (t) => {
  const server = await withServer(t);
  const res = await request(server, '/api/session?__path=/api/index.js');
  assert.equal(res.status, 200);
  assert.equal(res.json.ok, true);
  assert.equal(res.json.owner, false);
});

test('a forged __path cannot escape the API surface', async (t) => {
  const server = await withServer(t);
  const res = await request(server, '/api/index.js?__path=/etc/passwd');
  assert.equal(res.status, 404);
  assert.match(res.body, /404/);
});
