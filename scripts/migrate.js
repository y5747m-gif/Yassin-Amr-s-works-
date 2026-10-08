#!/usr/bin/env node
'use strict';

/**
 * Pixelio — Safe Data Migration Script (scripts/migrate.js)
 *
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
