'use client';

import Link from 'next/link';
import type { MeetingLink, PersonPill, PhoneNumber } from '@/lib/types';
import { PhoneIcon, VideoIcon } from './icons';

const PILL_TONES: Record<string, string> = {
  coral: 'bg-coral-100 text-coral-800 border-coral-200 hover:bg-coral-200 dark:bg-coral-950 dark:text-coral-300 dark:border-coral-900 dark:hover:bg-coral-900',
  amber: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900 dark:hover:bg-amber-900',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 dark:hover:bg-emerald-900',
  sky: 'bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900 dark:hover:bg-sky-900',
  violet: 'bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900 dark:hover:bg-violet-900',
  rose: 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900 dark:hover:bg-rose-900',
  teal: 'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-900 dark:hover:bg-teal-900',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-900 dark:hover:bg-indigo-900',
};

export function PersonPills({
  people,
  linkable = true,
}: {
  people: PersonPill[] | null | undefined;
  linkable?: boolean;
}) {
  if (!people || people.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {people.map((p) => {
        const className = `inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium transition ${
          PILL_TONES[p.color] ?? PILL_TONES.coral
        }`;
        if (!linkable) {
          return (
            <span key={p.id} className={className}>
              {p.name}
            </span>
          );
        }
        return (
          <Link
            key={p.id}
            href={`/timeline?person=${p.id}`}
            className={className}
            onClick={(e) => e.stopPropagation()}
          >
            {p.name}
          </Link>
        );
      })}
    </div>
  );
}

function linkLabel(link: MeetingLink): string {
  if (link.label) return link.label;
  switch (link.type) {
    case 'zoom':
      return 'Zoom';
    case 'meet':
      return 'Meet';
    case 'teams':
      return 'Teams';
    case 'webex':
      return 'Webex';
    case 'phone':
      return 'Dial in';
    default:
      return 'Open link';
  }
}

export function ActionLinks({
  meetingLinks,
  phoneNumbers,
  compact = false,
}: {
  meetingLinks: MeetingLink[] | null | undefined;
  phoneNumbers: PhoneNumber[] | null | undefined;
  compact?: boolean;
}) {
  const hasMeet = meetingLinks && meetingLinks.length > 0;
  const hasPhone = phoneNumbers && phoneNumbers.length > 0;
  if (!hasMeet && !hasPhone) return null;
  const sizing = compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <div className="flex flex-wrap gap-1">
      {hasMeet &&
        meetingLinks!.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 rounded-md bg-fg ${sizing} font-medium text-surface hover:opacity-90`}
            onClick={(e) => e.stopPropagation()}
          >
            <VideoIcon size={12} /> {linkLabel(link)}
          </a>
        ))}
      {hasPhone &&
        phoneNumbers!.map((p) => (
          <a
            key={p.number}
            href={`tel:${p.number.replace(/\s+/g, '')}`}
            className={`inline-flex items-center gap-1 rounded-md border border-line bg-card ${sizing} font-medium text-fg hover:border-line-strong`}
            onClick={(e) => e.stopPropagation()}
          >
            <PhoneIcon size={12} /> {p.label ?? p.number}
          </a>
        ))}
    </div>
  );
}
