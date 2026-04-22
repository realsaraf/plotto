-- Grant table privileges to Supabase's authenticated + anon roles.
-- Drizzle migrations don't do this by default, which causes
-- "permission denied for table X" even when RLS policies are set.
--
-- Row-level access is still enforced by the RLS policies in 0001.

-- users: authenticated reads/updates its own row (RLS narrows to self).
GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;

-- captures + events + reminders: full access, RLS narrows to owner rows.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.captures    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.events      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.reminders   TO authenticated;

-- No public (anon) access to app tables — the landing page doesn't read data.

-- Ensure future tables in public automatically grant to authenticated.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
