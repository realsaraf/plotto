import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: '../../supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL ?? '',
  },
  strict: true,
  verbose: true,
} satisfies Config;
