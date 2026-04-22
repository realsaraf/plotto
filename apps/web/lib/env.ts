/**
 * Runtime env for the web app.
 * Throws fast at boot if a required key is missing.
 */
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}
function optional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export const env = {
  SUPABASE_URL: required('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: optional('SUPABASE_SERVICE_ROLE_KEY'),
  OPENAI_API_KEY: optional('OPENAI_API_KEY'),
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  LANGFUSE_PUBLIC_KEY: optional('LANGFUSE_PUBLIC_KEY'),
  LANGFUSE_SECRET_KEY: optional('LANGFUSE_SECRET_KEY'),
  LANGFUSE_HOST: process.env.LANGFUSE_HOST || 'https://us.cloud.langfuse.com',
  POSTHOG_KEY: optional('NEXT_PUBLIC_POSTHOG_KEY'),
  POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  SENTRY_DSN: optional('NEXT_PUBLIC_SENTRY_DSN'),
};

export const publicEnv = {
  SUPABASE_URL: env.SUPABASE_URL,
  SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
  POSTHOG_KEY: env.POSTHOG_KEY,
  POSTHOG_HOST: env.POSTHOG_HOST,
  SENTRY_DSN: env.SENTRY_DSN,
};
