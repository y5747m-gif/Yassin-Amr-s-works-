'use strict';

/**
 * Pixelio — database schema, written in JavaScript.
 *
 * This module is the single source of truth for the Supabase database schema.
 * The schema is defined below as plain JavaScript data and rendered into
 * idempotent SQL:
 *
 *   - SCHEMA_STATEMENTS    the DDL statements, applied by scripts/migrate.js
 *   - renderSchemaSql()    the full text of supabase/schema.sql (npm run schema:sql)
 *   - applySchema(connStr) runs SCHEMA_STATEMENTS against Postgres (optional `pg`)
 *
 * Every statement is idempotent (IF NOT EXISTS / guarded policies), so applying
 * the schema more than once is always safe.
 */

const SCHEMA = {
  tables: [
    {
      name: 'projects',
      columns: [
        { name: 'id', type: 'text', primaryKey: true },
        { name: 'title', type: 'text', notNull: true, default: `'Untitled'` },
        { name: 'title_ar', type: 'text', notNull: true, default: `''` },
        { name: 'url', type: 'text', notNull: true },
        { name: 'host', type: 'text', notNull: true, default: `''` },
        { name: 'description', type: 'text', notNull: true, default: `''` },
        { name: 'description_ar', type: 'text', notNull: true, default: `''` },
        { name: 'image', type: 'text' },
        { name: 'favicon', type: 'text' },
        { name: 'category', type: 'text', notNull: true, default: `''` },
        { name: 'tag', type: 'text', notNull: true, default: `''` },
        { name: 'order', type: 'integer', notNull: true, default: '0', quoted: true },
        { name: 'visible', type: 'boolean', notNull: true, default: 'true' },
        { name: 'created_at', type: 'timestamptz', notNull: true, default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', notNull: true, default: 'now()' },
      ],
      indexes: [
        { name: 'projects_order_created_idx', on: '("order" ASC, created_at DESC)' },
        { name: 'projects_visible_idx', on: '(visible)' },
      ],
    },
    {
      name: 'site_content',
      columns: [
        { name: 'scope', type: 'text', notNull: true },
        { name: 'path', type: 'text', notNull: true },
        { name: 'value', type: 'text', notNull: true, default: `''` },
        { name: 'updated_at', type: 'timestamptz', notNull: true, default: 'now()' },
      ],
      primaryKey: ['scope', 'path'],
    },
  ],

  // Row Level Security is enabled for these tables…
  rowLevelSecurity: ['projects', 'site_content'],

  // …and these policies are created (only when they do not exist yet).
  policies: [
    {
      table: 'projects',
      name: 'Public can read visible projects',
      for: 'SELECT',
      using: 'visible = true',
    },
    {
      table: 'site_content',
      name: 'Public can read site content',
      for: 'SELECT',
      using: 'true',
    },
  ],
};

/* ------------------------------ SQL renderer ------------------------------ */

function renderColumn(column) {
  const id = column.quoted ? `"${column.name}"` : column.name;
  let def = `${id} ${column.type}`;
  if (column.primaryKey) def += ' PRIMARY KEY';
  if (column.notNull) def += ' NOT NULL';
  if (column.default !== undefined) def += ` DEFAULT ${column.default}`;
  return def;
}

function renderCreateTable(table) {
  const defs = table.columns.map(renderColumn);
  if (table.primaryKey) defs.push(`PRIMARY KEY (${table.primaryKey.join(', ')})`);
  return `CREATE TABLE IF NOT EXISTS public.${table.name} (\n  ${defs.join(',\n  ')}\n);`;
}

function renderCreateIndex(table, index) {
  return `CREATE INDEX IF NOT EXISTS ${index.name}\n  ON public.${table.name} ${index.on};`;
}

function renderEnableRowLevelSecurity(tableName) {
  return `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`;
}

function renderPolicies(policies) {
  const guards = policies
    .map(
      (policy) => `
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = '${policy.table}' AND policyname = '${policy.name}'
  ) THEN
    CREATE POLICY "${policy.name}"
      ON public.${policy.table} FOR ${policy.for}
      USING (${policy.using});
  END IF;`,
    )
    .join('\n');
  return `DO $$\nBEGIN${guards}\nEND $$;`;
}

/** Renders the whole schema into an ordered list of idempotent SQL statements. */
function buildStatements(schema = SCHEMA) {
  const statements = [];
  for (const table of schema.tables) {
    statements.push(renderCreateTable(table));
    for (const index of table.indexes || []) {
      statements.push(renderCreateIndex(table, index));
    }
  }
  for (const tableName of schema.rowLevelSecurity) {
    statements.push(renderEnableRowLevelSecurity(tableName));
  }
  statements.push(renderPolicies(schema.policies));
  return statements;
}

const SCHEMA_STATEMENTS = buildStatements();

const SQL_FILE_HEADER = `-- ============================================================================
-- Pixelio — Supabase Database Schema
--
-- GENERATED FILE — do not edit by hand.
-- Source of truth: lib/schema.js (the schema, written in JavaScript).
-- Regenerate:      npm run schema:sql
--
-- Apply the schema:
--   1. Automatic: npm run migrate  (applies lib/schema.js through SUPABASE_DB_URL)
--   2. Manual:    paste this file into the Supabase SQL Editor
--
-- Every statement is idempotent — running it more than once is safe.
-- ============================================================================`;

/** Renders the full text of supabase/schema.sql from the JavaScript definition. */
function renderSchemaSql() {
  return `${SQL_FILE_HEADER}\n\n${SCHEMA_STATEMENTS.join('\n\n')}\n`;
}

/* ---------------------------- schema application --------------------------- */

/**
 * Applies SCHEMA_STATEMENTS to a Postgres database (Supabase).
 * Requires the optional `pg` dependency and a direct connection string, e.g.:
 *   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
 */
async function applySchema(connectionString) {
  let pg = null;
  try {
    pg = require('pg');
  } catch {
    /* handled below */
  }
  if (!pg) {
    throw new Error(
      'the "pg" package is required to apply the schema — run `npm install`, ' +
        'or apply the schema manually: `npm run schema:sql` and paste ' +
        'supabase/schema.sql into the Supabase SQL Editor.',
    );
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    for (const statement of SCHEMA_STATEMENTS) {
      await client.query(statement);
    }
  } finally {
    await client.end();
  }
  return true;
}

module.exports = {
  SCHEMA,
  SCHEMA_STATEMENTS,
  buildStatements,
  renderSchemaSql,
  applySchema,
};
