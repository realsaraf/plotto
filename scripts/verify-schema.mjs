#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue;
  const i = line.indexOf('=');
  if (i > 0) process.env[line.slice(0, i).trim()] ||= line.slice(i + 1).trim();
}
const sql = postgres(process.env.SUPABASE_DB_URL_POOLER, { ssl: 'require', max: 1, onnotice: () => {} });
try {
  const tables = await sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`;
  const policies = await sql`select tablename, policyname from pg_policies where schemaname = 'public' order by tablename`;
  const triggers = await sql`select event_object_table as tbl, trigger_name from information_schema.triggers where trigger_schema = 'public' order by 1,2`;
  console.log('TABLES:', tables.map(t => t.table_name));
  console.log('POLICIES:', policies.map(p => `${p.tablename}.${p.policyname}`));
  console.log('TRIGGERS:', triggers.map(t => `${t.tbl}.${t.trigger_name}`));
} finally {
  await sql.end();
}
