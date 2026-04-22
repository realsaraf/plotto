'use client';

import { createBrowserClient } from '@supabase/ssr';
import { publicEnv } from '../env';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function supabaseBrowser() {
  if (!client) {
    client = createBrowserClient(publicEnv.SUPABASE_URL, publicEnv.SUPABASE_ANON_KEY);
  }
  return client;
}
