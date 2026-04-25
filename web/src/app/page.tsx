import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-5xl font-bold tracking-tight mb-3 brand-gradient-text">
          toatre
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Your mic-first personal timeline. Speak — Toatre handles the rest.
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          Coming soon to iOS and Android.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 rounded-xl font-semibold text-sm"
          style={{
            background: "linear-gradient(90deg, var(--color-gradient-start), var(--color-gradient-end))",
            color: "#fff",
          }}
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}