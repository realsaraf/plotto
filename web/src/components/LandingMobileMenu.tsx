"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#usecases", label: "Use cases" },
  { href: "#pricing", label: "Pricing" },
  { href: "#blog", label: "Blog" },
];

export function LandingMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        className="landing-menu-button"
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="landing-mobile-menu"
        style={styles.button}
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isOpen ? (
        <div style={styles.backdrop} onClick={() => setIsOpen(false)}>
          <div
            id="landing-mobile-menu"
            role="dialog"
            aria-label="Mobile navigation"
            style={styles.panel}
            onClick={(event) => event.stopPropagation()}
          >
            <nav style={styles.links}>
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  style={styles.link}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div style={styles.actions}>
              <Link href="/login" style={styles.login} onClick={() => setIsOpen(false)}>
                Log in
              </Link>
              <Link href="/signup" style={styles.signup} onClick={() => setIsOpen(false)}>
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function MenuIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    border: "1px solid rgba(79,70,229,0.16)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.76)",
    color: "#0C183E",
    boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    padding: "84px 20px 20px",
    background: "rgba(12,24,62,0.22)",
    backdropFilter: "blur(14px)",
  },
  panel: {
    width: "100%",
    border: "1px solid rgba(79,70,229,0.16)",
    borderRadius: 24,
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
    padding: 20,
  },
  links: {
    display: "grid",
    gap: 8,
  },
  link: {
    padding: "14px 12px",
    borderRadius: 14,
    color: "#131B3F",
    textDecoration: "none",
    fontSize: 17,
    fontWeight: 700,
  },
  actions: {
    display: "grid",
    gap: 12,
    marginTop: 18,
    paddingTop: 18,
    borderTop: "1px solid rgba(79,70,229,0.12)",
  },
  login: {
    display: "flex",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(79,70,229,0.16)",
    borderRadius: 16,
    color: "#111827",
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 700,
  },
  signup: {
    display: "flex",
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)",
    color: "#fff",
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 800,
    boxShadow: "0 12px 28px rgba(79,70,229,0.22)",
  },
};