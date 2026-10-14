'use strict';
// Tests for the built-in portfolio: the studio's own sites live in
// public/js/views/sites.js and are merged into the “Our Work” grid by app.js.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('public/index.html');
const viewDir = path.join(root, 'public', 'js', 'views');
const viewFiles = fs.readdirSync(viewDir).filter((f) => f.endsWith('.js')).sort();
const viewSource = (file) => fs.readFileSync(path.join(viewDir, file), 'utf8');
const appJs = read('public/js/app.js');

const reply = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
const tick = () => new Promise((resolve) => setImmediate(resolve));

/** The ten sites the studio published, as handed over by the owner. */
const EXPECTED_HOSTS = [
  'ningawy.vercel.app',
  'muslim-wa-bas-ai-assistant-1.vercel.app',
  'el-mona-akademe.vercel.app',
  'montag-est.vercel.app',
  'yaseen868.vercel.app',
  'shoter-ork-geto.vercel.app',
  't-m-d-ai.vercel.app',
  'souqi-944p.vercel.app',
  'nova-os-psi.vercel.app',
  'khallesa.vercel.app',
];

/** The list as first published, read back with no DOM at all. */
function sitesFromViews() {
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const file of viewFiles) vm.runInContext(viewSource(file), sandbox, { filename: file });
  return sandbox.PixelioViews.builtinSites;
}

/**
 * Boots the real page (index.html + views + app.js) in JSDOM against a stubbed
 * API, exactly like the browser does. `writes` collects the PUT/DELETE calls
 * made by the owner's actions.
 */
async function boot(t, { projects = [], content = {}, owner = false } = {}) {
  const writes = [];
  const dom = new JSDOM(html, { url: 'https://pixelio.example', runScripts: 'outside-only', pretendToBeVisual: true });
  t.after(() => dom.window.close());
  const w = dom.window;
  const errors = [];
  w.addEventListener('error', (e) => { errors.push(e.error); e.preventDefault(); });
  w.document.documentElement.classList.add('intro-skip', 'perf-lite');
  w.matchMedia = () => ({ matches: false, addEventListener() {} });
  w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  w.Element.prototype.scrollIntoView = () => {};
  w.fetch = async (url, options = {}) => {
    const target = String(url);
    if (options.method === 'PUT' || options.method === 'DELETE') {
      writes.push({ method: options.method, url: target, body: options.body ? JSON.parse(options.body) : null });
      return reply({ ok: true });
    }
    if (target.startsWith('/api/projects')) return reply({ ok: true, owner, projects });
    if (target.startsWith('/api/content')) {
      return reply({ ok: true, content: { en: {}, ar: {}, site: { ...content } } });
    }
    if (target.startsWith('/api/session')) return reply({ ok: true, owner });
    return reply({ ok: true, owner: false });
  };
  for (const file of viewFiles) w.eval(viewSource(file));
  w.eval(appJs);
  await tick();
  await tick();
  assert.deepEqual(errors, []);
  return { w, doc: w.document, writes };
}

const cards = (doc) => [...doc.querySelectorAll('#grid .work-card')];
const links = (doc) => cards(doc).map((card) => card.querySelector('.btn-enter').getAttribute('href'));

test('the built-in list holds the ten published sites with bilingual copy', () => {
  const sites = sitesFromViews();
  assert.equal(sites.length, EXPECTED_HOSTS.length);
  assert.deepEqual(Array.from(sites, (s) => s.host), EXPECTED_HOSTS, 'hosts, in order');
  assert.equal(new Set(sites.map((s) => s.id)).size, sites.length, 'ids are unique');
  for (const site of sites) {
    assert.match(site.url, /^https:\/\/[a-z0-9.-]+\/$/i, `${site.id} has a https link`);
    assert.equal(site.url, `https://${site.host}/`, `${site.id}: link matches the host`);
    for (const field of ['title', 'titleAr', 'description', 'descriptionAr']) {
      assert.ok(String(site[field] || '').trim().length > 4, `${site.id}.${field} is filled in`);
    }
    assert.ok(site.image, `${site.id} has a preview image`);
    assert.match(site.accent, /^#[0-9a-f]{6}$/i, `${site.id} has a poster colour`);
    assert.equal(site.builtin, true);
  }
});

test('the sites.js view adds nothing but the shared namespace', () => {
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(viewSource('sites.js'), sandbox, { filename: 'sites.js' });
  assert.deepEqual(Object.keys(sandbox).sort(), ['PixelioViews', 'window']);
});

test('every built-in site is a card in “Our Work” with an entry button', async (t) => {
  const { doc } = await boot(t);
  assert.equal(cards(doc).length, EXPECTED_HOSTS.length);
  assert.deepEqual(links(doc), Array.from(sitesFromViews(), (s) => s.url));
  for (const card of cards(doc)) {
    assert.equal(card.dataset.builtin, '1');
    const enter = card.querySelector('.btn-enter');
    assert.equal(enter.getAttribute('target'), '_blank');
    assert.equal(enter.querySelector('[data-i18n="card.enter"]').textContent, 'Enter site');
    assert.ok(card.querySelector('.device-screen').getAttribute('href').startsWith('https://'));
    assert.ok(card.querySelector('.device-screen .screen-enter'), 'the screen carries an entry chip');
    assert.ok(card.querySelector('.shot-poster'), 'a designed poster backstops the preview');
    assert.ok(card.querySelector('.poster-title').textContent.trim(), 'the poster names the site');
  }

  // Sites whose preview comes from a live capture service drop the small
  // “generating…” placeholder so the designed poster stays visible instead.
  const captured = cards(doc).filter((card) => /naturalWidth/.test(card.querySelector('.shot-img').getAttribute('onload') || ''));
  assert.ok(captured.length > 0, 'captured previews are guarded');
  for (const card of captured) {
    const src = card.querySelector('.shot-img').getAttribute('src');
    assert.match(src, /^https:\/\/s\.wordpress\.com\/mshots\/v1\/https%3A%2F%2F/);
  }
});

test('the hero showcase shows the published sites and links into them', async (t) => {
  const { doc } = await boot(t);
  const shots = [...doc.querySelectorAll('#hero-stack .shot')];
  assert.equal(shots.length, 4);
  for (const shot of shots) {
    assert.ok(shot.classList.contains('cover'), 'hero previews fill the screen');
    assert.equal(shot.tagName, 'A');
    assert.equal(shot.getAttribute('target'), '_blank');
  }
  assert.equal(doc.getElementById('hero-dots').hidden, false);
});

test('an owner-published project with the same link replaces its built-in twin', async (t) => {
  const { doc } = await boot(t, {
    projects: [{
      id: 'p-1', url: 'https://ningawy.vercel.app/', host: 'ningawy.vercel.app',
      title: 'NINJAWY (edited by the owner)', description: '', image: null, favicon: null,
    }],
  });
  assert.equal(cards(doc).length, EXPECTED_HOSTS.length, 'no duplicate card');
  const ninjawy = cards(doc).filter((card) => card.querySelector('.btn-enter').href.includes('ningawy.vercel.app'));
  assert.equal(ninjawy.length, 1);
  assert.equal(ninjawy[0].dataset.id, 'p-1', 'the database entry wins');
  assert.equal(ninjawy[0].dataset.builtin, undefined);
  assert.equal(ninjawy[0].querySelector('.btn-project-edit') !== null, false, 'not editable while signed out');
});

test('a site the owner hid is gone for every visitor', async (t) => {
  const { doc } = await boot(t, { content: { 'hidden.sites': JSON.stringify(['site-khallesa']) } });
  assert.equal(cards(doc).length, EXPECTED_HOSTS.length - 1);
  assert.ok(!links(doc).some((href) => href.includes('khallesa.vercel.app')));
});

test('the owner can hide a built-in site from its card and restore it', async (t) => {
  const { doc, writes } = await boot(t, { owner: true });
  const card = cards(doc).find((c) => c.dataset.id === 'site-montage');
  assert.ok(card, 'the card is on the page');
  const hideBtn = card.querySelector('.btn-remove');
  assert.equal(hideBtn.classList.contains('btn-hide-site'), true);
  assert.equal(card.querySelector('.btn-project-edit'), null, 'built-in cards are not edited in place');

  hideBtn.click();
  await tick(); await tick();

  assert.deepEqual(writes[0], {
    method: 'PUT', url: '/api/content',
    body: { scope: 'site', path: 'hidden.sites', value: JSON.stringify(['site-montage']) },
  });
  assert.equal(cards(doc).length, EXPECTED_HOSTS.length - 1);
  const restore = doc.getElementById('unhide-sites-btn');
  assert.equal(restore.hidden, false, 'the restore button appears for the owner');
  assert.match(restore.textContent, /\(1\)$/);

  restore.click();
  await tick(); await tick();

  assert.deepEqual(writes[1], { method: 'DELETE', url: '/api/content?scope=site&path=hidden.sites', body: null });
  assert.equal(cards(doc).length, EXPECTED_HOSTS.length);
  assert.equal(doc.getElementById('unhide-sites-btn').hidden, true);
});

test('a visitor never sees the owner-only hide controls', async (t) => {
  const { doc } = await boot(t);
  assert.equal(doc.getElementById('unhide-sites-btn').hidden, true);
  assert.equal(doc.querySelector('#grid .btn-remove'), null);
  assert.equal(doc.body.classList.contains('owner-editing'), false);
});
