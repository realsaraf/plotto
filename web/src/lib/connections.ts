import { ObjectId, type WithId, type Document } from "mongodb";
import { z } from "zod";

const nullableTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().max(240).nullable().optional(),
);

export const ConnectionInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  relationship: z.string().trim().min(1).max(80),
  phone: nullableTrimmedString,
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().email().max(240).nullable().optional(),
  ),
  handle: nullableTrimmedString,
  notes: nullableTrimmedString,
});

export const ConnectionPatchSchema = ConnectionInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required.",
);

export type ConnectionInput = z.infer<typeof ConnectionInputSchema>;

export interface SerializedConnection {
  id: string;
  name: string;
  relationship: string;
  phone: string | null;
  email: string | null;
  handle: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function normalizeHandle(value: string | null | undefined): string | null {
  const trimmed = value?.trim().replace(/^@+/, "") ?? "";
  return trimmed ? trimmed : null;
}

export function connectionDoc(ownerId: ObjectId, input: ConnectionInput, now: Date) {
  return {
    ownerId,
    name: input.name.trim(),
    relationship: input.relationship.trim(),
    phone: input.phone?.trim() || null,
    email: input.email?.trim().toLowerCase() || null,
    handle: normalizeHandle(input.handle),
    notes: input.notes?.trim() || null,
    createdAt: now,
    updatedAt: now,
  };
}

export function connectionPatch(input: Partial<ConnectionInput>, now: Date) {
  const patch: Record<string, unknown> = { updatedAt: now };
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.relationship !== undefined) patch.relationship = input.relationship.trim();
  if (input.phone !== undefined) patch.phone = input.phone?.trim() || null;
  if (input.email !== undefined) patch.email = input.email?.trim().toLowerCase() || null;
  if (input.handle !== undefined) patch.handle = normalizeHandle(input.handle);
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null;
  return patch;
}

export function serializeConnection(doc: WithId<Document>): SerializedConnection {
  return {
    id: doc._id.toString(),
    name: typeof doc.name === "string" ? doc.name : "Connection",
    relationship: typeof doc.relationship === "string" ? doc.relationship : "family",
    phone: typeof doc.phone === "string" ? doc.phone : null,
    email: typeof doc.email === "string" ? doc.email : null,
    handle: typeof doc.handle === "string" ? doc.handle : null,
    notes: typeof doc.notes === "string" ? doc.notes : null,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : new Date().toISOString(),
  };
}

export function buildConnectionContext(connections: SerializedConnection[]): string {
  if (!connections.length) {
    return "User connections: none saved yet.";
  }

  const lines = connections.slice(0, 50).map((connection) => {
    const details = [
      `name: ${connection.name}`,
      `relationship: ${connection.relationship}`,
      connection.phone ? `phone: ${connection.phone}` : null,
      connection.email ? `email: ${connection.email}` : null,
      connection.handle ? `handle: @${connection.handle}` : null,
      connection.notes ? `notes: ${connection.notes}` : null,
    ].filter(Boolean);
    return `- ${details.join("; ")}`;
  });

  return [
    "User connections for resolving family/member references:",
    ...lines,
    "When the transcript mentions a relationship such as mom, dad, spouse, son, daughter, brother, sister, or a saved name, use the matching connection. Put the connection's name in people. If a phone number is relevant for a call or message toat, include it in notes as `Phone: <number>`.",
  ].join("\n");
}