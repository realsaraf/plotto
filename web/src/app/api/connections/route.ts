import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireUser } from "@/lib/auth/require-user";
import { getCollections } from "@/lib/mongo/collections";
import { ConnectionInputSchema, connectionDoc, serializeConnection } from "@/lib/connections";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  const { connections } = await getCollections();
  const docs = await connections
    .find({ ownerId: new ObjectId(user.mongoId) })
    .sort({ relationship: 1, name: 1 })
    .limit(200)
    .toArray();

  return NextResponse.json({ connections: docs.map(serializeConnection) });
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireUser(request);
  if (errorResponse) return errorResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ConnectionInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid connection.", details: parsed.error.flatten() }, { status: 422 });
  }

  const { connections } = await getCollections();
  const now = new Date();
  const result = await connections.insertOne(connectionDoc(new ObjectId(user.mongoId), parsed.data, now));
  const saved = await connections.findOne({ _id: result.insertedId, ownerId: new ObjectId(user.mongoId) });

  return NextResponse.json({ connection: serializeConnection(saved!) }, { status: 201 });
}