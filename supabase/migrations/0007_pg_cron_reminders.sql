-- 0007_pg_cron_reminders.sql
--
-- Moves the reminder cron from Vercel (Hobby plan = 1/day) to Supabase
-- `pg_cron` + `pg_net` so it fires every minute at no extra cost.
--
-- Requires two database-level settings to be configured *once* (after deploy):
--
--   alter database postgres set app.cron_target_url = 'https://app.getplotto.com/api/cron/reminders';
--   alter database postgres set app.cron_secret     = '<same value as CRON_SECRET env var>';
--
-- After setting them, reconnect (or run `reload` on the cron worker) and the
-- scheduled job below will start firing.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net  with schema extensions;

-- Idempotent: drop any prior version of this job before re-scheduling.
do $$
declare
  j record;
begin
  for j in select jobid from cron.job where jobname = 'plotto-reminders' loop
    perform cron.unschedule(j.jobid);
  end loop;
end $$;

-- Every minute, POST to the Next.js reminder worker with the shared secret.
-- The target URL + secret are read from database settings so this migration
-- is identical across staging and production.
select
  cron.schedule(
    'plotto-reminders',
    '* * * * *',
    $cron$
    select
      net.http_post(
        url := current_setting('app.cron_target_url', true),
        headers := jsonb_build_object(
          'Authorization',
          'Bearer ' || current_setting('app.cron_secret', true),
          'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 30000
      );
    $cron$
  );

-- Useful inspection queries (not executed — just kept as comments):
--
--   select * from cron.job;                    -- what's scheduled
--   select * from cron.job_run_details         -- last 100 runs + exit status
--     order by start_time desc limit 20;
--   select * from net._http_response            -- actual HTTP responses
--     order by created desc limit 20;
