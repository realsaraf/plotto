'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ThemePicker } from '@/components/theme-toggle';

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
  const [removingPhone, setRemovingPhone] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  // Editing mode: user had a verified number and clicked "Change". We flip the
  // verified flag locally so the input + send button reappear, but we do NOT
  // touch the DB — the old number stays verified until a new code is accepted.
  const [editingPhone, setEditingPhone] = useState(false);
  // Countdown in seconds until the most-recently-sent code expires. `null`
  // means no active code. We derive a ticking `codeSecondsLeft` from this.
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(null);
  const [codeSecondsLeft, setCodeSecondsLeft] = useState(0);
  const CODE_TTL_MS = 50 * 1000;

  useEffect(() => {
    if (!codeExpiresAt) {
      setCodeSecondsLeft(0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((codeExpiresAt - Date.now()) / 1000),
      );
      setCodeSecondsLeft(remaining);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [codeExpiresAt]);

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
    setCodeExpiresAt(Date.now() + CODE_TTL_MS);
    setStatus(`Verification code sent to ${data.phone}. Expires in 50 seconds.`);
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
    setEditingPhone(false);
    setCodeExpiresAt(null);
    setCode('');
    setStatus('Phone number verified.');
    router.refresh();
  }

  function startEditingPhone() {
    setEditingPhone(true);
    setPhoneVerified(false);
    setVerificationSent(false);
    setCode('');
    setCodeExpiresAt(null);
    setError(null);
    setStatus(null);
  }

  async function removePhone() {
    if (
      !window.confirm(
        'Remove your mobile number? SMS reminders will be disabled until you verify a new number.',
      )
    ) {
      return;
    }
    setRemovingPhone(true);
    setError(null);
    setStatus(null);

    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: null }),
    });
    const data = await res.json();
    setRemovingPhone(false);

    if (!res.ok) {
      setError(data.error || 'Failed to remove phone number');
      return;
    }

    setPhone('');
    setPhoneVerified(false);
    setVerificationSent(false);
    setEditingPhone(false);
    setCode('');
    setCodeExpiresAt(null);
    setStatus('Mobile number removed.');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-fg">
            Appearance
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Choose how Plotto looks. Midnight is easy on tired eyes.
          </p>
        </div>
        <ThemePicker />
      </section>

      <section className="rounded-2xl border border-line bg-card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-fg">
            Default work schedule
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Plotto will use this to warn when a new capture lands during work.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(event) => setScheduleEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-line-strong text-accent focus:ring-accent"
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
                      ? 'bg-accent text-accent-fg'
                      : 'border border-line-strong bg-card text-fg-muted hover:border-line-strong'
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

      <section className="rounded-2xl border border-line bg-card p-6">
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-fg">
            Reminder preferences
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Choose how Plotto reaches you for each importance level. Push
            notifications arrive once the mobile app ships; email and SMS are
            live today.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-line">
          <div className="grid grid-cols-[1.5fr_repeat(3,1fr)] divide-y divide-ink-100 text-sm">
            <div className="col-span-full grid grid-cols-subgrid bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">
              <div>Plotto type</div>
              {CHANNEL_COLS.map((col) => (
                <div key={col.key} className="text-center">
                  <div>{col.label}</div>
                  <div className="mt-0.5 text-[10px] font-normal normal-case tracking-normal text-fg-subtle">
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
                  <div className="font-medium text-fg">{row.label}</div>
                  <div className="mt-0.5 text-xs text-fg-muted">
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
                        className="h-5 w-5 rounded border-line-strong text-accent focus:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-fg-muted">
          Email reminders go to <span className="font-medium text-fg-muted">{settings.email || 'no email on file'}</span>.
          {phoneVerified ? (
            <>
              {' '}SMS reminders go to <span className="font-medium text-fg-muted">{phone}</span>.
            </>
          ) : (
            <> Verify your mobile number below to enable SMS.</>
          )}
        </p>
      </section>

      <section className="rounded-2xl border border-line bg-card p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-fg">
              Mobile number
            </h2>
            <p className="mt-1 text-sm text-fg-muted">
              {phoneVerified
                ? 'Used for SMS reminders based on your preferences above.'
                : 'Verify your number to enable SMS reminders.'}
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

        {phoneVerified ? (
          // VERIFIED + not editing → read-only view with Change / Remove.
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-fg-muted">
                Phone number
              </div>
              <div className="mt-0.5 text-lg font-semibold text-fg">
                {phone}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startEditingPhone}
                className="rounded-lg border border-line-strong bg-card px-3 py-1.5 text-sm font-medium text-fg-muted hover:border-line-strong"
              >
                Change
              </button>
              <button
                type="button"
                onClick={removePhone}
                disabled={removingPhone}
                className="rounded-lg border border-red-200 bg-card px-3 py-1.5 text-sm font-medium text-red-700 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {removingPhone ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        ) : (
          // NOT VERIFIED (fresh, or editing an already-verified number).
          <div className="space-y-4">
            {editingPhone && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Enter a new number and verify it. Your previous verified number
                stays active until the new one is confirmed.
              </div>
            )}

            <Field label="Phone number">
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setVerificationSent(false);
                  setCodeExpiresAt(null);
                }}
                placeholder="(917) 555-0123"
              />
            </Field>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={sendCode}
                disabled={sendingCode || !phone.trim()}
                className="rounded-lg bg-fg px-4 py-2 text-sm font-semibold text-accent-fg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingCode
                  ? 'Sending…'
                  : verificationSent
                    ? codeSecondsLeft > 0
                      ? `Resend code (${codeSecondsLeft}s)`
                      : 'Resend code'
                    : 'Send verification code'}
              </button>
              {editingPhone && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPhone(false);
                    setPhone(settings.phone);
                    setPhoneVerified(settings.phoneVerified);
                    setVerificationSent(false);
                    setCode('');
                    setCodeExpiresAt(null);
                  }}
                  className="rounded-lg border border-line-strong bg-card px-3 py-2 text-sm font-medium text-fg-muted hover:border-line-strong"
                >
                  Cancel
                </button>
              )}
            </div>

            {verificationSent && (
              <div className="grid gap-4 rounded-xl border border-line bg-surface p-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <Field
                  label={
                    codeSecondsLeft > 0
                      ? `6-digit code (expires in ${codeSecondsLeft}s)`
                      : '6-digit code (expired — resend above)'
                  }
                >
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
                  disabled={
                    checkingCode ||
                    !code.trim() ||
                    !phone.trim() ||
                    codeSecondsLeft === 0
                  }
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkingCode ? 'Checking…' : 'Verify number'}
                </button>
              </div>
            )}
          </div>
        )}
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
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg shadow-sm hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
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
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-fg-muted">
        {label}
      </label>
      {children}
    </div>
  );
}