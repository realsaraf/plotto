"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

interface TopNavProps {
  /** Override the page title shown in the centre of the nav */
  title?: string;
}

export function TopNav({ title }: TopNavProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        {/* Left: Logo */}
        <Link href="/timeline" style={styles.logoLink}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="Toatre" style={styles.logoIcon} />
          <span style={styles.logoText}>toatre</span>
        </Link>

        {/* Centre: page title (optional) */}
        {title && <span style={styles.pageTitle}>{title}</span>}

        {/* Right: nav links + avatar */}
        <nav style={styles.nav}>
          <NavLink href="/timeline" active={pathname === "/timeline"}>
            Timeline
          </NavLink>

          {/* Avatar / profile menu (simple dropdown-free for Phase 1) */}
          {user && (
            <div style={styles.avatarWrap}>
              {user.photoURL ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? "Profile"}
                  style={styles.avatarImg}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div style={styles.avatarFallback}>{initials}</div>
              )}
              {/* Green online dot */}
              <span style={styles.onlineDot} aria-hidden />
              {/* Hidden sign-out — revealed on hover via title tooltip for now */}
              <button
                onClick={handleSignOut}
                title="Sign out"
                style={styles.signOutBtn}
                aria-label="Sign out"
              >
                ↩
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
        textDecoration: "none",
        padding: "6px 10px",
        borderRadius: 8,
        background: active ? "var(--color-primary-light)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      {children}
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(250, 250, 255, 0.88)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--color-border)",
  },
  inner: {
    maxWidth: 880,
    margin: "0 auto",
    padding: "0 20px",
    height: 60,
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  logoLink: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    flexShrink: 0,
  },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    objectFit: "cover",
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    background: "linear-gradient(90deg, #6366F1, #F59E0B)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  pageTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text)",
  },
  nav: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  avatarWrap: {
    position: "relative",
    marginLeft: 4,
    display: "flex",
    alignItems: "center",
  },
  avatarImg: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--color-border)",
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366F1, #7C3AED)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    border: "2px solid var(--color-border)",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#22C55E",
    border: "2px solid #fff",
  },
  signOutBtn: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    opacity: 0,
    fontSize: 0,
  },
};
