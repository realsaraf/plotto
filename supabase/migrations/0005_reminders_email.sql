-- 0005: enable email reminder delivery for hard_block plottos.
--
-- - Add 'email' to the reminder channel enum.
-- - Unique index so a single event never gets emailed twice for the same channel.
-- - Optional: pg_cron + pg_net schedule that pings the web app every minute.
--   This block is commented out by default — un-comment in the Supabase SQL
--   editor after setting `app.cron_secret` and `app.web_url` GUCs (or paste
--   the literal values inline).

-- ── enum ─────────────────────────────────────────────────────────────────
ALTER TYPE plotto_reminder_channel ADD VALUE IF NOT EXISTS 'email';

-- ── dedupe ───────────────────────────────────────────────────────────────
-- Prevents the cron worker from inserting two email reminders for the same
-- event even if it races with itself.
CREATE UNIQUE INDEX IF NOT EXISTS reminders_event_channel_unique
  ON public.reminders(event_id, channel);

-- ── grants ───────────────────────────────────────────────────────────────
-- service_role already has full access; authenticated only needs read for
-- showing reminder status in UI (future). No new grants required here.

-- ── pg_cron schedule (optional — needs Supabase Pro or self-managed) ─────
-- Uncomment + edit after setting Supabase secrets, then run once:
--
-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;
--
-- select
--   cron.schedule(
--     'plotto-email-reminders',
--     '* * * * *',
--     $$
--     select net.http_post(
--       url     := current_setting('app.web_url') || '/api/cron/reminders',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer ' || current_setting('app.cron_secret')
--       ),
--       body    := '{}'::jsonb,
--       timeout_milliseconds := 8000
--     );
--     $$
--   );
