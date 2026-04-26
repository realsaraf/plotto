import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { getCollections } from "@/lib/mongo/collections";

/** POST /api/auth/profile — set or update the user's handle */
export async function POST(req: NextRequest) {
  const { user, errorResponse } = await requireUser(req);
  if (errorResponse) return errorResponse;

  const body = (await req.json()) as { handle?: string };
  const rawHandle = (body.handle ?? "").toLowerCase().trim();

  if (!rawHandle || rawHandle.length < 2 || rawHandle.length > 20) {
    return NextResponse.json(
      { error: "Handle must be 2–20 characters" },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9_]+$/.test(rawHandle)) {
    return NextResponse.json(
      { error: "Handle may only contain letters, numbers, and underscores" },
      { status: 400 }
    );
  }

  const { users } = await getCollections();

  // Check uniqueness
  const existing = await users.findOne({ handle: rawHandle });
  if (existing && existing.firebaseUid !== user.uid) {
    return NextResponse.json({ error: "Handle is already taken" }, { status: 409 });
  }

  await users.updateOne(
    { firebaseUid: user.uid },
    { $set: { handle: rawHandle, updatedAt: new Date() } }
  );

  return NextResponse.json({ ok: true, handle: rawHandle });
}
