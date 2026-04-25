import { NextResponse } from "next/server";
import { getAppRouterSession } from "@/lib/auth/session";

export async function POST(): Promise<NextResponse> {
  const session = await getAppRouterSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
