-- 0006: per-importance reminder channel preferences.
--
-- Previously the users table had a single boolean `email_reminders_enabled` that
-- gated email reminders for hard_block plottos only. Now the user can pick any
-- combination of push / email / sms for each importance level (ambient,
-- soft_block, hard_block).
--
-- We add a JSONB column with a sensible default and backfill from the old
-- boolean. The old column is retained for safety — nothing writes to it any
-- more but we don't drop it in this migration.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS reminder_preferences jsonb NOT NULL DEFAULT jsonb_build_object(
    'ambient',    jsonb_build_object('push', false, 'email', false, 'sms', false),
    'soft_block', jsonb_build_object('push', true,  'email', false, 'sms', false),
    'hard_block', jsonb_build_object('push', true,  'email', true,  'sms', false)
  );

-- Preserve the previous "email on for hard_block" intent when the user had
-- explicitly turned it off.
UPDATE public.users
SET reminder_preferences = jsonb_set(
      reminder_preferences,
      '{hard_block,email}',
      to_jsonb(COALESCE(email_reminders_enabled, true))
    )
WHERE email_reminders_enabled IS NOT NULL;
