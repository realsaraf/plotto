'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type PlottoPreview = {
  event_id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  importance: string;
  confidence: number;
  clarifyingQuestion: string | null;
  people: { name: string; role: string | null }[];
  meetingLinks: { type: string; url: string; label: string | null }[];
  phoneNumbers: { number: string; label: string | null }[];
  conflictsWithWorkSchedule: boolean;
};

type Warning = {
  event_id: string;
  title: string;
  startsAt: string;
  kind: 'work_schedule';
};

export default function CaptureForm() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<null | {
    capture_id: string;
    plottos: PlottoPreview[];
    warnings: Warning[];
  }>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: content,
          source: 'manual',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
      } else {
        setPreview({
          capture_id: data.capture_id,
          plottos: data.plottos ?? [],
          warnings: data.warnings ?? [],
        });
        setContent('');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Dentist next Tuesday at 3pm on Main Street…"
          rows={7}
          className="w-full resize-none rounded-xl border border-ink-200 bg-white p-4 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20"
          autoFocus
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-400">
            {content.length} chars · powered by gpt-4o-mini
          </p>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="rounded-xl bg-coral-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Plotting…' : 'Plot it'}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {preview && preview.plottos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Added {preview.plottos.length}{' '}
              {preview.plottos.length === 1 ? 'plotto' : 'plottos'} to your timeline
            </div>
            <button
              onClick={() => router.push('/timeline')}
              className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-800"
            >
              See timeline →
            </button>
          </div>

          {preview.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">
                Heads up — {preview.warnings.length}{' '}
                {preview.warnings.length === 1 ? 'plotto falls' : 'plottos fall'} inside
                your work schedule:
              </p>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {preview.warnings.map((w) => (
                  <li key={w.event_id}>{w.title}</li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-amber-800">
                Saved anyway. Edit or delete from the timeline if needed.
              </p>
            </div>
          )}

          {preview.plottos.map((p) => (
            <div
              key={p.event_id}
              className="rounded-2xl border border-ink-100 bg-white p-5"
            >
              <h3 className="text-lg font-semibold text-ink-900">{p.title}</h3>
              <p className="mt-1 text-sm text-ink-600">
                {new Date(p.startsAt).toLocaleString()}
                {p.endsAt ? ` → ${new Date(p.endsAt).toLocaleString()}` : ''}
              </p>
              {p.location && (
                <p className="mt-0.5 text-sm text-ink-500">📍 {p.location}</p>
              )}
              {p.description && (
                <p className="mt-2 text-sm text-ink-600">{p.description}</p>
              )}
              {p.people.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.people.map((person) => (
                    <span
                      key={person.name}
                      className="inline-flex items-center rounded-full border border-coral-200 bg-coral-50 px-2 py-0.5 text-xs font-medium text-coral-800"
                    >
                      {person.name}
                    </span>
                  ))}
                </div>
              )}
              {(p.meetingLinks.length > 0 || p.phoneNumbers.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.meetingLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-ink-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-ink-800"
                    >
                      ↗ {link.label ?? `Join ${link.type}`}
                    </a>
                  ))}
                  {p.phoneNumbers.map((ph) => (
                    <a
                      key={ph.number}
                      href={`tel:${ph.number.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-900 hover:border-ink-300"
                    >
                      📞 {ph.label ?? ph.number}
                    </a>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-ink-400">
                Confidence: {Math.round(p.confidence * 100)}% · importance:{' '}
                {p.importance}
                {p.conflictsWithWorkSchedule && (
                  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                    in work hours
                  </span>
                )}
              </p>
              {p.clarifyingQuestion && (
                <p className="mt-2 rounded-lg bg-coral-50 p-3 text-sm text-coral-800">
                  ❓ {p.clarifyingQuestion}
                </p>
              )}
              <div className="mt-3">
                <button
                  onClick={() => router.push(`/event/${p.event_id}`)}
                  className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-900 hover:border-ink-300"
                >
                  Edit details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
