import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getCollections } from "@/lib/mongo/collections";
import { getAppRouterSession } from "@/lib/auth/session";
import type { DbUser } from "@/types/db";

const bodySchema = z.object({
  phone: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, "Phone number must be in E.164 format."),
  code: z.string().min(4).max(10),
  idToken: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { phone, code, idToken } = parsed.data;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    return NextResponse.json(
      { error: "Phone sign-in is not configured." },
      { status: 503 }
    );
  }

  const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationChecks`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: phone, Code: code }),
  });

  const twilioData = await res.json().catch(() => ({})) as Record<string, unknown>;

  if (!res.ok || twilioData.status !== "approved") {
    return NextResponse.json({ ok: false, verified: false });
  }

  // If a Firebase ID token was provided, create a session.
  if (idToken) {
    let decodedToken;
    try {
      decodedToken = await getAdminAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired ID token." },
        { status: 401 }
      );
    }

    const { users } = await getCollections();
    const now = new Date();

    await users.updateOne(
      { firebaseUid: decodedToken.uid },
      {
        $set: {
          email: decodedToken.email ?? null,
          displayName: decodedToken.name ?? null,
          photoUrl: decodedToken.picture ?? null,
          updatedAt: now,
        },
        $setOnInsert: {
          firebaseUid: decodedToken.uid,
          handle: null,
          providers: ["phone"],
          fcmTokens: [],
          timezone: "UTC",
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const mongoUser = await users.findOne({ firebaseUid: decodedToken.uid });
    if (mongoUser) {
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

      const session = await getAppRouterSession();
      session.firebaseUid = decodedToken.uid;
      session.userId = dbUser._id;
      session.email = dbUser.email;
      await session.save();
    }
  }

  return NextResponse.json({ ok: true, verified: true });
}
