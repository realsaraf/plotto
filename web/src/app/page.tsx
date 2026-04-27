// Root landing page — shown to unauthenticated visitors.
// Authenticated users are redirected to /timeline by proxy.ts.
import Link from "next/link";
import type { Metadata } from "next";
import { LandingMobileMenu } from "@/components/LandingMobileMenu";

export const metadata: Metadata = {
  title: "Toatre — Own your slice of time.",
  description:
    "Toatre turns what you say into toats: clear slices of your day you can manage, remember, and share.",
  openGraph: {
    title: "Toatre — Own your slice of time.",
    description: "Toatre turns what you say into toats: clear slices of your day you can manage, remember, and share.",
    url: "https://toatre.com",
    siteName: "Toatre",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Toatre app preview with the Toatre app icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toatre — Own your slice of time.",
    description: "Toatre turns what you say into toats: clear slices of your day you can manage, remember, and share.",
    images: ["/opengraph-image"],
  },
};

const mobileLandingCss = `
  .landing-menu-button {
    display: none !important;
  }

  @media (max-width: 760px) {
    .landing-nav {
      height: 72px !important;
      padding: 18px 24px 0 !important;
      align-items: center !important;
    }

    .landing-nav-links,
    .landing-nav-actions {
      display: none !important;
    }

    .landing-menu-button {
      display: inline-flex !important;
    }

    .landing-hero {
      grid-template-columns: 1fr !important;
      min-height: auto !important;
      gap: 34px !important;
      padding: 44px 28px 78px !important;
      overflow: hidden !important;
    }

    .landing-hero-left {
      max-width: 100% !important;
      padding-top: 0 !important;
    }

    .landing-hero-title {
      font-size: clamp(42px, 11vw, 54px) !important;
      line-height: 1.08 !important;
      letter-spacing: -0.035em !important;
      margin-bottom: 28px !important;
    }

    .landing-title-line {
      white-space: nowrap !important;
    }

    .landing-cta-row {
      align-items: flex-start !important;
      flex-direction: column !important;
      gap: 24px !important;
    }

    .landing-desktop-cta {
      display: none !important;
    }

    .landing-mobile-cta {
      display: flex !important;
    }

    .landing-hero-right {
      justify-content: center !important;
      padding-top: 8px !important;
      margin-top: 0 !important;
    }

    .landing-phone-frame {
      width: min(330px, 82vw) !important;
      border-radius: 42px !important;
    }
  }

  @media (max-width: 420px) {
    .landing-hero-title {
      font-size: clamp(39px, 10.4vw, 43px) !important;
    }
  }
`;

export default function LandingPage() {
  return (
    <div style={s.root}>
      <style>{mobileLandingCss}</style>
      {/* ─── Nav ──────────────────────────────────────────────────────── */}
      <header className="landing-nav" style={s.nav}>
        <Link href="/" style={s.logoWrap}>
          <ToatreLogo size={34} />
          <span style={s.logoText}>toatre</span>
        </Link>
        <nav className="landing-nav-links" style={s.navLinks}>
          <a href="#how" style={s.navLink}>How it works</a>
          <a href="#usecases" style={s.navLink}>Use cases</a>
          <a href="#pricing" style={s.navLink}>Pricing</a>
          <a href="#blog" style={s.navLink}>Blog</a>
        </nav>
        <div className="landing-nav-actions" style={s.navActions}>
          <Link href="/login" style={s.loginLink}>Log in</Link>
          <Link href="/signup" style={s.signupBtn}>Sign up free</Link>
        </div>
        <LandingMobileMenu />
      </header>

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="landing-hero" style={s.hero}>
        <div style={s.heroScene} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mountains.png" alt="" style={s.heroSceneImage} />
        </div>

        {/* Left column */}
        <div className="landing-hero-left" style={s.heroLeft}>
          <div style={s.badge}>
            <SparkleIcon />
            Voice-first. Time-owned.
          </div>

          <h1 className="landing-hero-title" style={s.h1}>
            Own your slice<br />
            <span className="landing-title-line">of time<span style={s.h1Dot}>.</span></span>
          </h1>

          <p style={s.sub}>
            Toatre turns what you say into toats:<br />
            clear slices of your day you can manage, remember, and share.
          </p>

          <div className="landing-cta-row landing-desktop-cta" style={s.ctaRow}>
            <Link href="/signup" style={s.ctaPrimary}>
              Sign up for free
              <ArrowRight />
            </Link>
            <a href="#how" style={s.ctaSecondary}>
              <PlayIcon />
              Watch how it works
            </a>
          </div>
          <p className="landing-desktop-cta" style={s.noCc}>No credit card required.</p>
        </div>

        {/* Right column — phone */}
        <div className="landing-hero-right" style={s.heroRight}>
          <PhoneMockup />
        </div>

        <div className="landing-mobile-cta" style={s.mobileCta}>
          <div className="landing-cta-row" style={s.ctaRow}>
            <Link href="/signup" style={s.ctaPrimary}>
              Sign up for free
              <ArrowRight />
            </Link>
            <a href="#how" style={s.ctaSecondary}>
              <PlayIcon />
              Watch how it works
            </a>
          </div>
          <p style={s.noCc}>No credit card required.</p>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────── */}
      <section id="how" style={s.section}>
        <p style={s.sectionLabel}>How it works</p>
        <h2 style={s.sectionTitle}>Three steps. Zero friction.</h2>
        <div style={s.steps}>
          {[
            {
              num: "01",
              title: "Say the slice.",
              body: "Tap the mic and say whatever's on your mind: a meeting, an errand, a deadline, or an idea. Natural language. No forms.",
            },
            {
              num: "02",
              title: "We shape it.",
              body: "Toatre parses your words, extracts each toat, assigns kinds and times, and places every slice on your timeline.",
            },
            {
              num: "03",
              title: "You own it.",
              body: "Smart Pings surface each toat when it matters, so the important slices of your day stay in reach.",
            },
          ].map((step) => (
            <div key={step.num} style={s.stepCard}>
              <span style={s.stepNum}>{step.num}</span>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepBody}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Use cases ────────────────────────────────────────────────── */}
      <section id="usecases" style={s.sectionAlt}>
        <p style={s.sectionLabel}>Use cases</p>
        <h2 style={s.sectionTitle}>Every part of life has a slice.</h2>
        <div style={s.useCaseGrid}>
          {[
            {
              icon: "💼",
              title: "Work",
              items: [
                "\"Standup at 11, then deep work block until 3.\"",
                "\"Email Sarah the proposal before EOD.\"",
                "\"Follow up with the design team next Tuesday.\"",
              ],
            },
            {
              icon: "🏠",
              title: "Family",
              items: [
                "\"Pick up Emma at 4pm from soccer practice.\"",
                "\"Dentist for the kids, Thursday 9am.\"",
                "\"Groceries — milk, eggs, pasta, olive oil.\"",
              ],
            },
            {
              icon: "✦",
              title: "Personal",
              items: [
                "\"Gym at 7am tomorrow, don't let me skip.\"",
                "\"Book Taylor Swift tickets — sale ends Friday.\"",
                "\"Call Dad on Sunday afternoon.\"",
              ],
            },
          ].map((uc) => (
            <div key={uc.title} style={s.useCaseCard}>
              <span style={s.useCaseIcon}>{uc.icon}</span>
              <h3 style={s.useCaseTitle}>{uc.title}</h3>
              <ul style={s.useCaseList}>
                {uc.items.map((item) => (
                  <li key={item} style={s.useCaseItem}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ──────────────────────────────────────────────────── */}
      <section id="pricing" style={s.section}>
        <p style={s.sectionLabel}>Pricing</p>
        <h2 style={s.sectionTitle}>Free while in beta.</h2>
        <p style={s.pricingBody}>
          Toatre is completely free during the beta period. Sign up now and lock
          in early-access pricing when we launch paid tiers.
        </p>
        <Link href="/signup" style={{ ...s.ctaPrimary, marginTop: 8 }}>
          Get early access free <ArrowRight />
        </Link>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────────────── */}
      <section style={s.ctaSection}>
        <div style={s.ctaBox}>
          <h2 style={s.ctaTitle}>Ready to own your slice?</h2>
          <p style={s.ctaSub}>Say it once. Toatre keeps it where it belongs.</p>
          <Link href="/signup" style={s.ctaPrimaryLarge}>
            Sign up free <ArrowRight />
          </Link>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 12 }}>
            No credit card required.
          </p>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer style={s.footer}>
        <Link href="/" style={s.footerLogo}>
          <ToatreLogo size={22} />
          <span style={s.footerLogoText}>toatre</span>
        </Link>
        <div style={s.footerLinks}>
          <Link href="/privacy" style={s.footerLink}>Privacy</Link>
          <Link href="/tos" style={s.footerLink}>Terms</Link>
          <a href="mailto:contact@toatre.com" style={s.footerLink}>Contact</a>
        </div>
        <p style={s.footerCopy}>© 2026 Toatre. All rights reserved.</p>
      </footer>
    </div>
  );
}

/* ─── Phone mockup ───────────────────────────────────────────────────────── */

function PhoneMockup() {
  return (
    <div style={pm.wrap}>
      {/* Outer frame */}
      <div className="landing-phone-frame" style={pm.frame}>
        {/* Status bar */}
        <div style={pm.statusBar}>
          <span style={pm.time}>9:41</span>
          <div style={pm.statusIcons}>
            <SignalIcon />
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>

        {/* Dynamic island */}
        <div style={pm.island} />

        <div style={pm.screen}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/phone-splash.png" alt="" style={pm.splashImage} aria-hidden />
        </div>
      </div>

      {/* Reflection glow */}
      <div style={pm.glow} />
    </div>
  );
}

/* ─── Inline SVG logos & icons ───────────────────────────────────────────── */

function ToatreLogo({ size = 36 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icon.png"
      alt=""
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        objectFit: "cover",
        display: "block",
      }}
      aria-hidden
    />
  );
}

function SparkleIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.5 1.5M9.5 9.5l1.5 1.5M11 3l-1.5 1.5M4.5 9.5L3 11" stroke="#6366F1" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden style={{ marginLeft: 4 }}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx={10} cy={10} r={9} stroke="#374151" strokeWidth={1.5} />
      <path d="M8 7l6 3-6 3V7z" fill="#374151" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg width={16} height={12} viewBox="0 0 16 12" fill="none" aria-hidden>
      <rect x={0} y={8} width={3} height={4} rx={0.5} fill="#111" />
      <rect x={4.5} y={5} width={3} height={7} rx={0.5} fill="#111" />
      <rect x={9} y={2} width={3} height={10} rx={0.5} fill="#111" />
      <rect x={13.5} y={0} width={2.5} height={12} rx={0.5} fill="#111" opacity="0.3" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width={16} height={12} viewBox="0 0 16 12" fill="none" aria-hidden>
      <path d="M8 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill="#111" />
      <path d="M3.5 7a6.5 6.5 0 0 1 9 0" stroke="#111" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M1 4.5a10 10 0 0 1 14 0" stroke="#111" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width={24} height={12} viewBox="0 0 24 12" fill="none" aria-hidden>
      <rect x={0.5} y={0.5} width={20} height={11} rx={2.5} stroke="#111" strokeWidth={1} />
      <rect x={2} y={2} width={14} height={8} rx={1.5} fill="#111" />
      <path d="M22 4v4a2 2 0 0 0 0-4z" fill="#111" />
    </svg>
  );
}

/* ─── Phone mockup styles ─────────────────────────────────────────────────── */

const pm: Record<string, React.CSSProperties> = {
  wrap: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    paddingBottom: 34,
  },
  frame: {
    position: "relative",
    width: "min(352px, 88vw)",
    maxWidth: "100%",
    aspectRatio: "352 / 700",
    borderRadius: 48,
    background: "#FFFDFE",
    border: "6px solid #14151B",
    boxShadow: "0 34px 80px rgba(8, 21, 62, 0.18), 0 2px 0 rgba(255,255,255,0.5) inset, 0 0 0 1px rgba(17,24,39,0.05)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  statusBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px 0",
  },
  time: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111",
    fontVariantNumeric: "tabular-nums",
  },
  statusIcons: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  island: {
    position: "absolute",
    top: 12,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 20,
    width: 108,
    height: 29,
    borderRadius: 15,
    background: "#0D0D1A",
  },
  screen: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    background: "#fff",
  },
  splashImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
  },
  glow: {
    position: "absolute",
    bottom: -14,
    left: "50%",
    transform: "translateX(-50%)",
    width: 320,
    height: 42,
    borderRadius: "50%",
    background: "rgba(167, 139, 250, 0.24)",
    filter: "blur(20px)",
    pointerEvents: "none",
  },
};

/* ─── Page styles ─────────────────────────────────────────────────────────── */

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #FFFFFF 0%, #FFF9FF 42%, #FBF5FF 100%)",
    color: "#111827",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
    overflowX: "hidden",
  },

  /* Nav */
  nav: {
    position: "relative",
    zIndex: 50,
    maxWidth: 1440,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "28px 48px 0",
    height: 84,
    background: "transparent",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
  },
  logoText: {
    fontSize: 23,
    fontWeight: 800,
    color: "#0C183E",
    letterSpacing: "-0.02em",
  },
  navLinks: {
    display: "flex",
    gap: 36,
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
  },
  navLink: {
    fontSize: 15,
    color: "#131B3F",
    textDecoration: "none",
    fontWeight: 500,
    transition: "color 0.15s",
  },
  navActions: { display: "flex", alignItems: "center", gap: 24 },
  loginLink: {
    fontSize: 15,
    color: "#111827",
    textDecoration: "none",
    fontWeight: 500,
  },
  signupBtn: {
    fontSize: 15,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)",
    padding: "14px 28px",
    borderRadius: 18,
    boxShadow: "0 10px 24px rgba(79,70,229,0.22)",
  },

  /* Hero — two column */
  hero: {
    position: "relative",
    maxWidth: 1440,
    margin: "0 auto",
    padding: "42px 48px 96px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    alignItems: "start",
    gap: 48,
    minHeight: "calc(100vh - 84px)",
    isolation: "isolate",
  },
  heroScene: {
    position: "absolute",
    left: "50%",
    bottom: 0,
    width: "100vw",
    transform: "translateX(-50%)",
    zIndex: 0,
    pointerEvents: "none",
  },
  heroSceneImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    position: "relative",
    zIndex: 2,
    maxWidth: 560,
    paddingTop: 30,
  },
  heroRight: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    zIndex: 2,
    paddingTop: 16,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 16px",
    background: "rgba(237, 233, 254, 0.68)",
    border: "1px solid rgba(99,102,241,0.12)",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 600,
    color: "#6366F1",
    marginBottom: 28,
  },
  h1: {
    fontSize: "clamp(56px, 6vw, 88px)",
    fontWeight: 800,
    lineHeight: 1.02,
    color: "#07133F",
    letterSpacing: "-0.045em",
    marginBottom: 28,
  },
  h1Dot: {
    color: "#FF6B8E",
    fontWeight: 900,
  },
  sub: {
    fontSize: 18,
    lineHeight: 1.7,
    color: "#56637B",
    marginBottom: 40,
    maxWidth: 460,
  },
  ctaRow: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  mobileCta: {
    display: "none",
    flexDirection: "column",
    alignItems: "flex-start",
    position: "relative",
    zIndex: 2,
  },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "18px 34px",
    background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 18,
    borderRadius: 18,
    boxShadow: "0 16px 32px rgba(79,70,229,0.20)",
  },
  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    padding: "6px 0",
    color: "#131B3F",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: 18,
  },
  noCc: {
    fontSize: 14,
    color: "#7C869A",
    marginBottom: 0,
  },

  /* Sections */
  section: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "96px 48px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  sectionAlt: {
    maxWidth: "100%",
    padding: "96px 48px",
    background: "#F0EEFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#6366F1",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 800,
    color: "#111827",
    letterSpacing: "-0.02em",
    marginBottom: 48,
    lineHeight: 1.15,
  },

  /* Steps */
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
    width: "100%",
    maxWidth: 900,
  },
  stepCard: {
    background: "#fff",
    border: "1px solid rgba(99,102,241,0.10)",
    borderRadius: 20,
    padding: "32px 28px",
    textAlign: "left",
    boxShadow: "0 2px 16px rgba(99,102,241,0.05)",
  },
  stepNum: {
    fontSize: 13,
    fontWeight: 800,
    color: "#6366F1",
    letterSpacing: "0.1em",
    display: "block",
    marginBottom: 14,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 12,
    letterSpacing: "-0.02em",
  },
  stepBody: { fontSize: 15, color: "#6B7280", lineHeight: 1.7 },

  /* Use cases */
  useCaseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
    width: "100%",
    maxWidth: 900,
  },
  useCaseCard: {
    background: "#fff",
    border: "1px solid rgba(99,102,241,0.12)",
    borderRadius: 20,
    padding: "28px 24px",
    textAlign: "left",
    boxShadow: "0 2px 12px rgba(99,102,241,0.05)",
  },
  useCaseIcon: { fontSize: 28, display: "block", marginBottom: 12 },
  useCaseTitle: { fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 14 },
  useCaseList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 },
  useCaseItem: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 1.6,
    paddingLeft: 16,
    borderLeft: "2px solid #EDE9FE",
    fontStyle: "italic",
  },

  /* Pricing */
  pricingBody: {
    fontSize: 17,
    color: "#6B7280",
    maxWidth: 480,
    lineHeight: 1.7,
    marginBottom: 32,
    textAlign: "center",
  },

  /* Final CTA */
  ctaSection: { padding: "0 48px", display: "flex", justifyContent: "center" },
  ctaBox: {
    width: "100%",
    maxWidth: 680,
    background: "linear-gradient(135deg, #6366F1, #7C3AED)",
    borderRadius: 28,
    padding: "64px 48px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    margin: "80px 0",
    boxShadow: "0 24px 80px rgba(99,102,241,0.30)",
  },
  ctaTitle: {
    fontSize: "clamp(28px, 4vw, 40px)",
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.02em",
    marginBottom: 12,
    lineHeight: 1.15,
  },
  ctaSub: { fontSize: 18, color: "rgba(255,255,255,0.75)", marginBottom: 32 },
  ctaPrimaryLarge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "16px 36px",
    background: "#fff",
    color: "#6366F1",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 17,
    borderRadius: 14,
    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
  },

  /* Footer */
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    padding: "28px 48px",
    borderTop: "1px solid rgba(0,0,0,0.07)",
    background: "#F8F7FF",
  },
  footerLogo: { display: "flex", alignItems: "center", gap: 8, textDecoration: "none" },
  footerLogoText: { fontSize: 16, fontWeight: 700, color: "#111827" },
  footerLinks: { display: "flex", gap: 24 },
  footerLink: { fontSize: 14, color: "#6B7280", textDecoration: "none" },
  footerCopy: { fontSize: 13, color: "#9CA3AF" },
};
