import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Reminder delivery worker.
 *
 * Triggered every minute (Vercel Cron or Supabase pg_cron). Finds any
 * `hard_block` plotto starting in the next ~5 minutes for users who have
 * `email_reminders_enabled = true`, sends an email via Resend, and writes
 * a `reminders` row so we never double-send.
 *
 * Auth: Bearer ${CRON_SECRET}.
 */
export async function POST(req: NextRequest) {
  return run(req);
}
export async function GET(req: NextRequest) {
  return run(req);
}

type EventRow = {
  id: string;
  user_id: string;
  title: string;
  starts_at: string;
  location: string | null;
  meeting_links: { type: string; url: string; label: string | null }[] | null;
  importance: string;
  status: string;
};

async function run(req: NextRequest) {
  if (!env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const admin = supabaseAdmin();

  // Window: send when starts_at is between now+1m and now+6m. Cron runs every
  // minute, so a plotto starting in exactly 5 min lands once. We also pick up
  // any that the cron may have missed in the prior minute.
  const now = new Date();
  const windowStart = new Date(now.getTime() + 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() + 6 * 60 * 1000).toISOString();

  const { data: candidates, error } = await admin
    .from('events')
    .select('id, user_id, title, starts_at, location, meeting_links, importance, status')
    .eq('importance', 'hard_block')
    .eq('status', 'active')
    .gte('starts_at', windowStart)
    .lte('starts_at', windowEnd)
    .returns<EventRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ checked: 0, sent: 0 });
  }

  // Filter out events that already have an 'email' reminder row.
  const ids = candidates.map((e) => e.id);
  const { data: existing } = await admin
    .from('reminders')
    .select('event_id')
    .eq('channel', 'email')
    .in('event_id', ids);
  const alreadySent = new Set((existing ?? []).map((r: { event_id: string }) => r.event_id));
  const todo = candidates.filter((e) => !alreadySent.has(e.id));
  if (todo.length === 0) {
    return NextResponse.json({ checked: candidates.length, sent: 0 });
  }

  // Load matching users (only those with email reminders enabled).
  const userIds = Array.from(new Set(todo.map((e) => e.user_id)));
  const { data: users } = await admin
    .from('users')
    .select('id, email, timezone, email_reminders_enabled')
    .in('id', userIds);
  const userById = new Map(
    (users ?? []).map((u: { id: string; email: string; timezone: string; email_reminders_enabled: boolean }) => [u.id, u]),
  );

  let sent = 0;
  const errors: string[] = [];

  for (const ev of todo) {
    const u = userById.get(ev.user_id);
    if (!u || !u.email_reminders_enabled || !u.email) continue;

    try {
      await sendReminderEmail({
        toEmail: u.email,
        timezone: u.timezone || 'UTC',
        event: ev,
      });
      // Write reminder row (best-effort dedupe via unique index).
      const { error: insErr } = await admin.from('reminders').insert({
        event_id: ev.id,
        fires_at: new Date(new Date(ev.starts_at).getTime() - 5 * 60 * 1000).toISOString(),
        channel: 'email',
        fired: true,
      });
      if (insErr && !insErr.message.includes('duplicate key')) {
        errors.push(`${ev.id}: ${insErr.message}`);
      }
      sent++;
    } catch (e) {
      errors.push(`${ev.id}: ${(e as Error).message}`);
    }
  }

  return NextResponse.json({
    checked: candidates.length,
    candidates: todo.length,
    sent,
    errors,
  });
}

async function sendReminderEmail(args: {
  toEmail: string;
  timezone: string;
  event: EventRow;
}) {
  const { toEmail, timezone, event } = args;
  const startsAt = new Date(event.starts_at);
  const timeLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(startsAt);

  const join = event.meeting_links?.find((l) => l.type !== 'phone');
  const eventUrl = `${env.APP_URL}/event/${event.id}`;
  const settingsUrl = `${env.APP_URL}/settings`;

  const subject = `Starts at ${timeLabel} — ${event.title}`;
  const text = [
    `${event.title}`,
    `Starts at ${timeLabel}${event.location ? ` · ${event.location}` : ''}`,
    join ? `Join: ${join.url}` : '',
    '',
    `Open in Plotto: ${eventUrl}`,
    `Reminder settings: ${settingsUrl}`,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a1a">
      <div style="display:inline-block;height:6px;width:32px;border-radius:9999px;background:#ff5a3c;margin-bottom:16px"></div>
      <h1 style="font-size:20px;margin:0 0 8px;font-weight:600">${escapeHtml(event.title)}</h1>
      <p style="margin:0 0 4px;color:#525252">Starts at <strong>${timeLabel}</strong>${
        event.location ? ` · ${escapeHtml(event.location)}` : ''
      }</p>
      ${
        join
          ? `<p style="margin:16px 0"><a href="${join.url}" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600">↗ ${escapeHtml(join.label || `Join ${join.type}`)}</a></p>`
          : ''
      }
      <p style="margin:24px 0 4px"><a href="${eventUrl}" style="color:#ff5a3c;text-decoration:none;font-weight:500">Open in Plotto →</a></p>
      <p style="margin:24px 0 0;color:#9a9a9a;font-size:12px">You're getting this because you turned on email reminders for hard plottos. <a href="${settingsUrl}" style="color:#9a9a9a">Manage settings</a>.</p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.REMINDER_FROM_EMAIL,
      to: [toEmail],
      subject,
      text,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
