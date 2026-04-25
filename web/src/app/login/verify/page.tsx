"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { verifyEmailMagicLink } from "@/lib/firebase/client";

export default function MagicLinkVerifyPage() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    async function verify() {
      try {
        const credential = await verifyEmailMagicLink();
        const idToken = await credential.user.getIdToken();
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        router.replace("/timeline");
      } catch {
        setError(true);
      }
    }
    verify();
  }, [router]);

  if (error) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "var(--color-bg)" }}
      >
        <p className="text-base mb-4" style={{ color: "var(--color-text)" }}>
          That link has expired or isn&apos;t valid.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium"
          style={{ color: "var(--color-gradient-start)" }}
        >
          Try signing in again
        </Link>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--color-bg)" }}
    >
      <p style={{ color: "var(--color-text-muted)" }}>Just a moment…</p>
    </main>
  );
}
