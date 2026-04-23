import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import type { EventRow, PersonPill } from '@/lib/types';
import EventEditor from './event-editor';
import { ActionLinks, PersonPills } from '@/components/plotto-bits';

export const dynamic = 'force-dynamic';

type RawEvent = Omit<EventRow, 'people'> & {
  event_people?: { people: { id: string; name: string; color: string } | null }[] | null;
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('events')
    .select(
      'id, title, description, starts_at, ends_at, location, all_day, importance, reminder_strategy, confidence, status, meeting_links, phone_numbers, event_people(people(id, name, color))',
    )
    .eq('id', id)
    .single<RawEvent>();
  if (error || !data) notFound();

  const people: PersonPill[] = (data.event_people ?? [])
    .map((ep) => ep.people)
    .filter((p): p is { id: string; name: string; color: string } => p !== null)
    .map((p) => ({ id: p.id, name: p.name, color: p.color }));

  const event: EventRow = {
    id: data.id,
    title: data.title,
    description: data.description,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    location: data.location,
    all_day: data.all_day,
    importance: data.importance,
    reminder_strategy: data.reminder_strategy,
    confidence: data.confidence,
    status: data.status,
    meeting_links: data.meeting_links ?? [],
    phone_numbers: data.phone_numbers ?? [],
    people,
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/timeline" className="mb-4 inline-flex text-sm text-fg-muted hover:text-fg">
        ← Back to timeline
      </Link>
      {(people.length > 0 ||
        (event.meeting_links && event.meeting_links.length > 0) ||
        (event.phone_numbers && event.phone_numbers.length > 0)) && (
        <div className="mb-4 rounded-2xl border border-line bg-card p-4">
          <PersonPills people={people} />
          <ActionLinks
            meetingLinks={event.meeting_links}
            phoneNumbers={event.phone_numbers}
          />
        </div>
      )}
      <EventEditor event={event} />
    </div>
  );
}
