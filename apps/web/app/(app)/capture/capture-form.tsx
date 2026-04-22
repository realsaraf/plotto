'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CaptureForm() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<null | {
    event: {
      title: string;
      description: string | null;
      startsAt: string;
      location: string | null;
      importance: string;
      confidence: number;
      clarifyingQuestion: string | null;
    };
    capture_id: string;
    event_id: string;
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
        setPreview(data);
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

      {preview && (
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 text-xs text-ink-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Added to your timeline
          </div>
          <h3 className="text-lg font-semibold text-ink-900">
            {preview.event.title}
          </h3>
          <p className="mt-1 text-sm text-ink-600">
            {new Date(preview.event.startsAt).toLocaleString()}
          </p>
          {preview.event.location && (
            <p className="mt-0.5 text-sm text-ink-500">📍 {preview.event.location}</p>
          )}
          {preview.event.description && (
            <p className="mt-2 text-sm text-ink-600">{preview.event.description}</p>
          )}
          <p className="mt-3 text-xs text-ink-400">
            Confidence: {Math.round(preview.event.confidence * 100)}% · importance:{' '}
            {preview.event.importance}
          </p>
          {preview.event.clarifyingQuestion && (
            <p className="mt-2 rounded-lg bg-coral-50 p-3 text-sm text-coral-800">
              ❓ {preview.event.clarifyingQuestion}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => router.push('/timeline')}
              className="rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-ink-800"
            >
              See timeline
            </button>
            <button
              onClick={() => router.push(`/event/${preview.event_id}`)}
              className="rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 hover:border-ink-300"
            >
              Edit details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
