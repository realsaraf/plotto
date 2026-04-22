import { format, isToday, isTomorrow, isThisWeek, isPast, isThisYear } from 'date-fns';
import type { EventRow } from './types';

export function formatEventWhen(event: Pick<EventRow, 'starts_at' | 'all_day' | 'ends_at'>): string {
  const d = new Date(event.starts_at);
  if (isToday(d)) {
    return event.all_day ? 'Today' : `Today · ${format(d, 'h:mm a')}`;
  }
  if (isTomorrow(d)) {
    return event.all_day ? 'Tomorrow' : `Tom · ${format(d, 'h:mm a')}`;
  }
  if (isThisWeek(d, { weekStartsOn: 1 })) {
    return event.all_day ? format(d, 'EEE') : format(d, 'EEE h:mm a');
  }
  if (isThisYear(d)) {
    return event.all_day ? format(d, 'MMM d') : format(d, 'MMM d · h:mm a');
  }
  return format(d, 'MMM d, yyyy');
}

export function groupEventsByBucket(events: EventRow[]) {
  const today: EventRow[] = [];
  const thisWeek: EventRow[] = [];
  const upcoming: EventRow[] = [];
  const past: EventRow[] = [];

  for (const e of events) {
    const d = new Date(e.starts_at);
    if (isPast(d) && !isToday(d)) past.push(e);
    else if (isToday(d)) today.push(e);
    else if (isThisWeek(d, { weekStartsOn: 1 })) thisWeek.push(e);
    else upcoming.push(e);
  }
  return { today, thisWeek, upcoming, past };
}
