import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import type { EventRow } from '@/lib/types';
import EventEditor from './event-editor';

export const dynamic = 'force-dynamic';

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
      'id, title, description, starts_at, ends_at, location, all_day, importance, reminder_strategy, confidence, status',
    )
    .eq('id', id)
    .single<EventRow>();
  if (error || !data) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/timeline" className="mb-4 inline-flex text-sm text-ink-500 hover:text-ink-900">
        ← Back to timeline
      </Link>
      <EventEditor event={data} />
    </div>
  );
}
