"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";

/* ─── Demo data — replaced by real API calls in Phase 3 ─────────────────── */

type ToatKind = "task" | "event" | "meeting" | "errand" | "deadline" | "idea";
type ToatTier = "urgent" | "important" | "regular";

interface DemoToat {
  id: string;
  kind: ToatKind;
  tier: ToatTier;
  title: string;
  time: string;
  location?: string;
  link?: string;
  day: "today" | "tomorrow" | "later";
  isUpNext?: boolean;
}

const NOW = new Date();
const todayStr = () =>
  NOW.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const DEMO_TOATS: DemoToat[] = [
  {
    id: "1",
    kind: "meeting",
    tier: "important",
    title: "Team standup",
    time: "11:00 AM",
    location: "Google Meet",
    link: "https://meet.google.com",
    day: "today",
    isUpNext: true,
  },
  {
    id: "2",
    kind: "task",
    tier: "regular",
    title: "Call Mom",
    time: "3:00 PM",
    day: "today",
  },
  {
    id: "3",
    kind: "errand",
    tier: "urgent",
    title: "Dentist appointment",
    time: "9:00 AM",
    location: "Smile Care Clinic, Madison Ave",
    day: "tomorrow",
  },
  {
    id: "4",
    kind: "task",
    tier: "regular",
    title: "Grocery run — weekly shop",
    time: "5:30 PM",
    location: "Trader Joe's",
    day: "tomorrow",
  },
  {
    id: "5",
    kind: "event",
    tier: "important",
    title: "Taylor Swift — Madison Square Garden",
    time: "7:30 PM",
    location: "MSG, New York",
    day: "later",
  },
];

/* ─── Kind metadata ──────────────────────────────────────────────────────── */

const KIND_META: Record<ToatKind, { icon: string; color: string; bg: string }> = {
  task:     { icon: "✓",  color: "#6366F1", bg: "#EDE9FE" },
  event:    { icon: "🎫", color: "#7C3AED", bg: "#F3E8FF" },
  meeting:  { icon: "💬", color: "#2563EB", bg: "#DBEAFE" },
  errand:   { icon: "📍", color: "#D97706", bg: "#FEF3C7" },
  deadline: { icon: "⚡", color: "#DC2626", bg: "#FEE2E2" },
  idea:     { icon: "💡", color: "#059669", bg: "#D1FAE5" },
};

const TIER_COLOR: Record<ToatTier, string> = {
  urgent:    "#EF4444",
  important: "#F59E0B",
  regular:   "#D1D5DB",
};

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function TimelinePage() {
  const router = useRouter();

  const upNext = DEMO_TOATS.find((t) => t.isUpNext);
  const todayToats = DEMO_TOATS.filter((t) => t.day === "today" && !t.isUpNext);
  const tomorrowToats = DEMO_TOATS.filter((t) => t.day === "tomorrow");
  const laterToats = DEMO_TOATS.filter((t) => t.day === "later");

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <TopNav />

      <main style={styles.main}>
        {/* ── Header ── */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Your Timeline</h1>
            <p style={styles.pageDate}>
              {NOW.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => router.push("/capture")}
            style={styles.captureHeaderBtn}
            aria-label="New capture"
          >
            <MicIcon size={16} color="#fff" /> Capture
          </button>
        </div>

        {/* ── Up Next card ── */}
        {upNext && (
          <div style={styles.upNextCard} className="animate-fade-up">
            <div style={styles.upNextLabel}>
              <span style={{ fontSize: 14 }}>⚡</span> Up Next
            </div>
            <div style={styles.upNextBody}>
              <div style={styles.upNextKindBadge}>
                <span style={{ fontSize: 18 }}>
                  {KIND_META[upNext.kind].icon}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={styles.upNextTitle}>{upNext.title}</p>
                <div style={styles.upNextMeta}>
                  <span>🕐 {upNext.time}</span>
                  {upNext.location && <span>· {upNext.location}</span>}
                </div>
              </div>
              {upNext.link && (
                <a
                  href={upNext.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.upNextAction}
                >
                  Join →
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Today ── */}
        {todayToats.length > 0 && (
          <Section label="Today">
            {todayToats.map((t) => (
              <ToatCard key={t.id} toat={t} />
            ))}
          </Section>
        )}

        {/* ── Tomorrow ── */}
        {tomorrowToats.length > 0 && (
          <Section label="Tomorrow">
            {tomorrowToats.map((t) => (
              <ToatCard key={t.id} toat={t} />
            ))}
          </Section>
        )}

        {/* ── This week ── */}
        {laterToats.length > 0 && (
          <Section label="This week">
            {laterToats.map((t) => (
              <ToatCard key={t.id} toat={t} />
            ))}
          </Section>
        )}

        {/* ── Empty state ── */}
        {DEMO_TOATS.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎤</div>
            <p style={styles.emptyTitle}>You&apos;re all clear.</p>
            <p style={styles.emptySubtext}>
              Tap the mic to tell Toatre what&apos;s on your mind.
            </p>
            <button
              onClick={() => router.push("/capture")}
              style={styles.emptyBtn}
            >
              <MicIcon size={16} color="#fff" /> Start capturing
            </button>
          </div>
        )}

        {/* Spacer so FAB doesn't overlap last item */}
        <div style={{ height: 100 }} />
      </main>

      {/* ── Floating capture button ── */}
      <button
        onClick={() => router.push("/capture")}
        style={styles.fab}
        aria-label="Open mic capture"
      >
        <MicIcon size={24} color="#fff" />
      </button>
    </div>
  );
}

/* ─── Section ─────────────────────────────────────────────────────────────── */

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={styles.sectionLabel}>{label}</p>
      <div style={styles.sectionList}>{children}</div>
    </div>
  );
}

/* ─── ToatCard ────────────────────────────────────────────────────────────── */

function ToatCard({ toat }: { toat: DemoToat }) {
  const meta = KIND_META[toat.kind];
  return (
    <div style={styles.toatCard}>
      {/* Tier indicator */}
      <div
        style={{
          ...styles.tierDot,
          background: TIER_COLOR[toat.tier],
        }}
      />
      {/* Kind icon */}
      <div
        style={{
          ...styles.kindIcon,
          background: meta.bg,
          color: meta.color,
        }}
      >
        {meta.icon}
      </div>
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={styles.toatTitle}>{toat.title}</p>
        <div style={styles.toatMeta}>
          <span style={styles.toatTime}>{toat.time}</span>
          {toat.location && (
            <span style={styles.toatLocation}>· {toat.location}</span>
          )}
        </div>
      </div>
      {/* Chevron */}
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M6 4l4 4-4 4"
          stroke="var(--color-text-muted)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ─── Mic icon ────────────────────────────────────────────────────────────── */

function MicIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x={9} y={2} width={6} height={12} rx={3} fill={color} />
      <path
        d="M5 10a7 7 0 0 0 14 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line x1={12} y1={17} x2={12} y2={22} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={8} y1={22} x2={16} y2={22} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "24px 20px",
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "var(--color-text)",
    lineHeight: 1.15,
    marginBottom: 4,
  },
  pageDate: {
    fontSize: 14,
    color: "var(--color-text-secondary)",
  },
  captureHeaderBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "linear-gradient(135deg, #6366F1, #7C3AED)",
    border: "none",
    borderRadius: 20,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
    boxShadow: "0 2px 12px rgba(99,102,241,0.25)",
  },
  upNextCard: {
    background: "linear-gradient(135deg, #EDE9FE, #E0E7FF)",
    border: "1.5px solid rgba(99,102,241,0.2)",
    borderRadius: 20,
    padding: "18px 20px",
    marginBottom: 28,
    boxShadow: "0 4px 20px rgba(99,102,241,0.10)",
  },
  upNextLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 700,
    color: "#6366F1",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 12,
  },
  upNextBody: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  upNextKindBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(99,102,241,0.15)",
  },
  upNextTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "var(--color-text)",
    marginBottom: 4,
  },
  upNextMeta: {
    display: "flex",
    gap: 6,
    fontSize: 13,
    color: "var(--color-text-secondary)",
    flexWrap: "wrap",
  },
  upNextAction: {
    padding: "8px 16px",
    background: "#6366F1",
    borderRadius: 20,
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
    paddingLeft: 4,
  },
  sectionList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 20,
  },
  toatCard: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: 16,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    transition: "box-shadow 0.15s, transform 0.1s",
    boxShadow: "0 1px 4px rgba(99,102,241,0.05)",
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    flexShrink: 0,
  },
  kindIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 17,
    flexShrink: 0,
  },
  toatTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "var(--color-text)",
    marginBottom: 3,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  toatMeta: {
    display: "flex",
    gap: 6,
    fontSize: 12,
    color: "var(--color-text-secondary)",
    flexWrap: "wrap",
  },
  toatTime: { fontWeight: 600, color: "var(--color-primary)" },
  toatLocation: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 200,
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--color-text)",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "var(--color-text-secondary)",
    marginBottom: 24,
    lineHeight: 1.5,
  },
  emptyBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 24px",
    background: "linear-gradient(135deg, #6366F1, #7C3AED)",
    border: "none",
    borderRadius: 20,
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
  },
  fab: {
    position: "fixed",
    bottom: 28,
    right: 28,
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366F1, #EC4899)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 6px 24px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.12)",
    zIndex: 40,
    transition: "transform 0.15s, box-shadow 0.15s",
  },
};
