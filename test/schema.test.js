'use strict';

/**
 * The database schema is written in JavaScript (lib/schema.js).
 * These tests lock the definition, the rendered SQL, the generated
 * supabase/schema.sql file, and the migration script's local mode.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const schema = require('../lib/schema.js');

const ROOT = path.join(__dirname, '..');

test('schema is defined in JavaScript: both tables with their columns', () => {
  const tables = new Map(schema.SCHEMA.tables.map((t) => [t.name, t]));
  assert.deepEqual([...tables.keys()], ['projects', 'site_content']);

  const projectCols = tables.get('projects').columns.map((c) => c.name);
  assert.deepEqual(projectCols, [
    'id', 'title', 'title_ar', 'url', 'host', 'description', 'description_ar',
    'image', 'favicon', 'category', 'tag', 'order', 'visible', 'created_at', 'updated_at',
  ]);

  const contentCols = tables.get('site_content').columns.map((c) => c.name);
  assert.deepEqual(contentCols, ['scope', 'path', 'value', 'updated_at']);
  assert.deepEqual(tables.get('site_content').primaryKey, ['scope', 'path']);
});

test('rendered statements are idempotent DDL for tables, indexes, RLS and policies', () => {
  const sql = schema.SCHEMA_STATEMENTS.join('\n');

  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.projects \(/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.site_content \(/);
  assert.match(sql, /"order" integer NOT NULL DEFAULT 0/);
  assert.match(sql, /PRIMARY KEY \(scope, path\)/);

  assert.match(sql, /CREATE INDEX IF NOT EXISTS projects_order_created_idx\n {2}ON public\.projects \("order" ASC, created_at DESC\);/);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS projects_visible_idx\n {2}ON public\.projects \(visible\);/);

  assert.equal((sql.match(/ENABLE ROW LEVEL SECURITY/g) || []).length, 2);

  assert.match(sql, /CREATE POLICY "Public can read visible projects"\n {6}ON public\.projects FOR SELECT\n {6}USING \(visible = true\);/);
  assert.match(sql, /CREATE POLICY "Public can read site content"\n {6}ON public\.site_content FOR SELECT\n {6}USING \(true\);/);
});

test('every statement is safe to run twice (idempotency guards)', () => {
  assert.ok(schema.SCHEMA_STATEMENTS.length >= 6);
  for (const statement of schema.SCHEMA_STATEMENTS) {
    if (statement.startsWith('CREATE TABLE')) assert.match(statement, /IF NOT EXISTS/);
    if (statement.startsWith('CREATE INDEX')) assert.match(statement, /IF NOT EXISTS/);
    if (statement.startsWith('DO $$')) assert.match(statement, /IF NOT EXISTS/);
  }
});

test('renderSchemaSql() matches the checked-in supabase/schema.sql', () => {
  const file = fs.readFileSync(path.join(ROOT, 'supabase', 'schema.sql'), 'utf8');
  assert.equal(file.replace(/\r\n/g, '\n'), schema.renderSchemaSql().replace(/\r\n/g, '\n'));
});

test('migrate script still runs in local mode (no Supabase configured)', () => {
  const out = execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'migrate.js')], {
    encoding: 'utf8',
    timeout: 20000,
    env: {
      ...process.env,
      SUPABASE_URL: '',
      SUPABASE_ANON_KEY: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
      SUPABASE_DB_URL: '',
    },
  });
  assert.match(out, /Schema step: skipped/);
  assert.match(out, /Migration completed \(local\)/);
});

test('applySchema() surfaces connection errors instead of failing silently', async () => {
  await assert.rejects(schema.applySchema('postgresql://127.0.0.1:1/pixelio'));
});
