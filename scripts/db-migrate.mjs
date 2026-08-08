#!/usr/bin/env node
/**
 * Run SQL migrations using DATABASE_URL from the root .env file.
 *
 * Usage:
 *   npm run db:migrate
 *   npm run db:migrate:learning
 *   node scripts/db-migrate.mjs database/migrations/002_learning_exercises.sql
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env introuvable à la racine du projet.');
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]+)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL manquant dans .env');
  process.exit(1);
}

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      'backend/src/config/auth-schema.sql',
      'database/schema.sql',
      'database/migrations/001_user_profile_no_fake_defaults.sql',
      'database/migrations/002_learning_exercises.sql',
      'database/migrations/003_schema_alignment.sql',
    ];

console.log('✅ DATABASE_URL chargé depuis .env\n');

for (const rel of files) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Ignoré (introuvable): ${rel}`);
    continue;
  }
  console.log(`▶  psql -f ${rel}`);
  const result = spawnSync('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-f', filePath], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    console.error(`❌ Échec sur ${rel}`);
    process.exit(result.status || 1);
  }
  console.log(`   OK\n`);
}

console.log('✅ Migration terminée.');
