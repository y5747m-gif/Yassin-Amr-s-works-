'use strict';
// Tests for the JavaScript views that build the page (public/js/views/*.js).
// The views are plain functions from (ctx) to markup, so most checks run in a
// bare VM context with no DOM at all. Structure checks mount the page in JSDOM.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const viewDir = path.join(root, 'public', 'js', 'views');
const viewFiles = fs.readdirSync(viewDir).filter((f) => f.endsWith('.js')).sort();
const viewSource = (file) => fs.readFileSync(path.join(viewDir, file), 'utf8');
const indexHtml = read('public/index.html');
const appJs = read('public/js/app.js');

const CONTACTS = [
  { display: '0114 136 2626', e164: '201141362626' },
  { display: '0150 270 1881', e164: '201502701881' },
];
// Translation stub: every key renders as «key», so a test can see which key produced which text.
const t = (key) => `«${key}»`;
const context = (overrides = {}) => ({ t, lang: 'en', contacts: CONTACTS, ...overrides });

/** Runs the view scripts in a bare VM context: no document, no DOM. */
function renderer(files = viewFiles) {
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const file of files) vm.runInContext(viewSource(file), sandbox, { filename: file });
  return { views: sandbox.PixelioViews, globals: Object.keys(sandbox).sort() };
}

/** Mounts the page into a JSDOM copy of index.html, the way app.js does at start-up. */
function withPage(overrides, check) {
  const dom = new JSDOM(indexHtml, { runScripts: 'outside-only' });
  try {
    for (const file of viewFiles) dom.window.eval(viewSource(file));
    dom.window.document.getElementById('app').innerHTML = dom.window.PixelioViews.page(context(overrides));
    check(dom.window.document);
  } finally {
    dom.window.close();
  }
}

test('index.html is a shell: head metadata, one mount point, then the view scripts', () => {
  const head = indexHtml.slice(0, indexHtml.indexOf('<body>'));
  const body = indexHtml.slice(indexHtml.indexOf('<body>')).replace(/<noscript>[\s\S]*?<\/noscript>/, '');
  assert.match(head, /<title>[^<]+<\/title>/);
  assert.match(head, /<meta name="description" content="[^"]+"/);
  assert.equal(body.match(/<div id="app"><\/div>/g)?.length, 1);
  assert.doesNotMatch(body, /<(section|header|nav|main|footer|form|button|h1|h2|p)[\s>]/);

  const viewTags = viewFiles.map((f) => indexHtml.indexOf(`<script src="js/views/${f}" defer>`));
  assert.ok(viewTags.every((i) => i > 0), 'index.html loads every view file');
  assert.ok(indexHtml.indexOf('js/app.js') > Math.max(...viewTags), 'app.js loads after the views');
});

test('the views add only PixelioViews to the global scope', () => {
  const { views, globals } = renderer();
  assert.ok(typeof views.page === 'function');
  assert.deepEqual(globals, ['PixelioViews', 'window']);
});

test('the views do not depend on load order', () => {
  const forward = renderer().views.page(context());
  const backward = renderer([...viewFiles].reverse()).views.page(context());
  assert.equal(backward, forward);
});

test('the page contains every element id that app.js looks up', () => {
  const html = renderer().views.page(context());
  const present = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  const wanted = new Set([...appJs.matchAll(/\$\('#([\w-]+)'\)/g)].map((m) => m[1]));
  wanted.delete('app'); // the mount point itself lives in index.html
  assert.ok(wanted.size > 40, 'app.js references the page by id');
  assert.deepEqual([...wanted].filter((id) => !present.has(id)), []);
});

test('element ids are unique, so lookups by id find the intended node', () => {
  const ids = [...renderer().views.page(context()).matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), []);
});

test('translated text is escaped unless its key is marked as rich markup', () => {
  const hostile = '<img src=x onerror="alert(1)">';
  const html = renderer().views.page(
    context({ t: (key) => (key === 'hero.sub' ? hostile : key === 'brand.name' ? '<em>Pixelio</em>' : t(key)) }),
  );
  assert.ok(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('<em>Pixelio</em>'), 'data-i18n-html text keeps its markup');
});

test('WhatsApp links and the footer follow the numbers the owner has set', () => {
  const html = renderer().views.page(
    context({
      contacts: [
        { display: '0100 000 0001', e164: '201000000001' },
        { display: '0100 000 0002', e164: '201000000002' },
      ],
    }),
  );
  assert.match(html, /id="wa-fab-link" href="https:\/\/wa\.me\/201000000001"/);
  assert.match(html, /id="hero-order-link" href="https:\/\/wa\.me\/201000000001\?text=%C2%ABhero\.orderMsg%C2%BB"/);
  assert.match(html, /id="services-order-btn" href="https:\/\/wa\.me\/201000000001\?text=/);
  assert.match(html, /id="footer-phones" dir="ltr">0100 000 0001 · 0100 000 0002</);
});

test('the language toggle shows the active language', () => {
  const html = renderer().views.page(context({ lang: 'ar' }));
  assert.match(html, /class="lang-toggle" dir="ltr" role="group" aria-label="Language" data-active="ar"/);
  assert.match(html, /<button type="button" data-lang="ar" class="active">عربي<\/button>/);
  assert.match(html, /<button type="button" data-lang="en">EN<\/button>/);
});

test('the shared WhatsApp glyph takes its size as an argument', () => {
  const svg = renderer().views.icons.wa(15);
  assert.match(svg, /^<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12\.04 2c/);
});

test('the page is laid out in the order the stylesheet expects', () => {
  withPage({}, (doc) => {
    const top = [...doc.querySelectorAll('#app > *')].map((el) => el.id || el.classList[0]);
    assert.deepEqual(top, [
      'cursor-aura', 'intro', 'bg', 'cube-field', 'px-defs', 'nav', 'top', 'wa-fab-link', 'login-modal', 'project-modal', 'toast',
    ]);
    const sections = [...doc.querySelectorAll('#app main > *')].map((el) => el.id || el.classList[0]);
    assert.deepEqual(sections, ['hero', 'marquee', 'services', 'work', 'about', 'contact']);
  });
});

test('child counts that the stylesheet relies on (nth-child and friends) are intact', () => {
  withPage({}, (doc) => {
    const count = (selector) => doc.querySelectorAll(selector).length;
    assert.equal(count('.intro-logo > .il'), 7, 'one span per letter of PIXELIO');
    assert.equal(count('.intro-rings > span'), 3);
    assert.equal(count('.intro-bars > i'), 6);
    assert.equal(count('.bg-curves > path'), 4);
    assert.equal(count('.glass-cube > i'), 12, 'two cubes, six faces each');
    assert.equal(count('.burger > i'), 3);
    assert.equal(count('.hero-device > .device'), 1);
  });
});

test('owner-only UI and dialogs start hidden', () => {
  withPage({}, (doc) => {
    for (const id of [
      'owner-panel', 'edit-hint', 'empty', 'login-modal', 'project-modal', 'login-error',
      'project-edit-error', 'owner-dot', 'add-spinner', 'login-spinner',
    ]) {
      assert.equal(doc.getElementById(id).hidden, true, `#${id} should start hidden`);
    }
  });
});
