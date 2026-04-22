import Link from 'next/link';
import SignInForm from './sign-in-form';

export const metadata = {
  title: 'Sign in · Plotto',
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-2 text-ink-900">
          <div className="h-8 w-2 rounded-full bg-coral-500" aria-hidden />
          <span className="text-xl font-semibold tracking-tight">Plotto</span>
        </Link>
        <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-ink-900">
            Welcome back
          </h1>
          <p className="mb-6 text-sm text-ink-500">
            Enter your email and we&apos;ll send you a magic link.
          </p>
          <SignInForm />
        </div>
        <p className="mt-6 text-center text-xs text-ink-400">
          By signing in you agree to treat early Plotto as rough around the edges.
        </p>
      </div>
    </main>
  );
}
