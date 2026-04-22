'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setMessage(null);
    const supabase = supabaseBrowser();
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
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
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-coral-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-600 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send magic link'}
      </button>
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
    </form>
  );
}
