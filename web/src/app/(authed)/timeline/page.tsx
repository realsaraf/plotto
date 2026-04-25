import { getAppRouterSession } from "@/lib/auth/session";
import { getCollections } from "@/lib/mongo/collections";

export default async function TimelinePage() {
  const session = await getAppRouterSession();

  let displayName: string | null = null;
  if (session.firebaseUid) {
    const { users } = await getCollections();
    const mongoUser = await users.findOne({ firebaseUid: session.firebaseUid });
    displayName =
      (mongoUser?.displayName as string | null) ??
      (mongoUser?.email as string | null) ??
      null;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-full px-6 py-16">
      {/* Greeting */}
      {displayName && (
        <p
          className="text-sm mb-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          Hey, {displayName}.
        </p>
      )}

      {/* Empty state */}
      <p
        className="text-xl font-medium text-center mb-2"
        style={{ color: "var(--color-text)" }}
      >
        Nothing on the books.
      </p>
      <p
        className="text-base text-center mb-12"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Enjoy the quiet.
      </p>

      {/* Capture mic button placeholder */}
      <button
        disabled
        aria-label="Capture — coming in Phase 2"
        className="w-20 h-20 rounded-full flex items-center justify-center text-sm font-semibold cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))",
          color: "#fff",
          opacity: 0.8,
        }}
      >
        Capture
      </button>
      <p
        className="mt-3 text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        Mic capture coming soon.
      </p>
    </main>
  );
}
