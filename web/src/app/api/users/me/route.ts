import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { getCollections } from "@/lib/mongo/collections";
import type { DbUser } from "@/types/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { user, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  return NextResponse.json({ ok: true, user: user.dbUser });
}

const patchSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  handle: z
    .string()
    .regex(/^[a-zA-Z0-9_]{1,30}$/, "Handle must be 1–30 alphanumeric or underscore characters.")
    .optional(),
  timezone: z.string().min(1).max(60).optional(),
  photo_url: z.string().url().optional(),
});

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const { user, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const updates = parsed.data;
  const { users } = await getCollections();
  const now = new Date();

  const mongoUpdates: Record<string, unknown> = { updatedAt: now };
  if (updates.display_name !== undefined)
    mongoUpdates.displayName = updates.display_name;
  if (updates.handle !== undefined) mongoUpdates.handle = updates.handle;
  if (updates.timezone !== undefined) mongoUpdates.timezone = updates.timezone;
  if (updates.photo_url !== undefined) mongoUpdates.photoUrl = updates.photo_url;

  await users.updateOne(
    { firebaseUid: user.uid },
    { $set: mongoUpdates }
  );

  const mongoUser = await users.findOne({ firebaseUid: user.uid });
  if (!mongoUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const dbUser: DbUser = {
    _id: mongoUser._id.toString(),
    firebase_uid: mongoUser.firebaseUid as string,
    email: (mongoUser.email as string) ?? "",
    display_name: (mongoUser.displayName as string | null) ?? null,
    handle: (mongoUser.handle as string | null) ?? null,
    photo_url: (mongoUser.photoUrl as string | null) ?? null,
    providers: (mongoUser.providers as string[]) ?? [],
    fcm_tokens: (mongoUser.fcmTokens as string[]) ?? [],
    timezone: (mongoUser.timezone as string) ?? "UTC",
    created_at: mongoUser.createdAt as Date,
    updated_at: mongoUser.updatedAt as Date,
  };

  return NextResponse.json({ ok: true, user: dbUser });
}
