/**
 * Work-schedule conflict checker.
 * User's schedule: { days: number[] (1=Mon..7=Sun), start: "HH:MM", end: "HH:MM" } in their local TZ.
 * A plotto "conflicts" when its starts_at (in user TZ) falls inside [start, end]
 * on one of the work days.
 */
export type WorkSchedule = {
  days: number[];
  start: string; // "HH:MM"
  end: string; // "HH:MM"
};

function minutesInTz(iso: string, timeZone: string): { weekdayIso: number; minutes: number } {
  // Render the instant in the user's TZ, then parse back.
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = fmt.formatToParts(new Date(iso));
  const weekdayStr = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  const weekdayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return {
    weekdayIso: weekdayMap[weekdayStr] ?? 1,
    minutes: hour * 60 + minute,
  };
}

function parseHM(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function conflictsWithSchedule(
  startsAtIso: string,
  timezone: string,
  schedule: WorkSchedule | null | undefined,
): boolean {
  if (!schedule || !Array.isArray(schedule.days) || schedule.days.length === 0) {
    return false;
  }
  try {
    const { weekdayIso, minutes } = minutesInTz(startsAtIso, timezone);
    if (!schedule.days.includes(weekdayIso)) return false;
    const s = parseHM(schedule.start);
    const e = parseHM(schedule.end);
    return minutes >= s && minutes < e;
  } catch {
    return false;
  }
}

export function normalizePersonName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Deterministic 8-color picker so the same person keeps the same pill color.
const PERSON_COLORS = [
  'coral',
  'amber',
  'emerald',
  'sky',
  'violet',
  'rose',
  'teal',
  'indigo',
] as const;

export function colorForName(normalized: string): (typeof PERSON_COLORS)[number] {
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return PERSON_COLORS[hash % PERSON_COLORS.length]!;
}
