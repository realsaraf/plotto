'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CheckIcon, ClockIcon, XIcon } from '@/components/icons';

type Status = 'active' | 'snoozed' | 'done' | 'cancelled';

type Action = {
  next: Status;
  label: string;
  icon: typeof CheckIcon;
  activeClass: string;
};

const ACTIONS: Action[] = [
  { next: 'done', label: 'Mark done', icon: CheckIcon, activeClass: 'bg-success text-surface' },
  { next: 'snoozed', label: 'Snooze', icon: ClockIcon, activeClass: 'bg-warn text-surface' },
  { next: 'cancelled', label: 'Cancel', icon: XIcon, activeClass: 'bg-danger text-surface' },
];

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
    const target = local === next ? 'active' : next;
    setLocal(target);
    start(async () => {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: target }),
      });
      if (!res.ok) setLocal(status);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-0.5">
      {ACTIONS.map((a) => {
        const active = local === a.next;
        const Icon = a.icon;
        return (
          <button
            key={a.next}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              update(a.next);
            }}
            disabled={pending}
            title={active ? `${a.label} (toggle off)` : a.label}
            aria-label={a.label}
            aria-pressed={active}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${
              active ? a.activeClass : 'text-fg-subtle hover:bg-surface-sunken hover:text-fg'
            } disabled:opacity-50`}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
