import { NextRequest, NextResponse } from "next/server";
import { getCollections } from "@/lib/mongo/collections";
import { requireUser } from "@/lib/auth/require-user";
import { createDefaultUserSettings } from "@/lib/settings/defaults";
import { checkPhoneVerification } from "@/lib/twilio/verify";

function normalizePhone(value: string) {
  return value.trim().replace(/[\s().-]/g, "");
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireUser(request);
  if (errorResponse) {
    return errorResponse;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const rawPhone = payload && typeof payload.phone === "string" ? normalizePhone(payload.phone) : "";
  const rawCode = payload && typeof payload.code === "string" ? payload.code.trim() : "";

  if (!/^\+\d{10,15}$/.test(rawPhone)) {
    return NextResponse.json({ error: "Enter the same phone number you verified." }, { status: 400 });
  }

  if (!/^\d{4,10}$/.test(rawCode)) {
    return NextResponse.json({ error: "Enter the verification code you received." }, { status: 400 });
  }

  let result;
  try {
    result = await checkPhoneVerification(rawPhone, rawCode);
  } catch (error) {
    console.error("[twilio/verify/check]", error);
    return NextResponse.json({ error: "Couldn't verify that code right now." }, { status: 502 });
  }

  if (result.status !== "approved" && result.valid !== true) {
    return NextResponse.json({ error: "That verification code is not valid." }, { status: 400 });
  }

  const { settings } = await getCollections();
  const defaults = createDefaultUserSettings("UTC");
  const {
    reminderPhone: _reminderPhone,
    pendingPhone: _pendingPhone,
    phoneVerifiedAt: _phoneVerifiedAt,
    smsEnabled: _smsEnabled,
    ...insertDefaults
  } = defaults;
  const now = new Date();

  await settings.updateOne(
    { userId: user.mongoId },
    {
      $set: {
        reminderPhone: rawPhone,
        pendingPhone: null,
        phoneVerifiedAt: now,
        smsEnabled: true,
        updatedAt: now,
      },
      $setOnInsert: {
        userId: user.mongoId,
        ...insertDefaults,
      },
    },
    { upsert: true },
  );

  return NextResponse.json({ ok: true, reminderPhone: rawPhone, phoneVerifiedAt: now.toISOString() });
}
