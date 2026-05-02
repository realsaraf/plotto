/**
 * Shared TypeScript types for Toatre.
 * Mirror of mobile Dart models — keep in sync manually.
 */
import { ObjectId } from "mongodb";

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * The 10 toat templates.  Each discriminates a typed templateData payload.
 * The legacy `kind` field is retained in the DB for backward compat but
 * the template field is the single source of truth for UI dispatch.
 */
export type ToatTemplate =
  | "meeting"
  | "call"
  | "appointment"
  | "event"
  | "deadline"
  | "task"
  | "checklist"
  | "errand"
  | "follow_up"
  | "idea";

/** Coarse kind bucket still used for Ping policy.  Derived from template. */
export type ToatKind =
  | "task"
  | "event"
  | "meeting"
  | "idea"
  | "errand"
  | "deadline";

export type ToatTier = "urgent" | "important" | "regular";

export type ToatStatus =
  | "active"
  | "snoozed"
  | "done"
  | "cancelled"
  | "archived";

export type CaptureSource =
  | "mic"
  | "manual"
  | "share_sheet"
  | "email"
  | "screenshot";

export type PingChannel = "local" | "push" | "email" | "sms" | "critical_alert";

export type ShareRole = "view" | "edit";

// ─── Template-specific data payloads ─────────────────────────────────────────

export interface MeetingData {
  template: "meeting";
  joinUrl: string | null;       // Zoom / Meet / Teams URL
  attendees: string[];          // names / handles
  agenda: string | null;        // free-text agenda
}

export interface CallData {
  template: "call";
  phone: string | null;         // E.164 or human-readable
  contactName: string | null;   // resolved connection name
}

export interface AppointmentData {
  template: "appointment";
  providerName: string | null;  // "Dr Smith", "Dentist"
  phone: string | null;         // clinic phone
  address: string | null;       // physical address
}

export interface EventData {
  template: "event";
  venue: string | null;
  ticketUrl: string | null;
  doorsAt: string | null;       // ISO 8601
}

export interface DeadlineData {
  template: "deadline";
  dueAt: string | null;         // ISO 8601, may differ from scheduledAt
  softDeadline: boolean;        // true = aspirational, false = hard
}

export interface TaskData {
  template: "task";
  completedAt: string | null;   // ISO 8601
}

export interface ChecklistItem {
  id: string;                   // client-generated stable key
  text: string;
  done: boolean;
}

export interface ChecklistData {
  template: "checklist";
  items: ChecklistItem[];
}

export interface ErrandData {
  template: "errand";
  address: string | null;
  storeOrVenue: string | null;
}

export interface FollowUpData {
  template: "follow_up";
  contactName: string | null;
  phone: string | null;
  email: string | null;
  channel: "call" | "email" | "message" | null;
}

export interface IdeaData {
  template: "idea";
  revisitAt: string | null;     // ISO 8601
  tags: string[];
}

export type TemplateData =
  | MeetingData
  | CallData
  | AppointmentData
  | EventData
  | DeadlineData
  | TaskData
  | ChecklistData
  | ErrandData
  | FollowUpData
  | IdeaData;

// ─── MongoDB document types ───────────────────────────────────────────────────

export interface UserDoc {
  _id: ObjectId;
  firebaseUid: string;
  email: string | null;
  handle: string | null;
  displayName: string | null;
  photoUrl: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToatDoc {
  _id: ObjectId;
  ownerId: ObjectId;
  captureId: ObjectId | null;
  template: ToatTemplate;
  kind: ToatKind;               // coarse bucket for Ping policy; derived from template
  tier: ToatTier;
  status: ToatStatus;
  title: string;
  datetime: Date | null;
  endDatetime: Date | null;
  location: string | null;      // shared convenience field (address / venue)
  link: string | null;          // shared convenience field (URL)
  people: string[];             // names / @handles
  notes: string | null;
  templateData: TemplateData;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaptureDoc {
  _id: ObjectId;
  userId: string;
  source: CaptureSource;
  rawText: string | null;
  audioUrl: string | null;
  llmInput: string | null;
  llmOutput: string | null;
  toatIds: string[];
  createdAt: Date;
}

export interface PersonDoc {
  _id: ObjectId;
  userId: string;           // owner
  handle: string | null;
  displayName: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AclDoc {
  _id: ObjectId;
  toatId: string;
  ownerId: string;
  granteeId: string | null; // null = public
  role: ShareRole;
  token: string;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface ReminderDoc {
  _id: ObjectId;
  userId: string;
  toatId: string;
  channel: PingChannel;
  dueAt: Date;
  sentAt: Date | null;
  createdAt: Date;
}

export interface UserSettingsDoc {
  _id: ObjectId;
  userId: string;
  timezone: string;
  voiceRetention: boolean;
  smsEnabled: boolean;
  reminderPhone: string | null;
  pendingPhone?: string | null;
  phoneVerifiedAt?: Date | string | null;
  workStart: string;        // "HH:MM" in user's timezone
  workEnd: string;
  notificationPreferences?: Record<ToatKind, {
    push: boolean;
    email: boolean;
    sms: boolean;
  }>;
  updatedAt: Date;
}

// ─── API response types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Shape returned by /api/toats and /api/captures — all dates as ISO strings */
export interface SerializedToat {
  id: string;
  template: ToatTemplate;
  kind: ToatKind;
  tier: ToatTier;
  title: string;
  datetime: string | null;
  endDatetime: string | null;
  location: string | null;
  link: string | null;
  people: string[];
  notes: string | null;
  status: ToatStatus;
  templateData: TemplateData;
  captureId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractionResult {
  toats: Array<{
    template: ToatTemplate;
    kind: ToatKind;
    tier: ToatTier;
    title: string;
    datetime: string | null;     // ISO 8601
    endDatetime: string | null;
    location: string | null;
    link: string | null;
    people: string[];
    notes: string | null;
    templateData: TemplateData;
  }>;
}

// ─── Template helper: derive coarse kind from template ───────────────────────

export function templateToKind(template: ToatTemplate): ToatKind {
  switch (template) {
    case "meeting": return "meeting";
    case "call": return "task";
    case "appointment": return "errand";
    case "event": return "event";
    case "deadline": return "deadline";
    case "task": return "task";
    case "checklist": return "task";
    case "errand": return "errand";
    case "follow_up": return "task";
    case "idea": return "idea";
  }
}

/** Build a default (empty) templateData for a given template discriminant. */
export function emptyTemplateData(template: ToatTemplate): TemplateData {
  switch (template) {
    case "meeting":    return { template, joinUrl: null, attendees: [], agenda: null };
    case "call":       return { template, phone: null, contactName: null };
    case "appointment":return { template, providerName: null, phone: null, address: null };
    case "event":      return { template, venue: null, ticketUrl: null, doorsAt: null };
    case "deadline":   return { template, dueAt: null, softDeadline: false };
    case "task":       return { template, completedAt: null };
    case "checklist":  return { template, items: [] };
    case "errand":     return { template, address: null, storeOrVenue: null };
    case "follow_up":  return { template, contactName: null, phone: null, email: null, channel: null };
    case "idea":       return { template, revisitAt: null, tags: [] };
  }
}
