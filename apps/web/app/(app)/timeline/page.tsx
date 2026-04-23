import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import type { EventRow, PersonPill } from '@/lib/types';
import TimelineList from './timeline-list';

export const metadata = { title: 'Timeline · Plotto' };
export const dynamic = 'force-dynamic';

type RawEvent = Omit<EventRow, 'people'> & {
  event_people?: { people: { id: string; name: string; color: string } | null }[] | null;
};

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string }>;
}) {
  const supabase = await supabaseServer();
  const { person: personId } = await searchParams;

  let activePerson: { id: string; name: string; color: string } | null = null;
  if (personId) {
    const { data: p } = await supabase
      .from('people')
      .select('id, name, color')
      .eq('id', personId)
      .maybeSingle();
    if (p) activePerson = p;
  }

  // INNER-join when filtering by person; LEFT-join otherwise.
  const select = personId
    ? 'id, title, description, starts_at, ends_at, location, all_day, importance, reminder_strategy, confidence, status, meeting_links, phone_numbers, event_people!inner(person_id, people!inner(id, name, color))'
    : 'id, title, description, starts_at, ends_at, location, all_day, importance, reminder_strategy, confidence, status, meeting_links, phone_numbers, event_people(people(id, name, color))';

  let query = supabase
    .from('events')
    .select(select)
    .in('status', ['active', 'snoozed', 'done'])
    .order('starts_at', { ascending: true })
    .limit(200);

  if (personId) {
    query = query.eq('event_people.person_id', personId);
  }

  const { data: events, error } = await query.returns<RawEvent[]>();

  if (error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger-soft p-5 text-sm text-danger">
        Could not load timeline: {error.message}
      </div>
    );
  }

  const all: EventRow[] = (events ?? []).map((e) => {
    const people: PersonPill[] = (e.event_people ?? [])
      .map((ep) => ep.people)
      .filter((p): p is { id: string; name: string; color: string } => p !== null)
      .map((p) => ({ id: p.id, name: p.name, color: p.color }));
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      starts_at: e.starts_at,
      ends_at: e.ends_at,
      location: e.location,
      all_day: e.all_day,
      importance: e.importance,
      reminder_strategy: e.reminder_strategy,
      confidence: e.confidence,
      status: e.status,
      meeting_links: e.meeting_links ?? [],
      phone_numbers: e.phone_numbers ?? [],
      people,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your timeline</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {activePerson
            ? `${all.length} ${all.length === 1 ? 'plotto' : 'plottos'} with ${activePerson.name}`
            : `${all.length} upcoming — ordered by what matters next.`}
        </p>
      </div>

      {activePerson && (
        <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-sm">
          <span className="text-fg-muted">Filtered by</span>
          <span className="inline-flex items-center rounded-full border border-coral-200 bg-coral-100 px-2 py-0.5 text-xs font-medium text-coral-800 dark:border-coral-900 dark:bg-coral-950 dark:text-coral-300">
            {activePerson.name}
          </span>
          <Link
            href="/timeline"
            className="ml-auto text-xs font-medium text-fg-muted hover:text-fg"
          >
            Clear filter ✕
          </Link>
        </div>
      )}

      {all.length === 0 ? <EmptyState filtered={!!activePerson} /> : <TimelineList events={all} />}
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-card/60 p-8 text-center sm:p-10">
      <div className="mx-auto mb-4 h-1.5 w-8 rounded-full bg-accent" />
      <h2 className="text-lg font-semibold text-fg">
        {filtered ? 'No plottos with this person yet' : 'Nothing plotted yet'}
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-fg-muted">
        {filtered
          ? 'Try clearing the filter, or capture something new mentioning them.'
          : 'Paste an email, describe something coming up, or drop any text — Plotto will pull out the details.'}
      </p>
      <Link
        href={filtered ? '/timeline' : '/capture'}
        className="mt-5 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg shadow-sm hover:bg-accent-strong"
      >
        {filtered ? 'Show all plottos' : 'Make your first capture'}
      </Link>
    </div>
  );
}
