'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

export type WorkSchedule = {
  days: number[];
  start: string;
  end: string;
};

export type Importance = 'ambient' | 'soft_block' | 'hard_block';
export type Channel = 'push' | 'email' | 'sms';
export type ReminderPreferences = Record<Importance, Record<Channel, boolean>>;

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  ambient:    { push: false, email: false, sms: false },
  soft_block: { push: true,  email: false, sms: false },
  hard_block: { push: true,  email: true,  sms: false },
};

type SettingsFormProps = {
  settings: {
    email: string;
    workSchedule: WorkSchedule;
    hasSavedWorkSchedule: boolean;
    phone: string;
    phoneVerified: boolean;
    reminderPreferences: ReminderPreferences;
  };
};

const IMPORTANCE_ROWS: { key: Importance; label: string; sublabel: string }[] = [
  { key: 'hard_block', label: 'Hard plotto',   sublabel: 'Must not miss — meetings, appointments, deadlines.' },
  { key: 'soft_block', label: 'Medium plotto', sublabel: 'Prefers your attention but schedulable around.' },
  { key: 'ambient',    label: 'Soft plotto',   sublabel: 'Loose context — nice to know, no strict time.' },
];

const CHANNEL_COLS: { key: Channel; label: string; hint: string }[] = [
  { key: 'push',  label: 'Push',  hint: 'Mobile / browser notification' },
  { key: 'email', label: 'Email', hint: 'Sent 5 min before' },
  { key: 'sms',   label: 'SMS',   hint: 'Text message to your phone' },
];

const dayOptions = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [scheduleEnabled, setScheduleEnabled] = useState(
    settings.hasSavedWorkSchedule,
  );
  const [days, setDays] = useState<number[]>(settings.workSchedule.days);
  const [start, setStart] = useState(settings.workSchedule.start);
  const [end, setEnd] = useState(settings.workSchedule.end);
  const [reminderPreferences, setReminderPreferences] = useState<ReminderPreferences>(
    settings.reminderPreferences,
  );

  function toggleChannel(importance: Importance, channel: Channel) {
    setReminderPreferences((current) => ({
      ...current,
      [importance]: {
        ...current[importance],
        [channel]: !current[importance][channel],
      },
    }));
  }
  const [phone, setPhone] = useState(settings.phone);
  const [phoneVerified, setPhoneVerified] = useState(settings.phoneVerified);
  const [code, setCode] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  function toggleDay(day: number) {
    setDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day].sort((left, right) => left - right),
    );
  }

  async function saveSettings() {
    setSavingSettings(true);
    setError(null);
    setStatus(null);

    if (scheduleEnabled && days.length === 0) {
      setSavingSettings(false);
      setError('Choose at least one work day or switch the schedule off.');
      return;
    }

    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workSchedule: scheduleEnabled ? { days, start, end } : null,
        reminderPreferences,
      }),
    });

    const data = await res.json();
    setSavingSettings(false);

    if (!res.ok) {
      setError(data.error || 'Failed to save settings');
      return;
    }

    setStatus('Settings saved. Work-schedule warnings and reminder preferences are ready for the next slice.');
    router.refresh();
  }

  async function sendCode() {
    setSendingCode(true);
    setError(null);
    setStatus(null);

    const res = await fetch('/api/phone/start-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();
    setSendingCode(false);

    if (!res.ok) {
      setError(data.error || 'Could not send verification code');
      return;
    }

    setPhone(data.phone);
    setPhoneVerified(false);
    setVerificationSent(true);
    setStatus(`Verification code sent to ${data.phone}.`);
    router.refresh();
  }

  async function verifyCode() {
    setCheckingCode(true);
    setError(null);
    setStatus(null);

    const res = await fetch('/api/phone/check-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });

    const data = await res.json();
    setCheckingCode(false);

    if (!res.ok) {
      setError(data.error || data.status || 'Code verification failed');
      return;
    }

    setPhoneVerified(true);
    setVerificationSent(false);
    setCode('');
    setStatus('Phone number verified.');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-ink-900">
            Default work schedule
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Plotto will use this to warn when a new capture lands during work.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(event) => setScheduleEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-ink-300 text-coral-500 focus:ring-coral-500"
            />
            Turn on work-schedule conflict warnings
          </label>

          <div className="flex flex-wrap gap-2">
            {dayOptions.map((day) => {
              const active = days.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  disabled={!scheduleEnabled}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? 'bg-coral-500 text-white'
                      : 'border border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start time">
              <input
                type="time"
                className="input"
                value={start}
                onChange={(event) => setStart(event.target.value)}
                disabled={!scheduleEnabled}
              />
            </Field>
            <Field label="End time">
              <input
                type="time"
                className="input"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
                disabled={!scheduleEnabled}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-ink-900">
            Reminder preferences
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Choose how Plotto reaches you for each importance level. Push
            notifications arrive once the mobile app ships; email and SMS are
            live today.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-ink-100">
          <div className="grid grid-cols-[1.5fr_repeat(3,1fr)] divide-y divide-ink-100 text-sm">
            <div className="col-span-full grid grid-cols-subgrid bg-paper-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
              <div>Plotto type</div>
              {CHANNEL_COLS.map((col) => (
                <div key={col.key} className="text-center">
                  <div>{col.label}</div>
                  <div className="mt-0.5 text-[10px] font-normal normal-case tracking-normal text-ink-400">
                    {col.hint}
                  </div>
                </div>
              ))}
            </div>
            {IMPORTANCE_ROWS.map((row) => (
              <div
                key={row.key}
                className="col-span-full grid grid-cols-subgrid items-center px-4 py-3"
              >
                <div>
                  <div className="font-medium text-ink-900">{row.label}</div>
                  <div className="mt-0.5 text-xs text-ink-500">
                    {row.sublabel}
                  </div>
                </div>
                {CHANNEL_COLS.map((col) => {
                  const disabled =
                    (col.key === 'sms' && !phoneVerified) ||
                    col.key === 'push';
                  const title = col.key === 'push'
                    ? 'Push notifications will activate when the mobile app ships.'
                    : col.key === 'sms' && !phoneVerified
                      ? 'Verify your mobile number below to enable SMS.'
                      : '';
                  return (
                    <label
                      key={col.key}
                      className="flex items-center justify-center"
                      title={title}
                    >
                      <input
                        type="checkbox"
                        checked={reminderPreferences[row.key][col.key]}
                        disabled={disabled}
                        onChange={() => toggleChannel(row.key, col.key)}
                        className="h-5 w-5 rounded border-ink-300 text-coral-500 focus:ring-coral-500 disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-ink-500">
          Email reminders go to <span className="font-medium text-ink-700">{settings.email || 'no email on file'}</span>.
          {phoneVerified ? (
            <>
              {' '}SMS reminders go to <span className="font-medium text-ink-700">{phone}</span>.
            </>
          ) : (
            <> Verify your mobile number below to enable SMS.</>
          )}
        </p>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink-900">
              Mobile number
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Verify the number now so it&apos;s ready when mobile reminder delivery is added.
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              phoneVerified
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {phoneVerified ? 'Verified' : 'Not verified'}
          </span>
        </div>

        <div className="space-y-4">
          <Field label="Phone number">
            <input
              type="tel"
              className="input"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setPhoneVerified(false);
              }}
              placeholder="(917) 555-0123"
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={sendCode}
              disabled={sendingCode || !phone.trim()}
              className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendingCode ? 'Sending…' : verificationSent ? 'Resend code' : 'Send verification code'}
            </button>
            {phoneVerified && (
              <p className="self-center text-sm text-green-700">
                This number is already verified.
              </p>
            )}
          </div>

          {(verificationSent || !phoneVerified) && (
            <div className="grid gap-4 rounded-xl border border-ink-100 bg-paper-50 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field label="6-digit code">
                <input
                  inputMode="numeric"
                  className="input"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="123456"
                />
              </Field>
              <button
                type="button"
                onClick={verifyCode}
                disabled={checkingCode || !code.trim() || !phone.trim()}
                className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-semibold text-white hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkingCode ? 'Checking…' : 'Verify number'}
              </button>
            </div>
          )}
        </div>
      </section>

      {(error || status) && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            error
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-green-200 bg-green-50 text-green-800'
          }`}
        >
          {error || status}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveSettings}
          disabled={savingSettings}
          className="rounded-xl bg-coral-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingSettings ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-500">
        {label}
      </label>
      {children}
    </div>
  );
}