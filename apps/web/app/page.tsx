import Link from 'next/link';
import { redirect } from 'next/navigation';
import PlottoMark from '@/components/plotto-mark';
import { supabaseServer } from '@/lib/supabase/server';

export const metadata = {
  title: 'Plotto — Your life, plotted out.',
  description:
    'A calm timeline that captures every date, reminder, and thing-to-remember — and shows it back to you in plain language.',
};

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect('/timeline');

  return (
    <main className="min-h-screen bg-surface text-fg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <PlottoMark className="h-9 w-9 shrink-0" />
          <span className="text-lg font-semibold tracking-tight">Plotto</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted hover:text-fg"
          >
            Sign in
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg bg-fg px-3.5 py-2 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-10 sm:pt-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-coral-200 bg-accent-soft px-3 py-1 text-xs font-medium text-coral-700">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          Early preview
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Your life,{' '}
          <span className="relative inline-block">
            <span className="relative z-10">plotted out.</span>
            <span
              className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-coral-200/70"
              aria-hidden
            />
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted">
          Drop a screenshot. Paste an email. Say it out loud. Plotto quietly
          pulls out the dates, reminders, and things you&apos;d otherwise
          forget — and shows them back to you as a calm timeline you can trust.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-base font-semibold text-accent-fg shadow-sm transition hover:bg-accent-strong"
          >
            Try it free
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-xl border border-line-strong bg-card px-5 py-3 text-base font-semibold text-fg hover:border-line-strong"
          >
            I have an account
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            title: 'Capture anything',
            body: 'Share-sheet from any app, paste text, or talk. Plotto handles the rest.',
          },
          {
            title: 'Understands context',
            body: 'It infers the date, the stakes, and whether you need a gentle nudge or an alarm.',
          },
          {
            title: 'One calm timeline',
            body: 'No infinite calendar grid. Just what matters, in the order it matters.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-line bg-card p-5"
          >
            <div className="mb-3 h-1.5 w-8 rounded-full bg-accent" aria-hidden />
            <h3 className="mb-1.5 text-base font-semibold text-fg">
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed text-fg-muted">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-line bg-card/50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-fg-muted">
          <span>© {new Date().getFullYear()} Plotto · Early preview</span>
          <nav className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-fg">
              Privacy
            </Link>
            <Link href="/tos" className="hover:text-fg">
              Terms
            </Link>
            <a
              href="mailto:support@getplotto.com"
              className="hover:text-fg"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}

