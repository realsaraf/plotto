import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { getCollections } from "@/lib/mongo/collections";
import { getAppRouterSession } from "@/lib/auth/session";
import type { DbUser } from "@/types/db";

export interface AuthenticatedUser {
  uid: string;           // Firebase UID
  email: string | null;
  mongoId: string;       // MongoDB _id as string
  dbUser: DbUser;
}

/**
 * Verify the Firebase ID token from the Authorization header OR from the
 * iron-session cookie. Upserts the user in MongoDB and returns the typed user.
 *
 * Usage in Route Handlers:
 *   const { user, errorResponse } = await requireUser(request);
 *   if (errorResponse) return errorResponse;
 */
export async function requireUser(
  request: NextRequest
): Promise<{ user: AuthenticatedUser; errorResponse: null } | { user: null; errorResponse: NextResponse }> {
  let idToken: string | null = null;

  // 1. Try Authorization: Bearer <token>
  const authorization = request.headers.get("Authorization");
  if (authorization?.startsWith("Bearer ")) {
    idToken = authorization.slice(7);
  }

  // 2. Fall back to session cookie
  if (!idToken) {
    try {
      const session = await getAppRouterSession();
      if (session.firebaseUid) {
        const { users } = await getCollections();
        const mongoUser = await users.findOne({ firebaseUid: session.firebaseUid });
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
          return {
            user: {
              uid: session.firebaseUid,
              email: dbUser.email ?? null,
              mongoId: dbUser._id,
              dbUser,
            },
            errorResponse: null,
          };
        }
      }
    } catch {
      // Session read failed — fall through to 401
    }
  }

  if (!idToken) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 }
      ),
    };
  }

  let decodedToken;
  try {
    decodedToken = await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  const { users } = await getCollections();
  let mongoUser = await users.findOne({ firebaseUid: decodedToken.uid });

  if (!mongoUser) {
    const now = new Date();
    const result = await users.insertOne({
      firebaseUid: decodedToken.uid,
      email: decodedToken.email ?? null,
      handle: null,
      displayName: decodedToken.name ?? null,
      photoUrl: decodedToken.picture ?? null,
      providers: decodedToken.firebase?.sign_in_provider
        ? [decodedToken.firebase.sign_in_provider]
        : [],
      fcmTokens: [],
      timezone: "UTC",
      createdAt: now,
      updatedAt: now,
    });
    mongoUser = await users.findOne({ _id: result.insertedId });
  }

  const dbUser: DbUser = {
    _id: mongoUser!._id.toString(),
    firebase_uid: mongoUser!.firebaseUid as string,
    email: (mongoUser!.email as string) ?? "",
    display_name: (mongoUser!.displayName as string | null) ?? null,
    handle: (mongoUser!.handle as string | null) ?? null,
    photo_url: (mongoUser!.photoUrl as string | null) ?? null,
    providers: (mongoUser!.providers as string[]) ?? [],
    fcm_tokens: (mongoUser!.fcmTokens as string[]) ?? [],
    timezone: (mongoUser!.timezone as string) ?? "UTC",
    created_at: mongoUser!.createdAt as Date,
    updated_at: mongoUser!.updatedAt as Date,
  };

  return {
    user: {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      mongoId: dbUser._id,
      dbUser,
    },
    errorResponse: null,
  };
}
