import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const TimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:MM');

const WorkScheduleSchema = z
  .object({
    days: z.array(z.number().int().min(1).max(7)).max(7),
    start: TimeSchema,
    end: TimeSchema,
  })
  .refine((value) => value.start < value.end, {
    message: 'Work schedule end must be after start',
    path: ['end'],
  });

const PatchSchema = z.object({
  workSchedule: WorkScheduleSchema.nullable().optional(),
  emailRemindersEnabled: z.boolean().optional(),
});

function normalizeDays(days: number[]) {
  return Array.from(new Set(days)).sort((left, right) => left - right);
}

export async function PATCH(req: NextRequest) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let patch;
  try {
    patch = PatchSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'empty patch' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};

  if (Object.prototype.hasOwnProperty.call(patch, 'workSchedule')) {
    const normalized = patch.workSchedule
      ? normalizeDays(patch.workSchedule.days)
      : [];
    update.work_schedule = normalized.length
      ? {
          days: normalized,
          start: patch.workSchedule?.start,
          end: patch.workSchedule?.end,
        }
      : null;
  }

  if (Object.prototype.hasOwnProperty.call(patch, 'emailRemindersEnabled')) {
    update.email_reminders_enabled = patch.emailRemindersEnabled;
  }

  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('id', user.id)
    .select('work_schedule, email_reminders_enabled')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, settings: data });
}