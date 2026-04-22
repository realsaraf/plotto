import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { extractEvent, estimateCostCents, ExtractionValidationError } from '@plotto/ai';
import type { ExtractedPlotto } from '@plotto/schema';
import { supabaseServer } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import {
  colorForName,
  conflictsWithSchedule,
  normalizePersonName,
  type WorkSchedule,
} from '@/lib/plotto-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  rawContent: z.string().min(1).max(20_000),
  source: z
    .enum(['share_sheet', 'voice', 'manual', 'email', 'screenshot'])
    .default('manual'),
  timezone: z.string().default('UTC'),
});

type PersistedPlotto = {
  event_id: string;
  plotto: ExtractedPlotto;
  person_ids: string[];
  conflictsWithWorkSchedule: boolean;
};

export async function POST(req: NextRequest) {
  if (!env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body;
  try {
    body = BodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  // Load user settings for work-schedule check.
  const { data: userRow } = await supabase
    .from('users')
    .select('work_schedule')
    .eq('id', user.id)
    .maybeSingle();
  const workSchedule = (userRow?.work_schedule ?? null) as WorkSchedule | null;

  // 1) Write capture row first (audit trail even if extraction fails)
  const { data: capture, error: capErr } = await supabase
    .from('captures')
    .insert({
      user_id: user.id,
      raw_content: body.rawContent,
      source: body.source,
      processed: false,
    })
    .select('id')
    .single();
  if (capErr || !capture) {
    return NextResponse.json({ error: capErr?.message ?? 'capture insert failed' }, { status: 500 });
  }

  // 2) Call LLM
  const started = Date.now();
  let result;
  try {
    result = await extractEvent({
      rawContent: body.rawContent,
      timezone: body.timezone,
      nowIso: new Date().toISOString(),
      model: env.OPENAI_MODEL,
      apiKey: env.OPENAI_API_KEY,
    });
  } catch (e) {
    const details =
      e instanceof ExtractionValidationError
        ? { issues: e.issues }
        : undefined;
    await supabase
      .from('captures')
      .update({
        llm_input: { timezone: body.timezone, model: env.OPENAI_MODEL },
        llm_output: { error: (e as Error).message, ...details },
        processed: false,
      })
      .eq('id', capture.id);
    return NextResponse.json(
      { error: (e as Error).message, ...details },
      { status: 502 },
    );
  }
  const latencyMs = Date.now() - started;
  const costCents = estimateCostCents(result.model, result.usage);

  // 3) Upsert distinct people for this capture (dedupe by normalized name).
  const uniqueNames = new Map<string, { name: string; color: string }>();
  for (const p of result.response.plottos) {
    for (const person of p.people ?? []) {
      const normalized = normalizePersonName(person.name);
      if (!normalized) continue;
      if (!uniqueNames.has(normalized)) {
        uniqueNames.set(normalized, {
          name: person.name.trim(),
          color: colorForName(normalized),
        });
      }
    }
  }

  const normalizedToId = new Map<string, string>();
  if (uniqueNames.size > 0) {
    const names = Array.from(uniqueNames.keys());
    const { data: existing } = await supabase
      .from('people')
      .select('id, normalized_name')
      .eq('user_id', user.id)
      .in('normalized_name', names);
    for (const row of existing ?? []) {
      normalizedToId.set(row.normalized_name as string, row.id as string);
    }
    const missing = names.filter((n) => !normalizedToId.has(n));
    if (missing.length > 0) {
      const rows = missing.map((n) => ({
        user_id: user.id,
        name: uniqueNames.get(n)!.name,
        normalized_name: n,
        color: uniqueNames.get(n)!.color,
      }));
      const { data: inserted } = await supabase
        .from('people')
        .insert(rows)
        .select('id, normalized_name');
      for (const row of inserted ?? []) {
        normalizedToId.set(row.normalized_name as string, row.id as string);
      }
    }
  }

  // 4) Insert one event per plotto + attach people + links.
  const persisted: PersistedPlotto[] = [];
  for (const plotto of result.response.plottos) {
    const conflict = conflictsWithSchedule(plotto.startsAt, body.timezone, workSchedule);
    const { data: eventRow, error: evErr } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        title: plotto.title,
        description: plotto.description,
        starts_at: plotto.startsAt,
        ends_at: plotto.endsAt,
        location: plotto.location,
        all_day: plotto.allDay,
        recurrence_rule: plotto.recurrenceRule,
        importance: plotto.importance,
        reminder_strategy: plotto.reminderStrategy,
        confidence: plotto.confidence,
        source_capture_id: capture.id,
        meeting_links: plotto.meetingLinks ?? [],
        phone_numbers: plotto.phoneNumbers ?? [],
        status: 'active',
      })
      .select('id')
      .single();
    if (evErr || !eventRow) {
      return NextResponse.json(
        { error: evErr?.message ?? 'event insert failed' },
        { status: 500 },
      );
    }

    const personIds: string[] = [];
    for (const person of plotto.people ?? []) {
      const id = normalizedToId.get(normalizePersonName(person.name));
      if (id && !personIds.includes(id)) personIds.push(id);
    }
    if (personIds.length > 0) {
      await supabase
        .from('event_people')
        .insert(personIds.map((pid) => ({ event_id: eventRow.id, person_id: pid })));
    }

    persisted.push({
      event_id: eventRow.id,
      plotto,
      person_ids: personIds,
      conflictsWithWorkSchedule: conflict,
    });
  }

  // 5) Mark capture processed + cost
  await supabase
    .from('captures')
    .update({
      llm_input: { timezone: body.timezone, model: result.model },
      llm_output: result.raw as object,
      llm_model: result.model,
      llm_cost_cents: costCents,
      processed: true,
    })
    .eq('id', capture.id);

  // 6) Fire-and-forget Langfuse trace (best effort)
  void logToLangfuse({
    input: body.rawContent,
    output: result.raw,
    model: result.model,
    usage: result.usage,
    latencyMs,
    userId: user.id,
    captureId: capture.id,
    eventIds: persisted.map((p) => p.event_id),
  });

  const first = persisted[0]!;
  return NextResponse.json({
    capture_id: capture.id,
    // Back-compat fields (single-plotto consumers).
    event_id: first.event_id,
    event: result.event,
    // New multi-plotto payload.
    plottos: persisted.map((p) => ({
      event_id: p.event_id,
      ...p.plotto,
      conflictsWithWorkSchedule: p.conflictsWithWorkSchedule,
    })),
    warnings: persisted
      .filter((p) => p.conflictsWithWorkSchedule)
      .map((p) => ({
        event_id: p.event_id,
        title: p.plotto.title,
        startsAt: p.plotto.startsAt,
        kind: 'work_schedule' as const,
      })),
  });
}

async function logToLangfuse(p: {
  input: string;
  output: unknown;
  model: string;
  usage: { inputTokens: number; outputTokens: number } | null;
  latencyMs: number;
  userId: string;
  captureId: string;
  eventIds: string[];
}) {
  if (!env.LANGFUSE_PUBLIC_KEY || !env.LANGFUSE_SECRET_KEY) return;
  try {
    const { Langfuse } = await import('langfuse');
    const lf = new Langfuse({
      publicKey: env.LANGFUSE_PUBLIC_KEY,
      secretKey: env.LANGFUSE_SECRET_KEY,
      baseUrl: env.LANGFUSE_HOST,
    });
    const trace = lf.trace({
      name: 'extract_event',
      userId: p.userId,
      metadata: { captureId: p.captureId, eventIds: p.eventIds },
    });
    trace.generation({
      name: 'openai.chat.completions',
      model: p.model,
      input: p.input,
      output: p.output,
      usage: p.usage
        ? {
            input: p.usage.inputTokens,
            output: p.usage.outputTokens,
            total: p.usage.inputTokens + p.usage.outputTokens,
          }
        : undefined,
    });
    await lf.flushAsync();
  } catch {
    // langfuse optional — swallow
  }
}
