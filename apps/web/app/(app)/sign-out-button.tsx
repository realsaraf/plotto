'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function onClick() {
    setLoading(true);
    await supabaseBrowser().auth.signOut();
    router.push('/');
    router.refresh();
  }
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-fg-muted hover:text-fg disabled:opacity-50"
    >
      {loading ? '…' : 'Sign out'}
    </button>
  );
}
