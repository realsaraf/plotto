import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

/**
 * Service-role Supabase client. Bypasses RLS — only use from trusted
 * server contexts (cron endpoints, internal jobs). Never import from a
 * client component.
 */
export function supabaseAdmin() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
