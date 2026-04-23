#!/usr/bin/env tsx
/**
 * One-shot migration runner. Applies a single SQL file to SUPABASE_DB_URL.
 *
 *   pnpm --filter @plotto/db exec tsx ../../scripts/apply-sql.ts supabase/migrations/0006_reminder_preferences.sql
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import postgres from 'postgres';

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('usage: tsx scripts/apply-sql.ts <path-to-sql>');
    process.exit(1);
  }

  const connString = process.env.SUPABASE_DB_URL;
  if (!connString) {
    console.error('SUPABASE_DB_URL must be set');
    process.exit(1);
  }

  const sql = await readFile(resolve(file), 'utf8');
  const client = postgres(connString, { ssl: 'require', max: 1 });
  try {
    console.log(`Applying ${file}...`);
    await client.unsafe(sql);
    console.log('OK.');
  } catch (e) {
    console.error('FAIL:', (e as Error).message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
