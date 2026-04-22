import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '../env';

/**
 * Server Supabase client bound to Next.js cookies().
 * Use in Server Components, Route Handlers, and Server Actions.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — ignore. Middleware refreshes the
          // session cookie on every request.
        }
      },
    },
  });
}
