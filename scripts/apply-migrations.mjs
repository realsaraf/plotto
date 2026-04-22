#!/usr/bin/env node
/**
 * Apply all SQL files in supabase/migrations/ to the Supabase database
 * in lexical order. Reads SUPABASE_DB_URL from .env.local.
 *
 * Usage (from repo root): pnpm exec tsx scripts/apply-migrations.mjs
 * Or:                     node scripts/apply-migrations.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

// Load .env.local manually (no dependency on dotenv).
const envPath = resolve(repoRoot, '.env.local');
try {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx < 0) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    if (!(k in process.env)) process.env[k] = v;
  }
} catch (err) {
  console.warn('Could not read .env.local:', err.message);
}

const dbUrl = process.env.SUPABASE_DB_URL_POOLER || process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error('SUPABASE_DB_URL / SUPABASE_DB_URL_POOLER missing from environment.');
  process.exit(1);
}

const migrationsDir = resolve(repoRoot, 'supabase/migrations');
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

console.log(`Applying ${files.length} migration(s) from ${migrationsDir}`);

const sql = postgres(dbUrl, {
  ssl: 'require',
  max: 1,
  onnotice: () => {},
});

try {
  // Create a tiny ledger so we never re-run a migration.
  await sql.unsafe(`
    create schema if not exists plotto_meta;
    create table if not exists plotto_meta.schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  for (const file of files) {
    const already = await sql`
      select 1 from plotto_meta.schema_migrations where filename = ${file}
    `;
    if (already.length > 0) {
      console.log(`  = ${file} (already applied)`);
      continue;
    }
    const path = join(migrationsDir, file);
    const contents = readFileSync(path, 'utf8');
    // drizzle-kit uses `--> statement-breakpoint` as a delimiter.
    const statements = contents
      .split(/-->\s*statement-breakpoint/)
      .map((s) => s.trim())
      .filter(Boolean);
    console.log(`  + ${file} (${statements.length} statement block(s))`);
    await sql.begin(async (tx) => {
      for (const stmt of statements) {
        await tx.unsafe(stmt);
      }
      await tx`
        insert into plotto_meta.schema_migrations (filename) values (${file})
      `;
    });
  }

  console.log('All migrations applied.');
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
