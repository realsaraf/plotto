import { NextRequest, NextResponse } from "next/server";
import { getCollections } from "@/lib/mongo/collections";
import { requireUser } from "@/lib/auth/require-user";
import { createDefaultUserSettings } from "@/lib/settings/defaults";
import { startPhoneVerification } from "@/lib/twilio/verify";

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

  const rawPhone = body && typeof body === "object" && typeof (body as Record<string, unknown>).phone === "string"
    ? normalizePhone((body as Record<string, string>).phone)
    : "";

  if (!/^\+\d{10,15}$/.test(rawPhone)) {
    return NextResponse.json({ error: "Enter a valid phone number in international format." }, { status: 400 });
  }

  try {
    await startPhoneVerification(rawPhone);
  } catch (error) {
    console.error("[twilio/verify/start]", error);
    return NextResponse.json({ error: "Couldn't send a verification code right now." }, { status: 502 });
  }

  const { settings } = await getCollections();
  const defaults = createDefaultUserSettings("UTC");
  const { pendingPhone: _pendingPhone, ...insertDefaults } = defaults;

  await settings.updateOne(
    { userId: user.mongoId },
    {
      $set: {
        pendingPhone: rawPhone,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        userId: user.mongoId,
        ...insertDefaults,
      },
    },
    { upsert: true },
  );

  return NextResponse.json({ ok: true, pendingPhone: rawPhone });
}
