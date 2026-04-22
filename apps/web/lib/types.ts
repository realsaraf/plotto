export interface MeetingLink {
  type: 'zoom' | 'meet' | 'teams' | 'webex' | 'phone' | 'url';
  url: string;
  label: string | null;
}

export interface PhoneNumber {
  number: string;
  label: string | null;
}

export interface PersonPill {
  id: string;
  name: string;
  color: string;
}

export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  all_day: boolean;
  importance: 'ambient' | 'soft_block' | 'hard_block';
  reminder_strategy: 'silent' | 'standard' | 'critical';
  confidence: number | null;
  status: 'active' | 'snoozed' | 'done' | 'cancelled';
  meeting_links?: MeetingLink[] | null;
  phone_numbers?: PhoneNumber[] | null;
  people?: PersonPill[] | null;
}

export interface CaptureRow {
  id: string;
  raw_content: string;
  source: 'share_sheet' | 'voice' | 'manual' | 'email' | 'screenshot';
  processed: boolean;
  llm_cost_cents: number | null;
  llm_model: string | null;
  created_at: string;
}
