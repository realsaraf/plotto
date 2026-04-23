import Link from 'next/link';
import PlottoMark from '@/components/plotto-mark';

export const metadata = {
  title: 'Privacy · Plotto',
  description: 'How Plotto handles your data.',
};

export const dynamic = 'force-static';

const EFFECTIVE = 'April 2026';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface text-fg">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <PlottoMark className="h-8 w-8 shrink-0" />
          <span className="text-lg font-semibold tracking-tight">Plotto</span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-fg-muted hover:text-fg"
        >
          ← Back
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 pb-20 pt-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-fg-muted">Effective {EFFECTIVE}</p>

        <div className="prose prose-ink mt-10 space-y-6 text-[15px] leading-relaxed text-fg-muted">
          <p>
            Plotto is an early-preview personal timeline assistant. This policy
            explains what we collect, why, and how to get rid of it. Plain
            language only — no dark patterns.
          </p>

          <h2 className="text-xl font-semibold text-fg">What we collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Account identifiers.</strong> Your email address and, if
              you sign in with Google or Apple, the basic profile fields those
              providers return (name, email, a stable user ID).
            </li>
            <li>
              <strong>Phone number (optional).</strong> Only if you choose to
              verify one for reminders. Verification runs through Twilio Verify.
            </li>
            <li>
              <strong>Work schedule and preferences.</strong> The quiet hours,
              reminder channels, and settings you enter.
            </li>
            <li>
              <strong>Your captured content.</strong> Anything you paste, share,
              type, or speak into Plotto so it can be turned into timeline items.
            </li>
            <li>
              <strong>Product analytics and error logs.</strong> Pageviews,
              feature usage, and crash traces — used to fix bugs and prioritize
              what to build next.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-fg">
            Why we collect it
          </h2>
          <p>
            To run the service you asked for: extract dates and reminders from
            what you capture, show them back to you, and nudge you if you opted
            in to reminders. We do not sell your data. We do not use your
            captured content to train public models.
          </p>

          <h2 className="text-xl font-semibold text-fg">
            Who processes it
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Supabase</strong> — authentication, Postgres database, and
              file storage (US region).
            </li>
            <li>
              <strong>Vercel</strong> — hosts the web app.
            </li>
            <li>
              <strong>OpenAI / Anthropic</strong> — language models used to
              extract structured timeline items from your captured content.
              Requests are made server-side with content retention disabled
              where the provider supports it.
            </li>
            <li>
              <strong>Twilio</strong> — phone verification and SMS reminders, if
              you opt in.
            </li>
            <li>
              <strong>PostHog</strong> — product analytics.
            </li>
            <li>
              <strong>Sentry</strong> — error monitoring.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-fg">Cookies</h2>
          <p>
            Plotto uses strictly-necessary cookies for Supabase authentication,
            plus a PostHog cookie for product analytics. No advertising cookies.
          </p>

          <h2 className="text-xl font-semibold text-fg">Your choices</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              You can export or delete your data at any time by emailing{' '}
              <a
                className="text-accent underline"
                href="mailto:privacy@getplotto.com"
              >
                privacy@getplotto.com
              </a>
              . Deletion is permanent and typically completes within 30 days.
            </li>
            <li>
              You can revoke Google or Apple sign-in access from their
              respective account dashboards at any time.
            </li>
            <li>
              You can turn off phone or email reminders from{' '}
              <Link href="/settings" className="text-accent underline">
                Settings
              </Link>
              .
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-fg">Children</h2>
          <p>Plotto is not directed at children under 13 and should not be used by them.</p>

          <h2 className="text-xl font-semibold text-fg">
            Changes to this policy
          </h2>
          <p>
            If we change anything material, we will update the effective date
            above and, for logged-in users, show an in-app notice the next time
            you open Plotto.
          </p>

          <h2 className="text-xl font-semibold text-fg">Contact</h2>
          <p>
            Questions?{' '}
            <a
              className="text-accent underline"
              href="mailto:privacy@getplotto.com"
            >
              privacy@getplotto.com
            </a>
            .
          </p>
        </div>
      </article>

      <footer className="border-t border-line bg-card/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6 text-xs text-fg-muted">
          <span>© {new Date().getFullYear()} Plotto</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-fg">
              Privacy
            </Link>
            <Link href="/tos" className="hover:text-fg">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
