'use strict';

/**
 * The studio's own works (lib/seed-projects.js) are written into the store
 * exactly once, as ordinary projects the owner can edit or delete. These tests
 * run against an isolated data directory so the repository's own data/ is
 * never touched.
 */

const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pixelio-seed-'));
process.env.PIXELIO_DATA_DIR = DATA_DIR;

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { SEED_PROJECTS, SEED_VERSION, SEED_MARKER_PATH } = require('../lib/seed-projects.js');

const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
};

/** Loads lib/db.js as a brand-new process would: nothing cached, same data dir. */
function freshDb() {
  for (const key of Object.keys(require.cache)) {
    if (key.includes(`${path.sep}lib${path.sep}`)) delete require.cache[key];
  }
  return require('../lib/db.js');
}

test('every built-in work is complete, unique and safe to store', () => {
  assert.equal(SEED_VERSION, 1);
  assert.match(SEED_MARKER_PATH, /^__/);
  assert.ok(SEED_PROJECTS.length >= 10, 'the studio has at least ten published works');

  const keys = new Set();
  const urlKeys = new Set();
  const orders = new Set();

  for (const seed of SEED_PROJECTS) {
    assert.ok(seed.key && !keys.has(seed.key), `unique key for ${seed.url}`);
    keys.add(seed.key);

    assert.match(seed.url, /^https:\/\/[^/]+\//, `${seed.key} is an https link`);
    const urlKey = new URL(seed.url).hostname;
    assert.equal(seed.host, urlKey, `${seed.key} host matches its url`);
    assert.ok(!urlKeys.has(urlKey), `unique url for ${seed.key}`);
    urlKeys.add(urlKey);

    assert.ok(seed.title && seed.title.length <= 160, `${seed.key} has an English title`);
    assert.ok(seed.titleAr && seed.titleAr.length <= 160, `${seed.key} has an Arabic title`);
    assert.ok(seed.description && seed.description.length <= 420, `${seed.key} has an English description`);
    assert.ok(seed.descriptionAr && seed.descriptionAr.length <= 420, `${seed.key} has an Arabic description`);
    assert.ok(seed.tag && seed.tag.length <= 40, `${seed.key} has a category`);

    assert.ok(!orders.has(seed.order), `unique order for ${seed.key}`);
    orders.add(seed.order);

    // The store only accepts http(s) images (safeImageRef) — a data: URI would
    // be dropped silently, so catch it here instead.
    for (const field of ['image', 'favicon']) {
      if (seed[field] == null) continue;
      assert.match(seed[field], /^https:\/\//, `${seed.key}.${field} is an https link`);
    }
  }

  assert.deepEqual([...orders].sort((a, b) => a - b), SEED_PROJECTS.map((_, i) => i + 1));
});

test('a fresh install publishes the built-in works, in the given order', async (t) => {
  t.after(() => fs.rmSync(DATA_DIR, { recursive: true, force: true }));
  const db = freshDb();

  const projects = await db.listProjects();
  assert.equal(projects.length, SEED_PROJECTS.length);
  assert.deepEqual(projects.map((p) => p.url), SEED_PROJECTS.map((s) => s.url));

  const first = projects[0];
  const seed = SEED_PROJECTS[0];
  assert.equal(first.title, seed.title);
  assert.equal(first.titleAr, seed.titleAr);
  assert.equal(first.descriptionAr, seed.descriptionAr);
  assert.equal(first.tag, seed.tag);
  assert.equal(first.visible, true);
  assert.ok(first.id);

  const saved = readJson(PROJECTS_FILE, null);
  assert.equal(Array.isArray(saved) && saved.length, SEED_PROJECTS.length);

  // The marker keeps the seed from running again; it stays out of /api/content.
  const stored = readJson(CONTENT_FILE, {});
  assert.ok(stored.site[SEED_MARKER_PATH]);
  const publicContent = await db.getContent();
  assert.deepEqual(publicContent.site, {});
  assert.deepEqual(publicContent.en, {});
  assert.deepEqual(publicContent.ar, {});
});

test('the seed never overwrites or duplicates what is already stored', async (t) => {
  t.after(() => fs.rmSync(DATA_DIR, { recursive: true, force: true }));
  const db = freshDb();

  const [first, ...rest] = await db.listProjects();
  const edited = await db.updateProject(first.id, {
    ...first,
    title: 'Renamed by the owner',
    description: 'Edited copy the seed must not touch.',
  });
  assert.equal(edited.ok, true);

  const removed = await db.deleteProject(rest[0].id);
  assert.equal(removed.ok, true);

  // A restart: the same data directory, a brand-new database layer.
  const rebooted = freshDb();
  const projects = await rebooted.listProjects();

  assert.equal(projects.length, SEED_PROJECTS.length - 1, 'the deleted work stays deleted');
  assert.ok(!projects.some((p) => p.url === rest[0].url));

  const kept = projects.find((p) => p.url === first.url);
  assert.equal(kept.title, 'Renamed by the owner');
  assert.equal(kept.description, 'Edited copy the seed must not touch.');

  // Running the seed again is a no-op, and it never touches a hidden work.
  const again = await rebooted.seedBuiltInProjects();
  assert.deepEqual(again, { seeded: 0, skipped: true });
  assert.equal((await rebooted.listProjects()).length, SEED_PROJECTS.length - 1);
});

test('a work already stored under a seeded URL keeps its own data', async (t) => {
  t.after(() => fs.rmSync(DATA_DIR, { recursive: true, force: true }));

  // An older store: the owner published this link before the built-in list
  // existed (or the previous deployment already saved it).
  const seed = SEED_PROJECTS[2];
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify([
    {
      id: 'p-existing',
      url: seed.url,
      host: seed.host,
      title: 'The owner added this first',
      description: 'Custom copy.',
      tag: 'Custom',
      order: 0,
      visible: true,
    },
  ], null, 2));

  const db = freshDb();
  const projects = await db.listProjects();

  const matches = projects.filter((p) => p.url === seed.url);
  assert.equal(matches.length, 1, 'no duplicate card for the same link');
  assert.equal(matches[0].title, 'The owner added this first');
  assert.equal(matches[0].description, 'Custom copy.');
  assert.equal(projects.length, SEED_PROJECTS.length, 'only the missing works are added');
});
