import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireUser } from "@/lib/auth/require-user";
import { getCollections } from "@/lib/mongo/collections";
import { ConnectionPatchSchema, connectionPatch, serializeConnection } from "@/lib/connections";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid connection id." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ConnectionPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid connection.", details: parsed.error.flatten() }, { status: 422 });
  }

  const { connections } = await getCollections();
  const saved = await connections.findOneAndUpdate(
    { _id: new ObjectId(id), ownerId: new ObjectId(user.mongoId) },
    { $set: connectionPatch(parsed.data, new Date()) },
    { returnDocument: "after" },
  );

  if (!saved) {
    return NextResponse.json({ error: "Connection not found." }, { status: 404 });
  }

  return NextResponse.json({ connection: serializeConnection(saved) });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid connection id." }, { status: 400 });
  }

  const { connections } = await getCollections();
  const result = await connections.deleteOne({ _id: new ObjectId(id), ownerId: new ObjectId(user.mongoId) });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Connection not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}