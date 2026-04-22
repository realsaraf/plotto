import OpenAI from 'openai';
import { z } from 'zod';
import {
  ExtractedEventSchema,
  ExtractionResponseSchema,
  type ExtractedEvent,
  type ExtractionResponse,
} from '@plotto/schema';

export interface ExtractOptions {
  /** User-provided text/share payload. */
  rawContent: string;
  /** User local timezone (IANA, e.g. "America/New_York"). */
  timezone: string;
  /** ISO datetime representing "now" in the user's perspective. */
  nowIso: string;
  /** Override model; defaults to env OPENAI_MODEL or gpt-4o-mini. */
  model?: string;
  /** OpenAI API key; defaults to env OPENAI_API_KEY. */
  apiKey?: string;
}

export interface ExtractionResult {
  /** Back-compat: the first plotto flattened to the legacy ExtractedEvent shape. */
  event: ExtractedEvent;
  /** All extracted plottos with people, meeting links, phone numbers. */
  response: ExtractionResponse;
  /** Usage for cost tracking (best-effort; null on older SDKs). */
  usage: { inputTokens: number; outputTokens: number } | null;
  /** Model actually used. */
  model: string;
  /** Raw JSON returned (for auditing/tracing). */
  raw: unknown;
}

const SYSTEM_PROMPT = [
  'You are Plotto, a calm assistant that turns messy human text (emails,',
  'screenshots, voice transcripts, share-sheet pastes) into structured',
  'calendar items called "plottos".',
  '',
  'A single input may describe MULTIPLE real-world items. Return each one as',
  'its own plotto in the `plottos` array. If the input describes only one,',
  'return an array with exactly one plotto.',
  '',
  'RULES:',
  '- Output ISO 8601 datetimes with timezone offset derived from the user timezone.',
  '- If no explicit date is present, infer the most likely date from context.',
  '- If truly ambiguous, still return your best guess and set clarifyingQuestion.',
  '- confidence in [0,1]: 0.9+ explicit, 0.6-0.8 inferred, below 0.5 guessing.',
  '- importance tiers: ambient (just know), soft_block (standard notif),',
  '  hard_block (critical alarm — flights, interviews, medical).',
  '- reminderStrategy: silent / standard / critical — match importance.',
  '- recurrenceRule: RFC 5545 RRULE string or null.',
  '- allDay: true only when no time is specified AND the item spans a whole day.',
  '- endsAt: set only when an explicit end time is present; otherwise null.',
  '- description: a short human note (max 280 chars) or null.',
  '',
  'PEOPLE:',
  '- Extract real human names mentioned in the text as `people` entries.',
  '- `name` is the full human-readable name; `role` is an optional short label',
  '  (e.g. "dentist", "manager", "mom") or null.',
  '- Do NOT include company names, product names, or the user themselves.',
  '- Deduplicate people within a single plotto.',
  '',
  'MEETING LINKS:',
  '- Detect meeting URLs and classify them:',
  '    zoom   → zoom.us / *.zoom.us / zoom.com',
  '    meet   → meet.google.com / g.co/meet',
  '    teams  → teams.microsoft.com / teams.live.com',
  '    webex  → *.webex.com',
  '    url    → any other legitimate http(s) URL relevant to the plotto',
  '- `label` is an optional short human name for the link (or null).',
  '- Do NOT invent URLs that are not in the source text.',
  '',
  'PHONE NUMBERS:',
  '- Extract dial-in or contact phone numbers as `phoneNumbers`.',
  '- Preserve the original format when possible; `label` is optional.',
  '- Do NOT include fax numbers or numbers that are clearly not phone numbers.',
].join('\n');

/**
 * JSON schema the model is forced to conform to (OpenAI Structured Outputs).
 * Keep in sync with ExtractedPlottoSchema (Zod) — Zod still validates after.
 */
const EXTRACTION_RESPONSE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    plottos: {
      type: 'array',
      minItems: 1,
      maxItems: 10,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: ['string', 'null'] },
          startsAt: { type: 'string' },
          endsAt: { type: ['string', 'null'] },
          location: { type: ['string', 'null'] },
          allDay: { type: 'boolean' },
          recurrenceRule: { type: ['string', 'null'] },
          importance: {
            type: 'string',
            enum: ['ambient', 'soft_block', 'hard_block'],
          },
          reminderStrategy: {
            type: 'string',
            enum: ['silent', 'standard', 'critical'],
          },
          confidence: { type: 'number' },
          clarifyingQuestion: { type: ['string', 'null'] },
          people: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string' },
                role: { type: ['string', 'null'] },
              },
              required: ['name', 'role'],
            },
          },
          meetingLinks: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                type: {
                  type: 'string',
                  enum: ['zoom', 'meet', 'teams', 'webex', 'phone', 'url'],
                },
                url: { type: 'string' },
                label: { type: ['string', 'null'] },
              },
              required: ['type', 'url', 'label'],
            },
          },
          phoneNumbers: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                number: { type: 'string' },
                label: { type: ['string', 'null'] },
              },
              required: ['number', 'label'],
            },
          },
        },
        required: [
          'title',
          'description',
          'startsAt',
          'endsAt',
          'location',
          'allDay',
          'recurrenceRule',
          'importance',
          'reminderStrategy',
          'confidence',
          'clarifyingQuestion',
          'people',
          'meetingLinks',
          'phoneNumbers',
        ],
      },
    },
  },
  required: ['plottos'],
} as const;

export async function extractEvent(opts: ExtractOptions): Promise<ExtractionResult> {
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');
  const model = opts.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  const client = new OpenAI({ apiKey });

  const userPrompt = [
    `User timezone: ${opts.timezone}`,
    `Now (user local): ${opts.nowIso}`,
    '',
    'Raw content:',
    '"""',
    opts.rawContent,
    '"""',
  ].join('\n');

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'PlottoExtraction',
        strict: true,
        schema: EXTRACTION_RESPONSE_JSON_SCHEMA as unknown as Record<string, unknown>,
      },
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty content');

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error(`OpenAI returned non-JSON content: ${(e as Error).message}`);
  }

  const result = ExtractionResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new ExtractionValidationError('Extracted plottos failed Zod validation', result.error);
  }

  // Legacy back-compat: surface the first plotto under `event`.
  const first = result.data.plottos[0]!;
  const legacyEvent = ExtractedEventSchema.parse({
    title: first.title,
    description: first.description,
    startsAt: first.startsAt,
    endsAt: first.endsAt,
    location: first.location,
    allDay: first.allDay,
    recurrenceRule: first.recurrenceRule,
    importance: first.importance,
    reminderStrategy: first.reminderStrategy,
    confidence: first.confidence,
    clarifyingQuestion: first.clarifyingQuestion,
  });

  return {
    event: legacyEvent,
    response: result.data,
    usage: completion.usage
      ? {
          inputTokens: completion.usage.prompt_tokens ?? 0,
          outputTokens: completion.usage.completion_tokens ?? 0,
        }
      : null,
    model,
    raw: parsed,
  };
}

export class ExtractionValidationError extends Error {
  readonly issues: z.ZodIssue[];
  constructor(message: string, zerr: z.ZodError) {
    super(message);
    this.name = 'ExtractionValidationError';
    this.issues = zerr.issues;
  }
}

/**
 * Rough USD-cents cost estimator for gpt-4o-mini and gpt-4o.
 * Update as pricing changes. Returns integer cents.
 */
export function estimateCostCents(
  model: string,
  usage: { inputTokens: number; outputTokens: number } | null,
): number | null {
  if (!usage) return null;
  const rates: Record<string, { inPerM: number; outPerM: number }> = {
    'gpt-4o-mini': { inPerM: 0.15, outPerM: 0.6 },
    'gpt-4o': { inPerM: 2.5, outPerM: 10 },
    'gpt-4.1-mini': { inPerM: 0.4, outPerM: 1.6 },
    'gpt-4.1': { inPerM: 2, outPerM: 8 },
  };
  const rate = rates[model] ?? rates['gpt-4o-mini']!;
  const dollars =
    (usage.inputTokens / 1_000_000) * rate.inPerM +
    (usage.outputTokens / 1_000_000) * rate.outPerM;
  return Math.ceil(dollars * 100);
}
