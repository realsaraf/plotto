'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { EventRow } from '@/lib/types';

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventEditor({ event }: { event: EventRow }) {
  const router = useRouter();
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? '');
  const [startsLocal, setStartsLocal] = useState(toLocalInput(event.starts_at));
  const [endsLocal, setEndsLocal] = useState(toLocalInput(event.ends_at));
  const [location, setLocation] = useState(event.location ?? '');
  const [allDay, setAllDay] = useState(event.all_day);
  const [importance, setImportance] = useState(event.importance);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    const body = {
      title,
      description: description || null,
      starts_at: new Date(startsLocal).toISOString(),
      ends_at: endsLocal ? new Date(endsLocal).toISOString() : null,
      location: location || null,
      all_day: allDay,
      importance,
    };
    const res = await fetch(`/api/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setErr(data.error || 'Failed to save');
    } else {
      router.push('/timeline');
      router.refresh();
    }
  }

  async function del() {
    if (!confirm('Delete this event?')) return;
    setDeleting(true);
    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
    setDeleting(false);
    if (!res.ok) {
      const data = await res.json();
      setErr(data.error || 'Failed to delete');
    } else {
      router.push('/timeline');
      router.refresh();
    }
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6">
      <h1 className="mb-5 text-xl font-semibold tracking-tight">Edit plotto</h1>
      <div className="space-y-4">
        <Field label="Title">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Description">
          <textarea
            className="input min-h-[70px] resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starts">
            <input
              type="datetime-local"
              className="input"
              value={startsLocal}
              onChange={(e) => setStartsLocal(e.target.value)}
            />
          </Field>
          <Field label="Ends (optional)">
            <input
              type="datetime-local"
              className="input"
              value={endsLocal}
              onChange={(e) => setEndsLocal(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Location">
          <input
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-ink-300 text-coral-500 focus:ring-coral-500"
            />
            All day
          </label>
          <Field label="Importance">
            <select
              className="input"
              value={importance}
              onChange={(e) => setImportance(e.target.value as EventRow['importance'])}
            >
              <option value="ambient">Ambient · just know</option>
              <option value="soft_block">Soft · standard nudge</option>
              <option value="hard_block">Hard · critical</option>
            </select>
          </Field>
        </div>

        {err && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {err}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={del}
            disabled={deleting || saving}
            className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-600 hover:text-ink-900"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || deleting}
              className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-semibold text-white hover:bg-coral-600 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-500">
        {label}
      </label>
      {children}
    </div>
  );
}
