import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import SettingsForm, {
  DEFAULT_REMINDER_PREFERENCES,
  type ReminderPreferences,
  type WorkSchedule,
} from './settings-form';

export const metadata = { title: 'Settings · Plotto' };
export const dynamic = 'force-dynamic';

type SettingsRow = {
  email: string | null;
  work_schedule: WorkSchedule | null;
  phone: string | null;
  phone_verified: boolean | null;
  reminder_preferences: ReminderPreferences | null;
};

const defaultSchedule: WorkSchedule = {
  days: [1, 2, 3, 4, 5],
  start: '09:00',
  end: '17:00',
};

export default async function SettingsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { data, error } = await supabase
    .from('users')
    .select('email, work_schedule, phone, phone_verified, reminder_preferences')
    .eq('id', user.id)
    .maybeSingle<SettingsRow>();

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Could not load settings: {error.message}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">
          Set your default work hours, reminder preferences, and the phone number
          you&apos;ll use for future mobile reminder flows.
        </p>
      </div>

      <SettingsForm
        settings={{
          email: data?.email ?? user.email ?? '',
          workSchedule: data?.work_schedule ?? defaultSchedule,
          hasSavedWorkSchedule: Boolean(data?.work_schedule),
          phone: data?.phone ?? '',
          phoneVerified: Boolean(data?.phone_verified),
          reminderPreferences:
            data?.reminder_preferences ?? DEFAULT_REMINDER_PREFERENCES,
        }}
      />
    </div>
  );
}