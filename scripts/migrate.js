#!/usr/bin/env node
'use strict';

/**
 * Pixelio — Safe Data Migration Script (scripts/migrate.js)
 *
 *  0. Applies the database schema from lib/schema.js (the schema, written in
 *     JavaScript) when Supabase is configured and SUPABASE_DB_URL is set.
 *  1. Preserves existing data/projects.json and data/content.json files.
 *  2. Creates safe backups (data/projects.backup.json & data/content.backup.json).
 *  3. Migrates all projects and site content overrides into Supabase Database
 *     (preserving IDs, URLs, titles, descriptions, images, categories, order,
 *     visibility, and timestamps).
 *
 * Usage:
 *   npm run migrate
 *   # or: node scripts/migrate.js
 */

const fs = require('node:fs');
const path = require('node:path');
const db = require('../lib/db.js');
const schema = require('../lib/schema.js');

/**
 * Direct Postgres connection string used to apply the JavaScript schema.
 * Example: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
 */
function getSchemaConnectionString() {
  return String(
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    '',
  ).trim();
}

/**
 * Makes sure the database schema exists before any data is migrated.
 * The schema itself lives in lib/schema.js — plain JavaScript.
 */
async function ensureDatabaseSchema() {
  if (!db.isSupabaseConfigured()) {
    console.log('Schema step: skipped (Supabase is not configured — local storage mode).');
    return { applied: false, mode: 'local' };
  }

  const connectionString = getSchemaConnectionString();
  if (!connectionString) {
    console.warn('Schema step: skipped (no SUPABASE_DB_URL set).');
    console.warn('  → Set SUPABASE_DB_URL to apply lib/schema.js automatically, or');
    console.warn('    run `npm run schema:sql` and paste supabase/schema.sql into the Supabase SQL Editor.');
    return { applied: false, mode: 'manual' };
  }

  try {
    await schema.applySchema(connectionString);
    return { applied: true, mode: 'supabase' };
  } catch (err) {
    throw new Error(`Could not apply the database schema (lib/schema.js): ${err.message}`);
  }
}

async function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const projectsPath = path.join(dataDir, 'projects.json');
  const contentPath = path.join(dataDir, 'content.json');

  console.log('--- Pixelio Data Migration ---');
  console.log(
    'Storage mode:',
    db.isSupabaseConfigured()
      ? 'Supabase Database (SUPABASE_URL configured)'
      : 'Local Persistent Storage (set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY for Supabase)',
  );

  // Step 0: make sure the database schema exists (defined in JavaScript: lib/schema.js)
  const schemaStep = await ensureDatabaseSchema();
  if (schemaStep.applied) {
    console.log('Database schema applied/verified from lib/schema.js.');
  }

  if (fs.existsSync(projectsPath)) {
    console.log(`Found existing file: ${projectsPath}`);
  }
  if (fs.existsSync(contentPath)) {
    console.log(`Found existing file: ${contentPath}`);
  }

  const result = await db.migrateLegacyFilesToDatabase();
  const currentProjects = await db.listProjects({ includeHidden: true });

  console.log(`Migration completed (${result.mode}).`);
  console.log(`- Projects migrated/verified: ${result.migratedProjects} (total in DB: ${currentProjects.length})`);
  console.log(`- Content overrides migrated/verified: ${result.migratedContentKeys}`);
  console.log('Original JSON files and .backup.json copies have been safely preserved.');
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
