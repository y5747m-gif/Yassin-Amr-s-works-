'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('public/index.html', 'utf8');
const script = fs.readFileSync('public/js/app.js', 'utf8');
// The page is rendered by the view scripts (public/js/views/*.js), which app.js
// mounts on start-up; they have no load-time dependencies on each other.
const views = fs.readdirSync('public/js/views').filter(f => f.endsWith('.js')).sort()
  .map(f => fs.readFileSync(`public/js/views/${f}`, 'utf8'));
const reply = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
const tick = () => new Promise(resolve => setImmediate(resolve));

async function boot(t, fetch, blockedStorage = false) {
  const dom = new JSDOM(html, { url: 'https://pixelio.example', runScripts: 'outside-only', pretendToBeVisual: true });
  t.after(() => dom.window.close());
  const w = dom.window;
  const errors = [];
  w.addEventListener('error', e => { errors.push(e.error); e.preventDefault(); });
  w.document.documentElement.classList.add('intro-skip', 'perf-lite');
  w.matchMedia = () => ({ matches: false, addEventListener() {} });
  w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  w.Element.prototype.scrollIntoView = () => {};
  w.fetch = fetch;
  if (blockedStorage) Object.defineProperty(w, 'localStorage', { get() { throw new w.DOMException('Storage blocked', 'SecurityError'); } });
  for (const view of views) w.eval(view);
  w.eval(script);
  await tick();
  assert.deepEqual(errors, []);
  return w;
}

async function login(w) {
  w.document.querySelector('#owner-btn').click();
  assert.equal(w.document.querySelector('#login-modal').hidden, false);
  w.document.querySelector('#login-user').value = 'owner';
  w.document.querySelector('#login-pass').value = 'test-password';
  w.document.querySelector('#login-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
  await tick();
}

test('owner login remains usable when browser storage is blocked', async t => {
  const w = await boot(t, async url => reply(url === '/api/login' ? { ok: true } : { ok: true, owner: false, projects: [] }), true);
  await login(w);
  assert.equal(w.document.querySelector('#owner-panel').hidden, false);
});

test('restores owner session even when project storage fails', async t => {
  const w = await boot(t, async url => url === '/api/projects' ? reply({ ok: false }, 500) : reply({ ok: true, owner: true }));
  assert.equal(w.document.querySelector('#owner-panel').hidden, false);
});

test('a delayed anonymous projects response must not undo login', async t => {
  let finishProjects;
  const w = await boot(t, url => url === '/api/projects' ? new Promise(resolve => { finishProjects = resolve; }) : Promise.resolve(reply({ ok: true, owner: false })));
  await login(w);
  finishProjects(reply({ ok: true, owner: false, projects: [] }));
  await tick();
  assert.equal(w.document.querySelector('#owner-panel').hidden, false);
});

test('server failures are not reported as incorrect credentials', async t => {
  const w = await boot(t, async url => url === '/api/login' ? reply({ ok: false }, 500) : reply({ ok: true, owner: false, projects: [] }));
  await login(w);
  assert.equal(w.document.querySelector('#login-error').textContent, 'Could not reach the server.');
  assert.equal(w.document.querySelector('#login-submit').disabled, false);
});

test('a delayed session check must not undo a newer login', async t => {
  let finishSession;
  const w = await boot(t, url => url === '/api/session' ? new Promise(resolve => { finishSession = resolve; }) : Promise.resolve(reply({ ok: true, projects: [] })));
  await login(w);
  finishSession(reply({ ok: true, owner: false }));
  await tick();
  assert.equal(w.document.querySelector('#owner-panel').hidden, false);
});

test('owner can enable editing, save settings and log out', async t => {
  const writes = [];
  const w = await boot(t, async (url, options = {}) => {
    if (options.method === 'PUT') writes.push(JSON.parse(options.body));
    return reply({ ok: true, owner: true, projects: [] });
  });
  w.document.querySelector('#edit-toggle-btn').click();
  assert.equal(w.document.body.classList.contains('owner-editing'), true);
  const title = w.document.querySelector('#setting-0');
  title.value = 'Updated studio title';
  title.dispatchEvent(new w.Event('change'));
  await tick();
  assert.deepEqual(writes, [{ scope: 'en', path: 'doc.title', value: 'Updated studio title' }]);
  assert.equal(w.document.title, 'Updated studio title');
  w.document.querySelector('#logout-btn').click();
  await tick();
  assert.equal(w.document.querySelector('#owner-panel').hidden, true);
  assert.equal(w.document.body.classList.contains('owner-editing'), false);
});

test('failed logout does not falsely claim the session has ended', async t => {
  const w = await boot(t, async url => reply({ ok: url !== '/api/logout', owner: true, projects: [] }, url === '/api/logout' ? 500 : 200));
  w.document.querySelector('#logout-btn').click();
  await tick();
  assert.equal(w.document.querySelector('#owner-panel').hidden, false);
  assert.equal(w.document.querySelector('#toast').textContent, 'Could not reach the server.');
});

test('incorrect credentials keep the login dialog open', async t => {
  const w = await boot(t, async url => url === '/api/login' ? reply({ ok: false }, 401) : reply({ ok: true, owner: false, projects: [] }));
  await login(w);
  assert.equal(w.document.querySelector('#login-error').textContent, 'Wrong username or password.');
  assert.equal(w.document.querySelector('#login-modal').hidden, false);
  assert.equal(w.document.querySelector('#owner-panel').hidden, true);
});
