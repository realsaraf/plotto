'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function SignInForm({ initialError }: { initialError: string | null }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    initialError ? 'error' : 'idle',
  );
  const [oauthProvider, setOauthProvider] = useState<null | 'google' | 'apple'>(null);
  const [message, setMessage] = useState<string | null>(initialError);

  function callbackUrl() {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/auth/callback?next=/timeline`;
  }

  async function signInWithProvider(provider: 'google' | 'apple') {
    setOauthProvider(provider);
    setStatus('idle');
    setMessage(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl(),
      },
    });
    if (error) {
      setOauthProvider(null);
      setStatus('error');
      setMessage(error.message);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setOauthProvider(null);
    setMessage(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl(),
      },
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
      return;
    }
    setStatus('sent');
    setMessage('Check your inbox for a magic link.');
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => signInWithProvider('google')}
          disabled={status === 'sending' || oauthProvider !== null}
          className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-sm transition hover:border-ink-300 hover:bg-paper-50 focus:outline-none focus:ring-2 focus:ring-coral-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {oauthProvider === 'google' ? 'Opening Google…' : 'Continue with Google'}
        </button>
        <button
          type="button"
          onClick={() => signInWithProvider('apple')}
          disabled={status === 'sending' || oauthProvider !== null}
          className="w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-sm transition hover:border-ink-300 hover:bg-paper-50 focus:outline-none focus:ring-2 focus:ring-coral-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {oauthProvider === 'apple' ? 'Opening Apple…' : 'Continue with Apple'}
        </button>
      </div>

      <div className="relative py-1">
        <div className="border-t border-ink-100" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-medium uppercase tracking-wider text-ink-400">
          Or use magic link
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-ink-900 placeholder:text-ink-400 focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'sending' || oauthProvider !== null}
          className="w-full rounded-lg bg-coral-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-600 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send magic link'}
        </button>
      </form>

      {message && (
        <p
          className={
            status === 'error'
              ? 'text-sm text-red-700'
              : 'text-sm text-ink-600'
          }
        >
          {message}
        </p>
      )}
      <p className="text-xs text-ink-500">
        Same verified email means the Google, Apple, and magic-link identities will
        be linked to one Plotto account.
      </p>
    </div>
  );
}
