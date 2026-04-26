"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export default function SignupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const sanitize = (v: string) =>
    v.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || handle.length < 2) return;
    setBusy(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ handle }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save handle");
      router.push("/timeline");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="Toatre" style={styles.logoIcon} />
          <span style={styles.logoText}>toatre</span>
        </div>

        {/* Steps indicator */}
        <div style={styles.steps}>
          <div style={{ ...styles.step, ...styles.stepDone }}>✓</div>
          <div style={styles.stepLine} />
          <div style={{ ...styles.step, ...styles.stepActive }}>2</div>
          <div style={styles.stepLine} />
          <div style={styles.step}>3</div>
        </div>

        <h1 style={styles.heading}>Pick your handle</h1>
        <p style={styles.subtext}>
          This is your unique @name — how others find and share with you.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <span style={styles.atSign}>@</span>
            <input
              type="text"
              placeholder="yourname"
              value={handle}
              onChange={(e) => setHandle(sanitize(e.target.value))}
              required
              minLength={2}
              maxLength={20}
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              style={styles.handleInput}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border-strong)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <p style={styles.hint}>
            {handle.length > 0 ? (
              <>
                <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                  @{handle}
                </span>{" "}
                · {handle.length}/20 characters
              </>
            ) : (
              "Letters, numbers, and underscores only. 2–20 characters."
            )}
          </p>

          <button
            type="submit"
            disabled={busy || handle.length < 2}
            style={{
              ...styles.submitBtn,
              opacity: busy || handle.length < 2 ? 0.55 : 1,
              cursor: busy || handle.length < 2 ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Saving…" : "Continue →"}
          </button>
        </form>

        <p style={styles.skipHint}>
          You can change your handle later in Settings.
        </p>
      </div>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon.png"
          alt=""
          style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 16 }}
        />
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--color-bg)",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "var(--color-card)",
    borderRadius: 24,
    padding: "40px 32px",
    boxShadow: "0 8px 48px rgba(99, 102, 241, 0.10)",
    border: "1px solid var(--color-border)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  logoIcon: { width: 36, height: 36, borderRadius: 9, objectFit: "cover" },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    background: "linear-gradient(90deg, #6366F1, #F59E0B)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  steps: {
    display: "flex",
    alignItems: "center",
    marginBottom: 28,
  },
  step: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "var(--color-bg-elevated)",
    border: "1.5px solid var(--color-border-strong)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-muted)",
  },
  stepDone: {
    background: "var(--color-primary)",
    border: "none",
    color: "#fff",
  },
  stepActive: {
    background: "var(--color-primary-light)",
    border: "2px solid var(--color-primary)",
    color: "var(--color-primary)",
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    background: "var(--color-border)",
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 6,
    color: "var(--color-text)",
  },
  subtext: {
    fontSize: 15,
    color: "var(--color-text-secondary)",
    marginBottom: 28,
    lineHeight: 1.5,
  },
  errorBox: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#DC2626",
    fontSize: 14,
    marginBottom: 16,
  },
  atSign: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-primary)",
    pointerEvents: "none",
  },
  handleInput: {
    width: "100%",
    padding: "13px 14px 13px 30px",
    border: "1.5px solid var(--color-border-strong)",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text)",
    background: "#FAFAFA",
    outline: "none",
    display: "block",
    transition: "border-color 0.15s, box-shadow 0.15s",
    letterSpacing: "0.01em",
  },
  hint: {
    fontSize: 13,
    color: "var(--color-text-muted)",
    marginBottom: 20,
    marginTop: 6,
  },
  submitBtn: {
    width: "100%",
    padding: "13px 16px",
    background: "linear-gradient(135deg, #6366F1, #7C3AED)",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
    display: "block",
    textAlign: "center",
    transition: "opacity 0.15s",
  },
  skipHint: {
    marginTop: 16,
    fontSize: 12,
    color: "var(--color-text-muted)",
    textAlign: "center",
  },
};
