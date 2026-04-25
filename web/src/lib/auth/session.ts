import { getIronSession, type IronSession } from "iron-session";
import { type IncomingMessage, type ServerResponse } from "http";
import { cookies } from "next/headers";

export interface SessionData {
  firebaseUid: string;
  userId: string;
  email: string;
}

export const SESSION_COOKIE_NAME = "toatre_session";

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

function getSessionPassword(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET env var must be set and at least 32 characters long."
    );
  }
  return secret;
}

/** Shared session options (password is resolved lazily to avoid build-time errors). */
function makeSessionOptions() {
  return {
    cookieName: SESSION_COOKIE_NAME,
    password: getSessionPassword(),
    ttl: SESSION_TTL,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    },
  };
}

/** Get an iron-session from a Node.js req/res pair (Pages Router / legacy). */
export async function getSession(
  req: IncomingMessage,
  res: ServerResponse
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req, res, makeSessionOptions());
}

/** Read/write session via Next.js App Router cookies() (Route Handlers & Server Components). */
export async function getAppRouterSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, makeSessionOptions());
}
