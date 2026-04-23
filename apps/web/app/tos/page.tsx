import Link from 'next/link';
import PlottoMark from '@/components/plotto-mark';

export const metadata = {
  title: 'Terms of Service · Plotto',
  description: 'The terms you agree to when using Plotto.',
};

export const dynamic = 'force-static';

const EFFECTIVE = 'April 2026';

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-fg-muted">Effective {EFFECTIVE}</p>

        <div className="prose prose-ink mt-10 space-y-6 text-[15px] leading-relaxed text-fg-muted">
          <p>
            These terms govern your use of Plotto (&quot;the service&quot;). By
            creating an account or signing in, you agree to them. Plotto is an
            early-preview product, so please read the rough-edges paragraph
            below — it matters.
          </p>

          <h2 className="text-xl font-semibold text-fg">Your account</h2>
          <p>
            You are responsible for the activity on your account. Keep your
            sign-in method secure. One person per account.
          </p>

          <h2 className="text-xl font-semibold text-fg">Acceptable use</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Do not use Plotto to harass, defraud, or harm anyone.</li>
            <li>Do not upload content you do not have the right to share.</li>
            <li>
              Do not attempt to disrupt the service, probe for vulnerabilities
              without permission, or abuse shared resources.
            </li>
            <li>
              Do not use Plotto to build a competing service or to train
              machine-learning models.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-fg">Your content</h2>
          <p>
            You own what you capture into Plotto. You grant us a limited license
            to store and process it solely so the service can work for you
            (extraction, search, reminders, backups).
          </p>

          <h2 className="text-xl font-semibold text-fg">
            Early preview — rough edges
          </h2>
          <p>
            Plotto is under active development. Features may change, break, or
            disappear. Data loss is unlikely but possible during this period.
            Keep a backup of anything irreplaceable.
          </p>

          <h2 className="text-xl font-semibold text-fg">Termination</h2>
          <p>
            You can close your account at any time from{' '}
            <Link href="/settings" className="text-accent underline">
              Settings
            </Link>{' '}
            or by emailing{' '}
            <a
              className="text-accent underline"
              href="mailto:support@getplotto.com"
            >
              support@getplotto.com
            </a>
            . We may suspend or terminate accounts that violate these terms or
            put the service at risk.
          </p>

          <h2 className="text-xl font-semibold text-fg">
            Disclaimers and liability
          </h2>
          <p>
            The service is provided &quot;as is&quot; without warranties of any
            kind. To the maximum extent permitted by law, Plotto is not liable
            for indirect, incidental, or consequential damages. Nothing in these
            terms limits liability that cannot be limited under applicable law.
          </p>

          <h2 className="text-xl font-semibold text-fg">
            Changes to the service and these terms
          </h2>
          <p>
            We may update the service and these terms. Material changes will be
            announced in-app and reflected in the effective date above. Continued
            use after a change means you accept the new terms.
          </p>

          <h2 className="text-xl font-semibold text-fg">Contact</h2>
          <p>
            Questions?{' '}
            <a
              className="text-accent underline"
              href="mailto:support@getplotto.com"
            >
              support@getplotto.com
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
