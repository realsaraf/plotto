'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

type Status = 'active' | 'snoozed' | 'done' | 'cancelled';

export default function EventStatusControls({
  eventId,
  status,
}: {
  eventId: string;
  status: Status;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [local, setLocal] = useState<Status>(status);

  async function update(next: Status) {
    setLocal(next);
    start(async () => {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) setLocal(status);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => update(local === 'done' ? 'active' : 'done')}
        disabled={pending}
        className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
          local === 'done'
            ? 'bg-ink-900 text-white'
            : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900'
        } disabled:opacity-50`}
      >
        {local === 'done' ? '✓ Done' : 'Mark done'}
      </button>
      <button
        onClick={() => update(local === 'snoozed' ? 'active' : 'snoozed')}
        disabled={pending}
        className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
          local === 'snoozed'
            ? 'bg-coral-500 text-white'
            : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900'
        } disabled:opacity-50`}
      >
        {local === 'snoozed' ? 'Snoozed' : 'Snooze'}
      </button>
    </div>
  );
}
