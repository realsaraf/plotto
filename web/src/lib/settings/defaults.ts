import type { ToatKind } from "@/types";

export interface NotificationChannels {
  push: boolean;
  email: boolean;
  sms: boolean;
}

export type NotificationPreferences = Record<ToatKind, NotificationChannels>;

export const TOAT_KINDS: ToatKind[] = ["task", "event", "meeting", "idea", "errand", "deadline"];

const DEFAULT_CHANNELS: NotificationChannels = {
  push: true,
  email: false,
  sms: false,
};

export function createDefaultNotificationPreferences(): NotificationPreferences {
  return Object.fromEntries(
    TOAT_KINDS.map((kind) => [kind, { ...DEFAULT_CHANNELS }]),
  ) as NotificationPreferences;
}

export function normalizeNotificationPreferences(input: unknown): NotificationPreferences {
  const defaults = createDefaultNotificationPreferences();

  if (!input || typeof input !== "object") {
    return defaults;
  }

  const record = input as Record<string, unknown>;

  for (const kind of TOAT_KINDS) {
    const candidate = record[kind];
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const channels = candidate as Record<string, unknown>;
    defaults[kind] = {
      push: typeof channels.push === "boolean" ? channels.push : defaults[kind].push,
      email: typeof channels.email === "boolean" ? channels.email : defaults[kind].email,
      sms: typeof channels.sms === "boolean" ? channels.sms : defaults[kind].sms,
    };
  }

  return defaults;
}

export function createDefaultUserSettings(timezone: string) {
  return {
    timezone,
    voiceRetention: false,
    smsEnabled: false,
    reminderPhone: null as string | null,
    pendingPhone: null as string | null,
    phoneVerifiedAt: null as string | null,
    workStart: "09:00",
    workEnd: "17:30",
    notificationPreferences: createDefaultNotificationPreferences(),
  };
}
