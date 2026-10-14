'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

const { SEED_PROJECTS, SEED_VERSION, SEED_MARKER_PATH } = require('./seed-projects.js');

const ROOT_DIR = path.resolve(__dirname, '..');

/* ----------------------------- load .env safely ---------------------------- */

function loadDotEnv() {
  const envFile = path.join(ROOT_DIR, '.env');
  try {
    if (!fs.existsSync(envFile)) return;
    const raw = fs.readFileSync(envFile, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch {
    /* ignore .env read errors */
  }
}

loadDotEnv();

/* ----------------------------- configuration ------------------------------- */

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();

// `PIXELIO_DATA_DIR` keeps the JSON store somewhere else — useful for tests and
// for running two instances side by side. Defaults to `<repo>/data`.
const DATA_DIR = process.env.PIXELIO_DATA_DIR
  ? path.resolve(process.env.PIXELIO_DATA_DIR)
  : path.join(ROOT_DIR, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const PROJECTS_BACKUP_FILE = path.join(DATA_DIR, 'projects.backup.json');
const CONTENT_BACKUP_FILE = path.join(DATA_DIR, 'content.backup.json');

const TMP_DATA_DIR = path.join(os.tmpdir(), 'pixelio-data');
const TMP_PROJECTS_FILE = path.join(TMP_DATA_DIR, 'projects.json');
const TMP_CONTENT_FILE = path.join(TMP_DATA_DIR, 'content.json');

const LEGACY_DEMO_IDS = new Set(['demo-1', 'demo-2', 'demo-3', 'demo-4']);
const RESERVED_CONTENT_PROJECT_ID = '__pixelio_site_content__';

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    console.error('Supabase client initialization failed:', err.message);
  }
}

function isSupabaseConfigured() {
  return Boolean(supabase);
}

/* ----------------------------- sanitization -------------------------------- */

function isLegacyDemoProject(project) {
  return Boolean(project && (project.demo === true || LEGACY_DEMO_IDS.has(project.id)));
}

function sanitizeText(value, max) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);
}

function safeHttpUrl(raw) {
  try {
    const u = new URL(String(raw || '').trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname || !u.hostname.includes('.')) return null;
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

function normalizeUrlKey(rawUrl) {
  try {
    const x = new URL(rawUrl);
    return (x.hostname.replace(/^www\./, '') + x.pathname.replace(/\/+$/, '') + x.search).toLowerCase();
  } catch {
    return String(rawUrl || '').toLowerCase();
  }
}

function extractHost(url, fallbackHost) {
  const clean = sanitizeText(fallbackHost, 120);
  if (clean) return clean;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function normalizeProjectInput(input, existing = null) {
  const url = safeHttpUrl(input && input.url);
  if (!url) return null;

  const host = extractHost(url, input.host || (existing && existing.host));
  const nowIso = new Date().toISOString();
  const categoryVal = sanitizeText(
    input.category !== undefined ? input.category : (input.tag !== undefined ? input.tag : (existing && (existing.category || existing.tag))),
    40,
  );
  const tagVal = sanitizeText(
    input.tag !== undefined ? input.tag : (input.category !== undefined ? input.category : (existing && (existing.tag || existing.category))),
    40,
  ) || categoryVal;

  const orderVal = typeof input.order === 'number' && Number.isFinite(input.order)
    ? Math.trunc(input.order)
    : (existing && typeof existing.order === 'number' ? existing.order : 0);

  const visibleVal = typeof input.visible === 'boolean'
    ? input.visible
    : (existing && typeof existing.visible === 'boolean' ? existing.visible : true);

  const createdAt = (existing && (existing.created_at || existing.addedAt)) ||
                    input.created_at ||
                    input.addedAt ||
                    nowIso;

  return {
    id: (existing && existing.id) ||
        (input.id && typeof input.id === 'string' ? sanitizeText(input.id, 80) : '') ||
        ('p-' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex')),
    url,
    host,
    title: sanitizeText(input.title, 160) || (existing && existing.title) || host || 'Untitled',
    titleAr: sanitizeText(
      input.titleAr !== undefined ? input.titleAr : (input.title_ar !== undefined ? input.title_ar : (existing && (existing.titleAr || existing.title_ar))),
      160,
    ),
    description: sanitizeText(
      input.description !== undefined ? input.description : (existing && existing.description),
      420,
    ),
    descriptionAr: sanitizeText(
      input.descriptionAr !== undefined ? input.descriptionAr : (input.description_ar !== undefined ? input.description_ar : (existing && (existing.descriptionAr || existing.description_ar))),
      420,
    ),
    image: input.image !== undefined ? safeImageRef(input.image) : (existing ? safeImageRef(existing.image) : null),
    favicon: input.favicon !== undefined ? safeImageRef(input.favicon) : (existing ? safeImageRef(existing.favicon) : null),
    category: categoryVal || tagVal,
    tag: tagVal || categoryVal,
    order: orderVal,
    visible: visibleVal,
    addedAt: createdAt,
    created_at: createdAt,
    updatedAt: nowIso,
    updated_at: nowIso,
  };
}

/** Public project format sent to the browser — no internal/secret fields. */
function formatProjectForClient(row) {
  if (!row) return null;
  const url = row.url || '';
  const host = extractHost(url, row.host);
  const tag = row.tag || row.category || '';
  const category = row.category || row.tag || '';
  const addedAt = row.addedAt || row.created_at || new Date().toISOString();
  const updatedAt = row.updatedAt || row.updated_at || addedAt;

  return {
    id: String(row.id),
    url,
    host,
    title: row.title || host || 'Untitled',
    titleAr: row.titleAr || row.title_ar || '',
    description: row.description || '',
    descriptionAr: row.descriptionAr || row.description_ar || '',
    image: row.image || null,
    favicon: row.favicon || null,
    tag,
    category,
    order: typeof row.order === 'number' ? row.order : 0,
    visible: row.visible !== false,
    addedAt,
    updatedAt,
  };
}

/* --------------------- Supabase row mappers & fallbacks -------------------- */

let useMinimalProjectColumns = false;
let hasSiteContentTable = true;

function toSupabaseRow(project, minimal = false) {
  if (minimal) {
    return {
      id: project.id,
      title: project.title,
      url: project.url,
      description: project.description || '',
      image: project.image || null,
      category: project.category || project.tag || '',
      order: typeof project.order === 'number' ? project.order : 0,
      visible: project.visible !== false,
      created_at: project.created_at || project.addedAt || new Date().toISOString(),
      updated_at: project.updated_at || project.updatedAt || new Date().toISOString(),
    };
  }
  return {
    id: project.id,
    title: project.title,
    title_ar: project.titleAr || '',
    url: project.url,
    host: project.host || '',
    description: project.description || '',
    description_ar: project.descriptionAr || '',
    image: project.image || null,
    favicon: project.favicon || null,
    category: project.category || project.tag || '',
    tag: project.tag || project.category || '',
    order: typeof project.order === 'number' ? project.order : 0,
    visible: project.visible !== false,
    created_at: project.created_at || project.addedAt || new Date().toISOString(),
    updated_at: project.updated_at || project.updatedAt || new Date().toISOString(),
  };
}

function isMissingColumnError(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '').toLowerCase();
  return (
    code === 'PGRST204' ||
    code === '42703' ||
    msg.includes('column') && (msg.includes('does not exist') || msg.includes('schema cache'))
  );
}

/** True when the table (or the whole schema) has not been created yet. */
function isMissingTableError(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || '').toLowerCase();
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache')
  );
}

/* ------------------------ Short-TTL Memory Cache --------------------------- */

const CACHE_TTL_MS = 3000;
let projectsCache = null;
let projectsCacheAt = 0;
let contentCache = null;
let contentCacheAt = 0;

function invalidateProjectsCache() {
  projectsCache = null;
  projectsCacheAt = 0;
}

function invalidateContentCache() {
  contentCache = null;
  contentCacheAt = 0;
}

/* --------------------- Local File Storage & Migration ---------------------- */

let serialQueue = Promise.resolve();
function runSerialized(fn) {
  const next = serialQueue.then(fn, fn);
  serialQueue = next.catch(() => {});
  return next;
}

function readJsonFileSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function atomicWriteJson(targetFile, fallbackTmpFile, value) {
  const payload = JSON.stringify(value, null, 2);
  const tryWrite = async (file) => {
    await fsp.mkdir(path.dirname(file), { recursive: true });
    const tempFile = `${file}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    try {
      await fsp.writeFile(tempFile, payload, 'utf8');
      await fsp.rename(tempFile, file);
    } catch (err) {
      await fsp.unlink(tempFile).catch(() => {});
      throw err;
    }
  };

  try {
    await tryWrite(targetFile);
  } catch {
    await tryWrite(fallbackTmpFile);
  }
}

let localProjects = null;
let localContent = null;

function ensureLocalLoaded() {
  if (localProjects === null) {
    const primary = readJsonFileSafe(PROJECTS_FILE, null);
    const tmp = readJsonFileSafe(TMP_PROJECTS_FILE, null);
    const rawList = Array.isArray(primary) ? primary : (Array.isArray(tmp) ? tmp : []);
    const filtered = rawList
      .filter((p) => p && !isLegacyDemoProject(p) && p.id !== RESERVED_CONTENT_PROJECT_ID)
      .map((p, idx) => normalizeProjectInput({ ...p, order: typeof p.order === 'number' ? p.order : idx }, p))
      .filter(Boolean);
    localProjects = filtered;
    if (Array.isArray(primary) && filtered.length !== primary.length) {
      atomicWriteJson(PROJECTS_FILE, TMP_PROJECTS_FILE, localProjects).catch(() => {});
    }
  }

  if (localContent === null) {
    const primary = readJsonFileSafe(CONTENT_FILE, null);
    const tmp = readJsonFileSafe(TMP_CONTENT_FILE, null);
    const parsed = (primary && typeof primary === 'object') ? primary : ((tmp && typeof tmp === 'object') ? tmp : {});
    localContent = {
      en: (parsed.en && typeof parsed.en === 'object') ? { ...parsed.en } : {},
      ar: (parsed.ar && typeof parsed.ar === 'object') ? { ...parsed.ar } : {},
      site: (parsed.site && typeof parsed.site === 'object') ? { ...parsed.site } : {},
    };
  }
}

async function createSafeBackups() {
  try {
    if (fs.existsSync(PROJECTS_FILE) && !fs.existsSync(PROJECTS_BACKUP_FILE)) {
      await fsp.copyFile(PROJECTS_FILE, PROJECTS_BACKUP_FILE);
    }
    if (fs.existsSync(CONTENT_FILE) && !fs.existsSync(CONTENT_BACKUP_FILE)) {
      await fsp.copyFile(CONTENT_FILE, CONTENT_BACKUP_FILE);
    }
  } catch {
    /* ignore on read-only serverless filesystem */
  }
}

/* ---------------------- Built-in works (lib/seed-projects.js) -------------- */

/**
 * Writes the studio's own works (lib/seed-projects.js) into the store once.
 *
 * They become ordinary projects: the owner can edit, re-order, hide or delete
 * them from the site like anything else. A marker in the content store records
 * that the seed has run, so a work the owner deletes never comes back and an
 * edited work is never overwritten. Works that are already in the store (matched
 * by URL) are left exactly as they are.
 *
 * Never awaits `migrateLegacyFilesToDatabase()` — that function awaits this one.
 */
let seedResultPromise = null;

async function readSeedMarker() {
  if (supabase && hasSiteContentTable) {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('scope', 'site')
      .eq('path', SEED_MARKER_PATH)
      .maybeSingle();
    if (!error) return data ? String(data.value ?? SEED_VERSION) : null;
    if (isMissingTableError(error)) hasSiteContentTable = false;
  }
  ensureLocalLoaded();
  return Object.prototype.hasOwnProperty.call(localContent.site, SEED_MARKER_PATH)
    ? localContent.site[SEED_MARKER_PATH]
    : null;
}

async function writeSeedMarker(note) {
  const value = String(note ?? SEED_VERSION);
  ensureLocalLoaded();
  localContent.site[SEED_MARKER_PATH] = value;

  if (supabase && hasSiteContentTable) {
    const { error } = await supabase
      .from('site_content')
      .upsert(
        { scope: 'site', path: SEED_MARKER_PATH, value, updated_at: new Date().toISOString() },
        { onConflict: 'scope,path' },
      );
    if (error && isMissingTableError(error)) hasSiteContentTable = false;
  }

  await atomicWriteJson(CONTENT_FILE, TMP_CONTENT_FILE, localContent).catch(() => {});
  invalidateContentCache();
}

/** The stored projects' URLs, so a work is only added when it is really missing. */
async function readStoredProjectRows() {
  if (supabase) {
    const { data, error } = await supabase.from('projects').select('id,url');
    if (!error && Array.isArray(data)) return { source: 'supabase', rows: data };
    console.error('Supabase seedProjects read error:', error && error.message);
  }
  ensureLocalLoaded();
  return { source: 'local', rows: localProjects.map((p) => ({ id: p.id, url: p.url })) };
}

async function seedBuiltInProjects() {
  if (seedResultPromise) return seedResultPromise;

  seedResultPromise = (async () => {
    const marker = await readSeedMarker();
    if (marker) return { seeded: 0, skipped: true };

    const { source, rows } = await readStoredProjectRows();
    const known = new Set(rows.map((row) => normalizeUrlKey(row.url)));

    const missing = SEED_PROJECTS
      .map((seed, index) => normalizeProjectInput({ order: index + 1, ...seed }))
      .filter(Boolean)
      .filter((project) => !known.has(normalizeUrlKey(project.url)));

    if (missing.length === 0) {
      await writeSeedMarker(`${SEED_VERSION}:0`);
      return { seeded: 0, skipped: false };
    }

    let seeded = 0;

    if (source === 'supabase') {
      let { error } = await supabase
        .from('projects')
        .insert(missing.map((project) => toSupabaseRow(project, useMinimalProjectColumns)));

      if (error && isMissingColumnError(error) && !useMinimalProjectColumns) {
        useMinimalProjectColumns = true;
        ({ error } = await supabase
          .from('projects')
          .insert(missing.map((project) => toSupabaseRow(project, true))));
      }

      if (error) console.error('Supabase seedProjects insert error:', error.message);
      else seeded = missing.length;
    }

    if (!seeded) {
      ensureLocalLoaded();
      const ids = new Set(localProjects.map((p) => p.id));
      for (const project of missing) {
        if (!ids.has(project.id)) {
          localProjects.push(project);
          ids.add(project.id);
        }
      }
      await atomicWriteJson(PROJECTS_FILE, TMP_PROJECTS_FILE, localProjects).catch(() => {});
      seeded = missing.length;
    }

    invalidateProjectsCache();
    await writeSeedMarker(`${SEED_VERSION}:${seeded}`);
    return { seeded, skipped: false };
  })().catch((err) => {
    console.error('Seed projects error:', err && err.message);
    return { seeded: 0, skipped: false, failed: true };
  });

  return seedResultPromise;
}

let migrationPromise = null;

async function migrateLegacyFilesToDatabase() {
  if (migrationPromise) return migrationPromise;
  migrationPromise = (async () => {
    ensureLocalLoaded();
    await createSafeBackups();

    if (!supabase) {
      const seeded = await seedBuiltInProjects();
      return {
        mode: 'local',
        migratedProjects: localProjects.length,
        migratedContentKeys:
          Object.keys(localContent.en).length +
          Object.keys(localContent.ar).length +
          Object.keys(localContent.site).length,
        seededProjects: seeded.seeded,
      };
    }

    let migratedProjects = 0;
    let migratedContentKeys = 0;

    if (localProjects.length > 0) {
      for (let i = 0; i < localProjects.length; i++) {
        const proj = localProjects[i];
        let { error } = await supabase
          .from('projects')
          .upsert(toSupabaseRow(proj, useMinimalProjectColumns), { onConflict: 'id' });
        if (error && isMissingColumnError(error) && !useMinimalProjectColumns) {
          useMinimalProjectColumns = true;
          ({ error } = await supabase
            .from('projects')
            .upsert(toSupabaseRow(proj, true), { onConflict: 'id' }));
        }
        if (!error) migratedProjects++;
      }
    }

    const contentRows = [];
    for (const scope of ['en', 'ar', 'site']) {
      const bucket = localContent[scope] || {};
      for (const [keyPath, value] of Object.entries(bucket)) {
        contentRows.push({
          scope,
          path: keyPath,
          value: String(value ?? ''),
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (contentRows.length > 0 && hasSiteContentTable) {
      const { error } = await supabase
        .from('site_content')
        .upsert(contentRows, { onConflict: 'scope,path' });
      if (error) {
        hasSiteContentTable = false;
      } else {
        migratedContentKeys = contentRows.length;
      }
    }

    const seeded = await seedBuiltInProjects();

    return { mode: 'supabase', migratedProjects, migratedContentKeys, seededProjects: seeded.seeded };
  })();

  return migrationPromise;
}

/* ----------------------------- Projects CRUD ------------------------------- */

async function listProjects({ includeHidden = false } = {}) {
  const now = Date.now();
  if (!includeHidden && projectsCache && now - projectsCacheAt < CACHE_TTL_MS) {
    return projectsCache;
  }

  await migrateLegacyFilesToDatabase();

  if (supabase) {
    let query = supabase
      .from('projects')
      .select('*')
      .neq('id', RESERVED_CONTENT_PROJECT_ID)
      .order('order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!includeHidden) {
      query = query.eq('visible', true);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      const cleaned = data
        .filter((row) => !isLegacyDemoProject(row))
        .map(formatProjectForClient)
        .filter(Boolean);
      if (!includeHidden) {
        projectsCache = cleaned;
        projectsCacheAt = Date.now();
      }
      return cleaned;
    }
    console.error('Supabase listProjects error:', error && error.message);
  }

  ensureLocalLoaded();
  const list = localProjects
    .filter((p) => includeHidden || p.visible !== false)
    .map(formatProjectForClient);
  if (!includeHidden) {
    projectsCache = list;
    projectsCacheAt = Date.now();
  }
  return list;
}

async function getProjectById(id) {
  if (!id || id === RESERVED_CONTENT_PROJECT_ID) return null;
  await migrateLegacyFilesToDatabase();

  if (supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!error && data) return formatProjectForClient(data);
  }

  ensureLocalLoaded();
  const found = localProjects.find((p) => p.id === id);
  return found ? formatProjectForClient(found) : null;
}

async function createProject(input) {
  return runSerialized(async () => {
    await migrateLegacyFilesToDatabase();
    const project = normalizeProjectInput(input);
    if (!project) {
      return { ok: false, status: 400, error: 'invalid-project' };
    }

    const existingList = await listProjects({ includeHidden: true });
    const targetKey = normalizeUrlKey(project.url);
    if (existingList.some((p) => normalizeUrlKey(p.url) === targetKey)) {
      return { ok: false, status: 409, error: 'duplicate' };
    }

    if (supabase) {
      let { data, error } = await supabase
        .from('projects')
        .insert(toSupabaseRow(project, useMinimalProjectColumns))
        .select('*')
        .single();

      if (error && isMissingColumnError(error) && !useMinimalProjectColumns) {
        useMinimalProjectColumns = true;
        ({ data, error } = await supabase
          .from('projects')
          .insert(toSupabaseRow(project, true))
          .select('*')
          .single());
      }

      if (error) {
        console.error('Supabase createProject error:', error.message);
        return { ok: false, status: 500, error: 'db-error', message: 'Could not save project to database.' };
      }

      const saved = formatProjectForClient({ ...project, ...data });
      ensureLocalLoaded();
      localProjects.unshift(project);
      await atomicWriteJson(PROJECTS_FILE, TMP_PROJECTS_FILE, localProjects).catch(() => {});
      invalidateProjectsCache();
      return { ok: true, status: 200, project: saved };
    }

    ensureLocalLoaded();
    localProjects.unshift(project);
    await atomicWriteJson(PROJECTS_FILE, TMP_PROJECTS_FILE, localProjects);
    invalidateProjectsCache();
    return { ok: true, status: 200, project: formatProjectForClient(project) };
  });
}

async function updateProject(id, input) {
  return runSerialized(async () => {
    await migrateLegacyFilesToDatabase();
    const current = await getProjectById(id);
    if (!current) {
      return { ok: false, status: 404, error: 'not-found' };
    }

    const updated = normalizeProjectInput(input, current);
    if (!updated) {
      return { ok: false, status: 400, error: 'invalid-project' };
    }

    if (supabase) {
      let { data, error } = await supabase
        .from('projects')
        .update(toSupabaseRow(updated, useMinimalProjectColumns))
        .eq('id', id)
        .select('*')
        .single();

      if (error && isMissingColumnError(error) && !useMinimalProjectColumns) {
        useMinimalProjectColumns = true;
        ({ data, error } = await supabase
          .from('projects')
          .update(toSupabaseRow(updated, true))
          .eq('id', id)
          .select('*')
          .single());
      }

      if (error) {
        console.error('Supabase updateProject error:', error.message);
        return { ok: false, status: 500, error: 'db-error', message: 'Could not update project in database.' };
      }

      const saved = formatProjectForClient({ ...updated, ...data });
      ensureLocalLoaded();
      const idx = localProjects.findIndex((p) => p.id === id);
      if (idx >= 0) localProjects[idx] = updated;
      await atomicWriteJson(PROJECTS_FILE, TMP_PROJECTS_FILE, localProjects).catch(() => {});
      invalidateProjectsCache();
      return { ok: true, status: 200, project: saved };
    }

    ensureLocalLoaded();
    const index = localProjects.findIndex((p) => p.id === id);
    if (index < 0) return { ok: false, status: 404, error: 'not-found' };
    localProjects[index] = updated;
    await atomicWriteJson(PROJECTS_FILE, TMP_PROJECTS_FILE, localProjects);
    invalidateProjectsCache();
    return { ok: true, status: 200, project: formatProjectForClient(updated) };
  });
}

/**
 * Safely merges background-fetched metadata into a newly created project
 * ONLY if the project still exists and the owner hasn't already customized
 * its fields in the meantime (prevents race conditions).
 */
async function enrichProjectWithMetadata(id, meta) {
  if (!id || !meta) return { ok: false, updated: false };
  return runSerialized(async () => {
    const current = await getProjectById(id);
    if (!current) return { ok: false, updated: false };

    const titleIsDefault = !current.title || current.title === current.host || current.title === 'Untitled';
    const nextTitle = titleIsDefault && meta.title ? sanitizeText(meta.title, 160) : current.title;
    const nextDesc = !current.description && meta.description ? sanitizeText(meta.description, 420) : current.description;
    const nextImage = !current.image && meta.image ? safeImageRef(meta.image) : current.image;
    const nextFavicon = !current.favicon && meta.favicon ? safeImageRef(meta.favicon) : current.favicon;
    const nextHost = current.host || sanitizeText(meta.host, 120);

    const changed =
      nextTitle !== current.title ||
      nextDesc !== current.description ||
      nextImage !== current.image ||
      nextFavicon !== current.favicon ||
      nextHost !== current.host;

    if (!changed) {
      return { ok: true, updated: false, project: current };
    }

    const merged = normalizeProjectInput(
      {
        ...current,
        title: nextTitle,
        description: nextDesc,
        image: nextImage,
        favicon: nextFavicon,
        host: nextHost,
      },
      current,
    );

    if (supabase) {
      let { data, error } = await supabase
        .from('projects')
        .update(toSupabaseRow(merged, useMinimalProjectColumns))
        .eq('id', id)
        .select('*')
        .single();

      if (error && isMissingColumnError(error) && !useMinimalProjectColumns) {
        useMinimalProjectColumns = true;
        ({ data, error } = await supabase
          .from('projects')
          .update(toSupabaseRow(merged, true))
          .eq('id', id)
          .select('*')
          .single());
      }

      if (error) {
        return { ok: false, updated: false, project: current };
      }

      const saved = formatProjectForClient({ ...merged, ...data });
      ensureLocalLoaded();
      const idx = localProjects.findIndex((p) => p.id === id);
      if (idx >= 0) localProjects[idx] = merged;
      await atomicWriteJson(PROJECTS_FILE, TMP_PROJECTS_FILE, localProjects).catch(() => {});
      invalidateProjectsCache();
      return { ok: true, updated: true, project: saved };
    }

    ensureLocalLoaded();
    const idx = localProjects.findIndex((p) => p.id === id);
    if (idx < 0) return { ok: false, updated: false };
    localProjects[idx] = merged;
    await atomicWriteJson(PROJECTS_FILE, TMP_PROJECTS_FILE, localProjects);
    invalidateProjectsCache();
    return { ok: true, updated: true, project: formatProjectForClient(merged) };
  });
}

async function deleteProject(id) {
  return runSerialized(async () => {
    if (!id || id === RESERVED_CONTENT_PROJECT_ID) {
      return { ok: false, status: 404, error: 'not-found' };
    }
    await migrateLegacyFilesToDatabase();

    if (supabase) {
      const existing = await getProjectById(id);
      if (!existing) return { ok: false, status: 404, error: 'not-found' };

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase deleteProject error:', error.message);
        return { ok: false, status: 500, error: 'db-error', message: 'Could not delete project from database.' };
      }

      ensureLocalLoaded();
      localProjects = localProjects.filter((p) => p.id !== id);
      await atomicWriteJson(PROJECTS_FILE, TMP_PROJECTS_FILE, localProjects).catch(() => {});
      invalidateProjectsCache();
      return { ok: true, status: 200 };
    }

    ensureLocalLoaded();
    const before = localProjects.length;
    localProjects = localProjects.filter((p) => p.id !== id);
    if (localProjects.length === before) {
      return { ok: false, status: 404, error: 'not-found' };
    }
    await atomicWriteJson(PROJECTS_FILE, TMP_PROJECTS_FILE, localProjects);
    invalidateProjectsCache();
    return { ok: true, status: 200 };
  });
}

/* ----------------------------- Content CRUD -------------------------------- */

/** Content keys starting with `__` belong to the server (e.g. the seed marker). */
function isInternalContentPath(keyPath) {
  return String(keyPath || '').startsWith('__');
}

async function getContent() {
  const now = Date.now();
  if (contentCache && now - contentCacheAt < CACHE_TTL_MS) {
    return contentCache;
  }

  await migrateLegacyFilesToDatabase();

  if (supabase && hasSiteContentTable) {
    const { data, error } = await supabase
      .from('site_content')
      .select('scope, path, value');

    if (!error && Array.isArray(data)) {
      const out = { en: {}, ar: {}, site: {} };
      for (const row of data) {
        if (row && out[row.scope] && row.path && !isInternalContentPath(row.path)) {
          out[row.scope][row.path] = String(row.value ?? '');
        }
      }
      contentCache = out;
      contentCacheAt = Date.now();
      return out;
    }
    if (error) {
      hasSiteContentTable = false;
    }
  }

  ensureLocalLoaded();
  const visibleKeys = (bucket) =>
    Object.fromEntries(Object.entries(bucket).filter(([keyPath]) => !isInternalContentPath(keyPath)));
  const out = {
    en: visibleKeys(localContent.en),
    ar: visibleKeys(localContent.ar),
    site: visibleKeys(localContent.site),
  };
  contentCache = out;
  contentCacheAt = Date.now();
  return out;
}

async function setContentValue(scope, keyPath, value) {
  return runSerialized(async () => {
    await migrateLegacyFilesToDatabase();
    ensureLocalLoaded();
    if (!localContent[scope]) localContent[scope] = {};
    localContent[scope][keyPath] = value;

    if (supabase && hasSiteContentTable) {
      const { error } = await supabase
        .from('site_content')
        .upsert(
          { scope, path: keyPath, value, updated_at: new Date().toISOString() },
          { onConflict: 'scope,path' },
        );
      if (error) {
        hasSiteContentTable = false;
      }
    }

    await atomicWriteJson(CONTENT_FILE, TMP_CONTENT_FILE, localContent).catch(() => {});
    invalidateContentCache();
    return { ok: true, scope, path: keyPath, value };
  });
}

async function deleteContentValue(scope, keyPath) {
  return runSerialized(async () => {
    await migrateLegacyFilesToDatabase();
    ensureLocalLoaded();
    if (localContent[scope] && Object.prototype.hasOwnProperty.call(localContent[scope], keyPath)) {
      delete localContent[scope][keyPath];
    }

    if (supabase && hasSiteContentTable) {
      const { error } = await supabase
        .from('site_content')
        .delete()
        .eq('scope', scope)
        .eq('path', keyPath);
      if (error) {
        hasSiteContentTable = false;
      }
    }

    await atomicWriteJson(CONTENT_FILE, TMP_CONTENT_FILE, localContent).catch(() => {});
    invalidateContentCache();
    return { ok: true };
  });
}

module.exports = {
  isSupabaseConfigured,
  migrateLegacyFilesToDatabase,
  seedBuiltInProjects,
  safeHttpUrl,
  safeImageRef,
  sanitizeText,
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  enrichProjectWithMetadata,
  deleteProject,
  getContent,
  setContentValue,
  deleteContentValue,
};
