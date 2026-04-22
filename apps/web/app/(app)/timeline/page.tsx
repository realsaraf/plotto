import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { groupEventsByBucket, formatEventWhen } from '@/lib/timeline';
import type { EventRow } from '@/lib/types';
import EventStatusControls from './event-status-controls';

export const metadata = { title: 'Timeline · Plotto' };
export const dynamic = 'force-dynamic';

export default async function TimelinePage() {
  const supabase = await supabaseServer();
  const { data: events, error } = await supabase
    .from('events')
    .select(
      'id, title, description, starts_at, ends_at, location, all_day, importance, reminder_strategy, confidence, status',
    )
    .in('status', ['active', 'snoozed'])
    .order('starts_at', { ascending: true })
    .limit(200)
    .returns<EventRow[]>();

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Could not load timeline: {error.message}
      </div>
    );
  }

  const grouped = groupEventsByBucket(events ?? []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your timeline</h1>
          <p className="mt-1 text-sm text-ink-500">
            {events?.length ?? 0} upcoming — ordered by what matters next.
          </p>
        </div>
        <Link
          href="/capture"
          className="rounded-xl bg-coral-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-coral-600"
        >
          + New capture
        </Link>
      </div>

      {events && events.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <Bucket title="Today" items={grouped.today} />
          <Bucket title="This week" items={grouped.thisWeek} />
          <Bucket title="Upcoming" items={grouped.upcoming} />
        </div>
      )}

      {grouped.past.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
            Past (still active)
          </h2>
          <div className="space-y-2">
            {grouped.past.map((e) => (
              <EventCard key={e.id} event={e} muted />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Bucket({ title, items }: { title: string; items: EventRow[] }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
        {title}
      </h2>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-200 bg-white/50 p-4 text-center text-xs text-ink-400">
          Nothing here.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </section>
  );
}

function EventCard({ event, muted = false }: { event: EventRow; muted?: boolean }) {
  const accent =
    event.importance === 'hard_block'
      ? 'bg-coral-500'
      : event.importance === 'soft_block'
        ? 'bg-coral-300'
        : 'bg-ink-200';
  return (
    <div
      className={`group rounded-xl border border-ink-100 bg-white p-4 transition hover:border-ink-200 ${muted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${accent}`} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-ink-900">{event.title}</h3>
            <span className="shrink-0 text-xs tabular-nums text-ink-500">
              {formatEventWhen(event)}
            </span>
          </div>
          {event.location && (
            <p className="mt-0.5 text-xs text-ink-500">📍 {event.location}</p>
          )}
          {event.description && (
            <p className="mt-1.5 text-sm text-ink-600">{event.description}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <Link
              href={`/event/${event.id}`}
              className="text-xs font-medium text-ink-500 hover:text-coral-600"
            >
              Edit →
            </Link>
            <EventStatusControls eventId={event.id} status={event.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
      <div className="mx-auto mb-4 h-1.5 w-8 rounded-full bg-coral-500" />
      <h2 className="text-lg font-semibold text-ink-900">Nothing plotted yet</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
        Paste an email, describe an appointment, or drop any text — Plotto
        will pull out the details.
      </p>
      <Link
        href="/capture"
        className="mt-5 inline-flex rounded-xl bg-coral-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-coral-600"
      >
        Make your first capture
      </Link>
    </div>
  );
}
