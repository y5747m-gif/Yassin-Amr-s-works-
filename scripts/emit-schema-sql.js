#!/usr/bin/env node
'use strict';

/**
 * Pixelio — regenerate supabase/schema.sql from the JavaScript schema definition.
 *
 *   npm run schema:sql
 *
 * lib/schema.js is the source of truth; the .sql file is a generated reference
 * (paste it into the Supabase SQL Editor when you prefer applying it by hand).
 */

const fs = require('node:fs');
const path = require('node:path');
const { renderSchemaSql } = require('../lib/schema.js');

const target = path.join(__dirname, '..', 'supabase', 'schema.sql');
const sql = renderSchemaSql();
fs.writeFileSync(target, sql, 'utf8');
console.log(`Wrote supabase/schema.sql (${Buffer.byteLength(sql)} bytes) from lib/schema.js`);
