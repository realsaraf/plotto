import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export const metadata = { title: 'People · Plotto' };
export const dynamic = 'force-dynamic';

const PILL_TONES: Record<string, string> = {
  coral: 'bg-coral-100 text-coral-800 border-coral-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  sky: 'bg-sky-100 text-sky-800 border-sky-200',
  violet: 'bg-violet-100 text-violet-800 border-violet-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

type PersonRow = {
  id: string;
  name: string;
  color: string;
  notes: string | null;
  event_people: { event_id: string }[] | null;
};

export default async function PeoplePage() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('people')
    .select('id, name, color, notes, event_people(event_id)')
    .order('name', { ascending: true })
    .returns<PersonRow[]>();

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Could not load people: {error.message}
      </div>
    );
  }

  const people = (data ?? []).map((p) => ({
    ...p,
    count: p.event_people?.length ?? 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">People</h1>
        <p className="mt-1 text-sm text-ink-500">
          Everyone Plotto has noticed in your captures. Tap a name to filter your timeline.
        </p>
      </div>

      {people.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
          <h2 className="text-lg font-semibold text-ink-900">No people yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
            Mention someone by name in a capture (e.g. &ldquo;coffee with Sarah Tuesday&rdquo;)
            and they&rsquo;ll appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {people.map((p) => (
            <Link
              key={p.id}
              href={`/timeline?person=${p.id}`}
              className="flex items-center justify-between rounded-xl border border-ink-100 bg-white p-3 transition hover:border-ink-200"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                    PILL_TONES[p.color] ?? PILL_TONES.coral
                  }`}
                >
                  {p.name}
                </span>
                {p.notes && (
                  <span className="truncate text-xs text-ink-500">{p.notes}</span>
                )}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-ink-500">
                {p.count} {p.count === 1 ? 'plotto' : 'plottos'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
